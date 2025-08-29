import { render, screen } from '@testing-library/react';
import HeroWithOverlayImage from '../HeroWithOverlayImage';

/** 確認首頁 Hero 區塊呈現標題與按鈕 */
test('renders title and button', () => {
  render(<HeroWithOverlayImage />);
  expect(screen.getByRole('heading', { name: /vision portfolio/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
});
