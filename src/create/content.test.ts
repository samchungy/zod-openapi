import * as z from 'zod/v4';

import type { oas31 } from '../openapi3-ts/dist';

import { createRegistry } from './components';
import { createContent } from './content';

describe('createContent', () => {
  it('should create a content object with a media type', () => {
    const zodSchema = z.object({
      name: z.string(),
      age: z.number(),
    });
    const registry = createRegistry();
    const content: oas31.ContentObject = createContent(
      {
        'application/json': {
          schema: zodSchema,
        },
      },
      {
        registry,
        io: 'output',
      },
      ['test'],
    );

    expect(content).toEqual<oas31.ContentObject>({
      'application/json': {
        schema: {},
      },
    });

    expect(
      registry.components.schemas.output.get(
        'test > application/json > schema',
      ),
    ).toEqual({
      schemaObject: {},
      zodType: zodSchema,
      source: {
        type: 'mediaType',
        path: ['test', 'application/json', 'schema'],
      },
    });
  });

  it('should create a content object with a media type and examples', () => {
    const zodSchema = z.object({
      name: z.string(),
      age: z.number(),
    });
    const registry = createRegistry();
    const content: oas31.ContentObject = createContent(
      {
        'application/json': {
          schema: zodSchema,
          examples: {
            example1: {
              summary: 'Example 1',
              value: { name: 'John', age: 30 },
            },
          },
        },
      },
      {
        registry,
        io: 'output',
      },
      ['test'],
    );

    expect(content).toEqual<oas31.ContentObject>({
      'application/json': {
        schema: {},
        examples: {
          example1: {
            summary: 'Example 1',
            value: { name: 'John', age: 30 },
          },
        },
      },
    });
  });
});
