import type { oas31 } from '../openapi3-ts/dist';
import { isAnyZodType } from '../zod';

import type { ComponentRegistry } from './components';
import type {
  ZodOpenApiContentObject,
  ZodOpenApiMediaTypeObject,
} from './document';

export const createMediaTypeObject = (
  mediaTypeObject: ZodOpenApiMediaTypeObject,
  ctx: {
    registry: ComponentRegistry;
    io: 'input' | 'output';
  },
  path: string[],
): oas31.MediaTypeObject => {
  const computedPath = path.join(' > ');
  if (isAnyZodType(mediaTypeObject.schema)) {
    const schemaObject = ctx.registry.schemas.setSchema(
      computedPath,
      mediaTypeObject.schema,
      ctx.io,
    );
    return {
      ...mediaTypeObject,
      schema: schemaObject,
    };
  }

  return mediaTypeObject as oas31.MediaTypeObject;
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
