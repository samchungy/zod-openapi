import type { oas31 } from '../openapi3-ts/dist';
import { isAnyZodType } from '../zod';

import type { ComponentRegistry } from './components';
import type {
  ZodOpenApiContentObject,
  ZodOpenApiMediaTypeObject,
} from './document';
import { createExamples } from './examples';

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
