import { ZodType } from 'zod';

import type { oas31 } from '../openapi3-ts/dist';

import type { ComponentsObject, CreationType } from './components';
import type {
  ZodOpenApiContentObject,
  ZodOpenApiMediaTypeObject,
} from './document';
import { createSchemaOrRef, newSchemaState } from './schema';

const createMediaTypeSchema = (
  schemaObject:
    | ZodType
    | oas31.SchemaObject
    | oas31.ReferenceObject
    | undefined,
  components: ComponentsObject,
  type: CreationType,
  subpath: string[],
): oas31.SchemaObject | oas31.ReferenceObject | undefined => {
  if (!schemaObject) {
    return undefined;
  }

  if (!(schemaObject instanceof ZodType)) {
    return schemaObject;
  }

  return createSchemaOrRef(
    schemaObject,
    newSchemaState({
      components,
      type,
      path: [],
      visited: new Set(),
    }),
    subpath,
  );
};

const createMediaTypeObject = (
  mediaTypeObject: ZodOpenApiMediaTypeObject | undefined,
  components: ComponentsObject,
  type: CreationType,
  subpath: string[],
): oas31.MediaTypeObject | undefined => {
  if (!mediaTypeObject) {
    return undefined;
  }

  return {
    ...mediaTypeObject,
    schema: createMediaTypeSchema(mediaTypeObject.schema, components, type, [
      ...subpath,
      'schema',
    ]),
  };
};

export const createContent = (
  contentObject: ZodOpenApiContentObject,
  components: ComponentsObject,
  type: CreationType,
  subpath: string[],
): oas31.ContentObject =>
  Object.entries(contentObject).reduce<oas31.ContentObject>(
    (acc, [mediaType, zodOpenApiMediaTypeObject]): oas31.ContentObject => {
      const mediaTypeObject = createMediaTypeObject(
        zodOpenApiMediaTypeObject,
        components,
        type,
        [...subpath, mediaType],
      );

      if (mediaTypeObject) {
        acc[mediaType] = mediaTypeObject;
      }
      return acc;
    },
    {},
  );
