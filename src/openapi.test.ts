import { satisfiesVersion } from './openapi';

describe('satisfiesVersion', () => {
  it('returns true for matching versions', () => {
    expect(satisfiesVersion('3.1.0', '3.1.0')).toBe(true);
  });

  it('returns true when version is higher than comparison', () => {
    expect(satisfiesVersion('3.1.0', '3.0.0')).toBe(true);
  });

  it('returns false when version is lower than comparison', () => {
    expect(satisfiesVersion('3.0.0', '3.1.0')).toBe(false);
  });
});
