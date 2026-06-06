import { isAnyZodType } from '../zod.js';

import type { ComponentRegistry } from './components.js';
import type {
  ZodOpenApiContentObject,
  ZodOpenApiMediaTypeObject,
} from './document.js';
import { createExamples } from './examples.js';

import type { oas32 } from '@zod-openapi/openapi3-ts';

export const createMediaTypeObject = (
  mediaType: ZodOpenApiMediaTypeObject,
  ctx: {
    registry: ComponentRegistry;
    io: 'input' | 'output';
  },
  path: string[],
): oas32.MediaTypeObject => {
  const { schema, itemSchema, examples, ...rest } = mediaType;

  const mediaTypeObject: oas32.MediaTypeObject = rest;

  if (isAnyZodType(schema)) {
    const schemaObject = ctx.registry.addSchema(schema, [...path, 'schema'], {
      io: ctx.io,
      source: { type: 'mediaType' },
    });
    mediaTypeObject.schema = schemaObject;
  } else {
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
  } else {
    mediaTypeObject.itemSchema = itemSchema;
  }

  if (examples) {
    mediaTypeObject.examples = createExamples(examples, ctx.registry, [
      ...path,
      'examples',
    ]);
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
