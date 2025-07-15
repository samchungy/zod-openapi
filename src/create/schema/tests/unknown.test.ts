import * as z from 'zod/v4';

import { type SchemaResult, createSchema } from '../schema';

describe('unknown', () => {
  it('should create an empty schema for unknown', () => {
    const schema = z.unknown();

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {},
      components: {},
    });
  });

  it('should create an empty schema for any', () => {
    const schema = z.any();

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {},
      components: {},
    });
  });

  it('should create an empty schema for any optional', () => {
    const schema = z.any().optional();

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {},
      components: {},
    });
  });

  it('should create an empty schema for unknown optional', () => {
    const schema = z.unknown().optional();

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {},
      components: {},
    });
  });
});
