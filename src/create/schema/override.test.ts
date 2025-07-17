import * as z from 'zod/v4';

import { validate } from './override.js';

describe('validate', () => {
  it('should throw an error for a custom optional', () => {
    expect(() =>
      validate(
        {
          zodSchema: z.custom().optional(),
          jsonSchema: {},
          io: 'input',
          path: ['properties', 'zodOpenApiCreateSchema'],
        },
        {},
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Zod schema of type \`custom\` at properties > zodOpenApiCreateSchema cannot be represented in OpenAPI. Please assign it metadata with \`.meta()\`"`,
    );
  });

  it('should throw an error for a void', () => {
    expect(() =>
      validate(
        {
          zodSchema: z.void(),
          jsonSchema: {},
          io: 'input',
          path: ['properties', 'zodOpenApiCreateSchema'],
        },
        {},
      ),
    ).toThrow(
      'Zod schema of type `void` at properties > zodOpenApiCreateSchema cannot be represented in OpenAPI. Please assign it metadata with `.meta()`',
    );
  });

  it('should throw an error for a map', () => {
    expect(() =>
      validate(
        {
          zodSchema: z.map(z.string(), z.number()),
          jsonSchema: {},
          io: 'input',
          path: ['properties', 'zodOpenApiCreateSchema'],
        },
        {},
      ),
    ).toThrow(
      'Zod schema of type `map` at properties > zodOpenApiCreateSchema cannot be represented in OpenAPI. Please assign it metadata with `.meta()`',
    );
  });

  it('allows an empty schema for a transform output when allowEmptySchemas is set', () => {
    const schema = z.string().transform((str) => str.length);

    validate(
      {
        zodSchema: schema,
        jsonSchema: {},
        io: 'output',
        path: ['properties', 'zodOpenApiCreateSchema'],
      },
      {
        allowEmptySchema: { pipe: { output: true } },
      },
    );
  });
});
