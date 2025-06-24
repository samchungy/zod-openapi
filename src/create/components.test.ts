import { z } from 'zod/v4';

import type { oas31 } from '../openapi3-ts/dist';

import {
  createComponents,
  createIOSchemas,
  createRegistry,
} from './components';
import { createRequestBody } from './requestBody';

describe('createIOSchemas', () => {
  it('should create a schema for dynamic input types', () => {
    const zodSchema = z
      .object({
        name: z.string().meta({ id: 'input' }),
        age: z.number(),
        get foo() {
          return zodSchema;
        },
      })
      .meta({ id: 'zodSchema' });

    const nestedSchema = z.object({
      nested: zodSchema,
    });

    const registry = createRegistry();
    const opts = {};

    const requestBody = createRequestBody(
      {
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      {
        registry,
        io: 'input',
      },
      ['test'],
    );

    const nestedRequestBody = createRequestBody(
      {
        content: {
          'application/json': {
            schema: nestedSchema,
          },
        },
      },
      {
        registry,
        io: 'input',
      },
      ['test', 'nested'],
    );

    createIOSchemas({
      registry,
      io: 'input',
      opts,
    });

    expect(requestBody).toEqual<oas31.RequestBodyObject>({
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/zodSchema',
          },
        },
      },
    });

    expect(nestedRequestBody).toEqual<oas31.RequestBodyObject>({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              nested: {
                $ref: '#/components/schemas/zodSchema',
              },
            },
            required: ['nested'],
          },
        },
      },
    });

    expect(registry.schemas.ids.get('zodSchema')).toEqual<oas31.SchemaObject>({
      type: 'object',
      properties: {
        name: {
          $ref: '#/components/schemas/input',
        },
        age: {
          type: 'number',
        },
        foo: {
          $ref: '#/components/schemas/zodSchema',
        },
      },
      required: ['name', 'age', 'foo'],
    });

    expect(registry.schemas.ids.get('input')).toEqual<oas31.SchemaObject>({
      type: 'string',
    });

    const components = createComponents(registry, opts);

    expect(components.schemas).toEqual({
      zodSchema: {
        type: 'object',
        properties: {
          name: {
            $ref: '#/components/schemas/input',
          },
          age: {
            type: 'number',
          },
          foo: {
            $ref: '#/components/schemas/zodSchema',
          },
        },
        required: ['name', 'age', 'foo'],
      },
      input: {
        type: 'string',
      },
    });
  });
});
