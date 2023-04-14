import { isISpecificationExtension } from './specificationExtension';

describe('isISpecificationExtension', () => {
  it('returns true for strings starting with x-', () => {
    expect(isISpecificationExtension('x-someString')).toBe(true);
  });

  it('returns false for strings not starting with x-', () => {
    expect(isISpecificationExtension('xsomeString')).toBe(false);
  });
});
