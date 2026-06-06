import { isAnyZodType } from '../zod.js';

import type { ComponentRegistry } from './components.js';
import type {
  ZodOpenApiContentObject,
  ZodOpenApiEncodingObject,
  ZodOpenApiEncodingPropertyObject,
  ZodOpenApiMediaTypeObject,
} from './document.js';
import { createExamples } from './examples.js';
import { createHeaders } from './headers.js';

import type { oas32 } from '@zod-openapi/openapi3-ts';

export const createMediaTypeObject = (
  mediaType: ZodOpenApiMediaTypeObject,
  ctx: {
    registry: ComponentRegistry;
    io: 'input' | 'output';
  },
  path: string[],
): oas32.MediaTypeObject => {
  const { schema, itemSchema, examples, encoding, itemEncoding, prefixEncoding, ...rest } = mediaType;

  const mediaTypeObject: oas32.MediaTypeObject = rest;

  if (isAnyZodType(schema)) {
    const schemaObject = ctx.registry.addSchema(schema, [...path, 'schema'], {
      io: ctx.io,
      source: { type: 'mediaType' },
    });
    mediaTypeObject.schema = schemaObject;
  } else if (schema) {
    // If schema is not a Zod type, it might be an OpenAPI schema object
    // or a custom object. We assume it's already in the correct format.
    mediaTypeObject.schema = schema;
  }

  if (isAnyZodType(itemSchema)) {
    const itemSchemaObject = ctx.registry.addSchema(itemSchema, [...path, 'itemSchema'], {
      io: ctx.io,
      source: { type: 'mediaType' },
    });
    mediaTypeObject.itemSchema = itemSchemaObject;
  } else if (itemSchema) {
    mediaTypeObject.itemSchema = itemSchema;
  }

  if (examples) {
    mediaTypeObject.examples = createExamples(examples, ctx.registry, [
      ...path,
      'examples',
    ]);
  }

  if (encoding) {
    mediaTypeObject.encoding = createEncodingObject(encoding, ctx, [...path, 'encoding']);
  }

  if (itemEncoding) {
    mediaTypeObject.itemEncoding = createEncodingProperty(itemEncoding, ctx, [...path, 'itemEncoding']);
  }

  if (prefixEncoding) {
    mediaTypeObject.prefixEncoding = prefixEncoding.map(encodingPrefix => createEncodingProperty(encodingPrefix, ctx, [...path, 'prefixEncoding']));
  }

  return mediaTypeObject;
};

export const createContent = (
  content: ZodOpenApiContentObject,
  ctx: {
    registry: ComponentRegistry;
    io: 'input' | 'output';
  },
  path: string[],
): oas32.ContentObject => {
  const contentObject: oas32.ContentObject = {};
  for (const [mediaType, mediaTypeObject] of Object.entries(content)) {
    if (mediaTypeObject) {
      contentObject[mediaType] = createMediaTypeObject(mediaTypeObject, ctx, [
        ...path,
        mediaType,
      ]);
    }
  }
  return contentObject;
};

const createEncodingObject = (
  encoding: ZodOpenApiEncodingObject,
  ctx: {
    registry: ComponentRegistry;
    io: 'input' | 'output';
  },
  path: string[],
): oas32.EncodingObject => {
  const encodingObject: oas32.EncodingObject = {};
  for (const [property, encodingProperty] of Object.entries(encoding)) {
    encodingObject[property] = createEncodingProperty(encodingProperty, ctx, [...path, property]);
  }
  return encodingObject;
};

export const createEncodingProperty = (
  encodingProperty: ZodOpenApiEncodingPropertyObject,
  ctx: {
    registry: ComponentRegistry;
    io: 'input' | 'output';
  },
  path: string[],
): oas32.EncodingPropertyObject => {
  const { headers, encoding, prefixEncoding, itemEncoding, ...rest } = encodingProperty;

  const encodingPropertyObject: oas32.EncodingPropertyObject = rest;

  if (headers) {
    encodingPropertyObject.headers = createHeaders(headers, ctx.registry, [...path, 'headers']);
  }

  if (encoding) {
    encodingPropertyObject.encoding = createEncodingObject(encoding, ctx, [...path, 'encoding']);
  }

  if (prefixEncoding) {
    encodingPropertyObject.prefixEncoding = prefixEncoding.map(encodingPrefix => createEncodingProperty(encodingPrefix, ctx, [...path, 'prefixEncoding']));
  }

  if (itemEncoding) {
    encodingPropertyObject.itemEncoding = createEncodingProperty(itemEncoding, ctx, [...path, 'itemEncoding']);
  }

  return encodingPropertyObject;
};
