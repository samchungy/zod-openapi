import { z } from 'zod/v4';

import { isRequired, unwrapZodObject } from './object';

describe('unwrapZodObject', () => {
  it('should handle a ZodObject', () => {
    const zodObject = z.object({});
    const result = unwrapZodObject(zodObject, 'input', []);
    expect(result).toEqual(zodObject);
  });

  it('should handle a zod transform', () => {
    const zodObject = z.object({});
    const zodPipe = zodObject.transform((data) => data);
    const result = unwrapZodObject(zodPipe, 'input', []);
    expect(result).toEqual(zodObject);
  });

  it('should handle a zod lazy', () => {
    const zodObject = z.object({});
    const zodLazy = z.lazy(() => zodObject);
    const result = unwrapZodObject(zodLazy, 'input', []);
    expect(result).toEqual(zodObject);
  });

  it('should handle a branded zod object', () => {
    const zodObject = z.object({}).brand('test');
    const result = unwrapZodObject(zodObject, 'input', []);
    expect(result).toEqual(zodObject);
  });
});

describe('isRequired', () => {
  it('should return true for required input type', () => {
    const zodType = z.string();
    const result = isRequired(zodType, 'input');
    expect(result).toBe(true);
  });

  it('should return false for optional input type', () => {
    const zodType = z.string().optional();
    const result = isRequired(zodType, 'input');
    expect(result).toBe(false);
  });

  it('should return false for default input type', () => {
    const zodType = z.string().default('default');
    const result = isRequired(zodType, 'input');
    expect(result).toBe(false);
  });

  it('should return true for a default output type', () => {
    const zodType = z.string().default('default');
    const result = isRequired(zodType, 'output');
    expect(result).toBe(true);
  });

  it('should return true for required output type', () => {
    const zodType = z.string();
    const result = isRequired(zodType, 'output');
    expect(result).toBe(true);
  });

  it('should return false for optional output type', () => {
    const zodType = z.string().optional();
    const result = isRequired(zodType, 'output');
    expect(result).toBe(false);
  });
});
