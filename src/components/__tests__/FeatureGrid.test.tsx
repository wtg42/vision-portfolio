import { render, screen } from '@testing-library/react';
import FeatureGrid from '../FeatureGrid';

/** 確認功能區塊呈現三項特色 */
test('renders all features', () => {
  render(<FeatureGrid />);
  expect(screen.getByText('Landscape')).toBeInTheDocument();
  expect(screen.getByText('Portraits')).toBeInTheDocument();
  expect(screen.getByText('Urban')).toBeInTheDocument();
});
