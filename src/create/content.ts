import { ZodType } from 'zod';

import { oas31 } from '../openapi3-ts/dist';

import { ComponentsObject, CreationType } from './components';
import { ZodOpenApiContentObject, ZodOpenApiMediaTypeObject } from './document';
import { createSchemaOrRef } from './schema';

const createMediaTypeSchema = (
  schemaObject:
    | ZodType
    | oas31.SchemaObject
    | oas31.ReferenceObject
    | undefined,
  components: ComponentsObject,
  type: CreationType,
): oas31.SchemaObject | oas31.ReferenceObject | undefined => {
  if (!schemaObject) {
    return undefined;
  }

  if (!(schemaObject instanceof ZodType)) {
    return schemaObject;
  }

  return createSchemaOrRef(schemaObject, {
    components,
    type,
  });
};

const createMediaTypeObject = (
  mediaTypeObject: ZodOpenApiMediaTypeObject | undefined,
  components: ComponentsObject,
  type: CreationType,
): oas31.MediaTypeObject | undefined => {
  if (!mediaTypeObject) {
    return undefined;
  }

  return {
    ...mediaTypeObject,
    schema: createMediaTypeSchema(mediaTypeObject.schema, components, type),
  };
};

export const createContent = (
  contentObject: ZodOpenApiContentObject,
  components: ComponentsObject,
  type: CreationType,
): oas31.ContentObject =>
  Object.entries(contentObject).reduce<oas31.ContentObject>(
    (acc, [path, zodOpenApiMediaTypeObject]): oas31.ContentObject => {
      const mediaTypeObject = createMediaTypeObject(
        zodOpenApiMediaTypeObject,
        components,
        type,
      );

      if (mediaTypeObject) {
        acc[path] = mediaTypeObject;
      }
      return acc;
    },
    {},
  );
