import { render, screen } from '@testing-library/react';
import FilmRoll from '../FilmRoll';

// mock ResizeObserver for jsdom
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(global as any).ResizeObserver = ResizeObserverMock;

test('renders category heading', () => {
  const mockImage = { src: 'test.jpg', width: 100, height: 100, format: 'jpg' } as any;
  render(<FilmRoll images={[mockImage]} category="Landscape" />);
  expect(screen.getByText('Landscape')).toBeInTheDocument();
});

test('renders multiple images', () => {
  const mockImage = { src: 'test.jpg', width: 100, height: 100, format: 'jpg' } as any;
  render(<FilmRoll images={[mockImage, mockImage]} />);
  expect(screen.getAllByRole('img')).toHaveLength(2);
});
