import { oas31 } from 'openapi3-ts';
import { AnyZodObject, ZodType } from 'zod';

import { isISpecificationExtension } from '../../specificationExtension';
import {
  ZodOpenApiContentObject,
  ZodOpenApiMediaTypeObject,
  ZodOpenApiResponseObject,
  ZodOpenApiResponsesObject,
} from '../document';
import { createSchemaOrRef } from '../schema';

export const createMediaTypeSchema = (
  schemaObject?: AnyZodObject | oas31.SchemaObject | oas31.ReferenceObject,
): oas31.SchemaObject | oas31.ReferenceObject | undefined => {
  if (!schemaObject) {
    return undefined;
  }

  if (!(schemaObject instanceof ZodType)) {
    return schemaObject;
  }

  return createSchemaOrRef(schemaObject);
};

export const createMediaTypeObject = (
  mediaTypeObject: ZodOpenApiMediaTypeObject,
): oas31.MediaTypeObject => ({
  ...mediaTypeObject,
  schema: createMediaTypeSchema(mediaTypeObject.schema),
});

export const createContent = (
  contentObject?: ZodOpenApiContentObject,
): oas31.ContentObject | undefined => {
  if (!contentObject) {
    return undefined;
  }

  return Object.entries(contentObject).reduce<oas31.ContentObject>(
    (acc, [path, mediaTypeObject]): oas31.ContentObject => {
      acc[path] = createMediaTypeObject(mediaTypeObject);
      return acc;
    },
    {},
  );
};

export const createResponse = (
  responseObject: ZodOpenApiResponseObject | oas31.ReferenceObject,
): oas31.ResponseObject | oas31.ReferenceObject => {
  if ('$ref' in responseObject) {
    return responseObject;
  }
  return {
    ...responseObject,
    content: createContent(responseObject.content),
  };
};

export const createResponses = (
  responsesObject: ZodOpenApiResponsesObject,
): oas31.ResponsesObject =>
  Object.entries(responsesObject).reduce<oas31.ResponsesObject>(
    (
      acc,
      [path, responseObject]: [
        string,
        ZodOpenApiResponseObject | oas31.ReferenceObject,
      ],
    ): oas31.ResponsesObject => {
      if (isISpecificationExtension(path)) {
        acc[path] = responseObject;
        return acc;
      }
      acc[path] = createResponse(responseObject);
      return acc;
    },
    {},
  );
