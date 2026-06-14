import { describe, expect, it } from 'vitest';
import * as z from 'zod/v4';

import { createComponents, createRegistry } from './components.js';
import { createContent, createMediaTypeObject } from './content.js';

import type { oas32 } from '@zod-openapi/openapi3-ts';

describe('createContent', () => {
  it('should create a content object with a media type', () => {
    const zodSchema = z.object({
      name: z.string(),
      age: z.number(),
    });
    const registry = createRegistry();
    const content: oas32.ContentObject = createContent(
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

    expect(content).toEqual<oas32.ContentObject>({
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
    const content: oas32.ContentObject = createContent(
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

    expect(content).toEqual<oas32.ContentObject>({
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

  it('should preserve non-Zod schema objects', () => {
    const registry = createRegistry();
    const content: oas32.ContentObject = createContent(
      {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'integer' },
            },
          } as oas32.SchemaObject,
        },
      },
      {
        registry,
        io: 'output',
      },
      ['test'],
    );

    expect(content).toEqual<oas32.ContentObject>({
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'integer' },
          },
        },
      },
    });
  });

  it('should register a Zod itemSchema in the registry', () => {
    const itemSchema = z.object({ id: z.string() });
    const registry = createRegistry();
    const content = createContent(
      {
        'application/json': {
          itemSchema,
        },
      },
      { registry, io: 'output' },
      ['test'],
    );

    createComponents(registry, {}, '3.2.0');

    expect(content).toEqual<oas32.ContentObject>({
      'application/json': {
        itemSchema: {
          additionalProperties: false,
          properties: {
            id: {
              type: 'string',
            },
          },
          required: ['id'],
          type: 'object',
        },
      },
    });

    expect(
      registry.components.schemas.output.get(
        'test > application/json > itemSchema',
      ),
    ).toEqual({
      schemaObject: {
        additionalProperties: false,
        properties: {
          id: {
            type: 'string',
          },
        },
        required: ['id'],
        type: 'object',
      },
      zodType: itemSchema,
      source: {
        type: 'mediaType',
        path: ['test', 'application/json', 'itemSchema'],
      },
    });
  });

  it('should preserve a non-Zod itemSchema object', () => {
    const registry = createRegistry();
    const content = createContent(
      {
        'application/json': {
          itemSchema: { type: 'string' } as oas32.SchemaObject,
        },
      },
      { registry, io: 'output' },
      ['test'],
    );

    expect(content).toEqual<oas32.ContentObject>({
      'application/json': {
        itemSchema: { type: 'string' },
      },
    });
  });

  it('should create a content object with encoding', () => {
    const registry = createRegistry();
    const content = createContent(
      {
        'multipart/form-data': {
          schema: z.object({ file: z.string() }),
          encoding: {
            file: {
              contentType: 'application/octet-stream',
              style: 'form',
            },
          },
        },
      },
      { registry, io: 'input' },
      ['test'],
    );

    expect(content).toEqual({
      'multipart/form-data': {
        schema: {},
        encoding: {
          file: {
            contentType: 'application/octet-stream',
            style: 'form',
          },
        },
      },
    });
  });

  it('should create a content object with itemEncoding', () => {
    const registry = createRegistry();
    const content = createContent(
      {
        'multipart/form-data': {
          schema: z.object({ file: z.string() }),
          itemEncoding: {
            contentType: 'application/octet-stream',
          },
        },
      },
      { registry, io: 'input' },
      ['test'],
    );

    expect(content).toEqual({
      'multipart/form-data': {
        schema: {},
        itemEncoding: {
          contentType: 'application/octet-stream',
        },
      },
    });
  });

  it('should create a content object with prefixEncoding', () => {
    const registry = createRegistry();
    const content = createContent(
      {
        'multipart/form-data': {
          schema: z.object({ file: z.string() }),
          prefixEncoding: [
            { contentType: 'text/plain', style: 'form' },
            { contentType: 'application/json' },
          ],
        },
      },
      { registry, io: 'input' },
      ['test'],
    );

    expect(content).toEqual({
      'multipart/form-data': {
        schema: {},
        prefixEncoding: [
          { contentType: 'text/plain', style: 'form' },
          { contentType: 'application/json' },
        ],
      },
    });
  });
});

describe('createMediaTypeObject encoding', () => {
  it('should create encoding with Zod headers and register them in the registry', () => {
    const headerSchema = z.string();
    const registry = createRegistry();
    const result = createMediaTypeObject(
      {
        schema: z.object({ file: z.string() }),
        encoding: {
          file: {
            contentType: 'application/octet-stream',
            headers: z.object({
              'X-Custom-Header': headerSchema,
            }),
          },
        },
      },
      { registry, io: 'input' },
      ['test'],
    );

    expect(result).toEqual({
      schema: {},
      encoding: {
        file: {
          contentType: 'application/octet-stream',
          headers: {
            'X-Custom-Header': { required: true, schema: {} },
          },
        },
      },
    });

    expect(registry.components.headers.seen.get(headerSchema)).toEqual({
      required: true,
      schema: {},
    });
  });

  it('should create encoding with raw (non-Zod) headers', () => {
    const registry = createRegistry();
    const result = createMediaTypeObject(
      {
        encoding: {
          file: {
            headers: {
              'X-Custom-Header': { schema: { type: 'string' } },
            },
          },
        },
      },
      { registry, io: 'input' },
      ['test'],
    );

    expect(result).toEqual({
      encoding: {
        file: {
          headers: {
            'X-Custom-Header': { schema: { type: 'string' } },
          },
        },
      },
    });
  });

  it('should create encoding with nested encoding', () => {
    const registry = createRegistry();
    const result = createMediaTypeObject(
      {
        encoding: {
          outer: {
            contentType: 'multipart/form-data',
            encoding: {
              inner: { contentType: 'text/plain' },
            },
          },
        },
      },
      { registry, io: 'input' },
      ['test'],
    );

    expect(result).toEqual({
      encoding: {
        outer: {
          contentType: 'multipart/form-data',
          encoding: {
            inner: { contentType: 'text/plain' },
          },
        },
      },
    });
  });

  it('should create encoding with nested prefixEncoding and itemEncoding', () => {
    const registry = createRegistry();
    const result = createMediaTypeObject(
      {
        encoding: {
          field: {
            prefixEncoding: [{ contentType: 'text/plain' }],
            itemEncoding: { contentType: 'application/json' },
          },
        },
      },
      { registry, io: 'input' },
      ['test'],
    );

    expect(result).toEqual({
      encoding: {
        field: {
          prefixEncoding: [{ contentType: 'text/plain' }],
          itemEncoding: { contentType: 'application/json' },
        },
      },
    });
  });

  it('should not set encoding properties when not provided', () => {
    const registry = createRegistry();
    const result = createMediaTypeObject(
      { schema: z.string() },
      { registry, io: 'output' },
      ['test'],
    );

    expect(result).toEqual({ schema: {} });
    expect(result.encoding).toBeUndefined();
    expect(result.itemEncoding).toBeUndefined();
    expect(result.prefixEncoding).toBeUndefined();
  });
});
