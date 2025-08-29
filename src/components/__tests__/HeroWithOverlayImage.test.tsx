import { render, screen } from '@testing-library/react';
import HeroWithOverlayImage from '../HeroWithOverlayImage';

/** 確認首頁 Hero 區塊呈現標題 */
test('renders title without action button', () => {
  render(<HeroWithOverlayImage />);
  expect(
    screen.getByRole('heading', { name: /vision portfolio/i })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /get started/i })
  ).toBeNull();
});
