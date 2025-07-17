import z from 'zod/v4';

import type { oas31 } from '../openapi3-ts/dist/index.js';

import { createRegistry } from './components.js';
import { createHeaders } from './headers.js';

describe('createHeaders', () => {
  it('should create a header object with a schema', () => {
    const zodSchema = z.string();

    const registry = createRegistry();

    const headers = createHeaders(
      z.object({
        'X-Custom-Header': zodSchema,
      }),
      registry,
      ['test'],
    );

    expect(headers).toEqual<oas31.HeadersObject>({
      'X-Custom-Header': {
        required: true,
        schema: {},
      },
    });
  });
});

describe('createHeader', () => {
  it('should create a header object with a schema and description', () => {
    const zodSchema = z.string().describe('A custom header');

    const registry = createRegistry();

    const header = registry.addHeader(zodSchema, ['test', 'header']);

    expect(header).toEqual<oas31.HeaderObject>({
      required: true,
      description: 'A custom header',
      schema: {},
    });

    expect(registry.components.headers.seen.get(zodSchema)).toEqual(header);
  });

  it('should create a header object with meta', () => {
    const zodSchema = z.string().meta({ header: { deprecated: true } });

    const registry = createRegistry();

    const header = registry.addHeader(zodSchema, ['test', 'header']);

    expect(header).toEqual<oas31.HeaderObject>({
      required: true,
      deprecated: true,
      schema: {},
    });

    expect(registry.components.headers.seen.get(zodSchema)).toEqual(header);
  });
});
