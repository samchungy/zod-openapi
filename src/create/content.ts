import { isAnyZodType } from '../zod.js';

import type { ComponentRegistry } from './components.js';
import type {
  ZodOpenApiContentObject,
  ZodOpenApiMediaTypeObject,
} from './document.js';
import { createExamples } from './examples.js';

import type { oas31 } from '@zod-openapi/openapi3-ts';

export const createMediaTypeObject = (
  mediaType: ZodOpenApiMediaTypeObject,
  ctx: {
    registry: ComponentRegistry;
    io: 'input' | 'output';
  },
  path: string[],
): oas31.MediaTypeObject => {
  const { schema, examples, ...rest } = mediaType;

  const mediaTypeObject: oas31.MediaTypeObject = rest;

  if (isAnyZodType(schema)) {
    const schemaObject = ctx.registry.addSchema(schema, [...path, 'schema'], {
      io: ctx.io,
      source: { type: 'mediaType' },
    });
    mediaTypeObject.schema = schemaObject;
  } else {
    // If schema is not a Zod type, it might be an OpenAPI schema object
    // or a custom object. We assume it's already in the correct format.
    mediaTypeObject.schema = schema as oas31.SchemaObject;
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
): oas31.ContentObject => {
  const contentObject: oas31.ContentObject = {};
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
