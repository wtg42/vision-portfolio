import { render, screen } from '@testing-library/react';
import FeatureGrid from '../FeatureGrid';

/** 確認功能區塊呈現三項特色並可跳轉 */
test('renders feature links', () => {
  render(<FeatureGrid />);
  const landscape = screen.getByRole('link', { name: 'Landscape' });
  expect(landscape).toHaveAttribute('href', '/gallery?category=Landscape');
  const portraits = screen.getByRole('link', { name: 'Portraits' });
  expect(portraits).toHaveAttribute('href', '/gallery?category=Portraits');
  const urban = screen.getByRole('link', { name: 'Urban' });
  expect(urban).toHaveAttribute('href', '/gallery?category=Urban');
});
