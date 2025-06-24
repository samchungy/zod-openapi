import z from 'zod/v4';

import type { oas31 } from '../openapi3-ts/dist';

import { createRegistry } from './components';
import { createHeader, createHeaders } from './headers';

describe('createHeaders', () => {
  it('should create a header object with a schema', () => {
    const zodSchema = z.string();

    const registry = createRegistry();

    const headers = createHeaders(
      z.object({
        'X-Custom-Header': zodSchema,
      }),
      {
        registry,
        io: 'output',
      },
      ['test'],
    );

    expect(headers).toEqual<oas31.HeadersObject>({
      'X-Custom-Header': {
        schema: {},
      },
    });
  });
});

describe('createHeader', () => {
  it('should create a header object with a schema and description', () => {
    const zodSchema = z.string().describe('A custom header');

    const registry = createRegistry();

    const header = createHeader(
      zodSchema,
      {
        registry,
        io: 'output',
      },
      ['test', 'header'],
    );

    expect(header).toEqual<oas31.HeaderObject>({
      description: 'A custom header',
      schema: {},
    });

    expect(registry.headers.seen.get(zodSchema)).toEqual(header);
  });

  it('should create a header object with meta', () => {
    const zodSchema = z.string().meta({ header: { deprecated: true } });

    const registry = createRegistry();

    const header = createHeader(
      zodSchema,
      {
        registry,
        io: 'output',
      },
      ['test', 'header'],
    );

    expect(header).toEqual<oas31.HeaderObject>({
      deprecated: true,
      schema: {},
    });

    expect(registry.headers.seen.get(zodSchema)).toEqual(header);
  });
});
