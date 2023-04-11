import { oas31 } from 'openapi3-ts';
import { AnyZodObject, ZodType } from 'zod';

import { isISpecificationExtension } from '../specificationExtension';

import { Components } from './components';
import { createContent } from './content';
import {
  ZodOpenApiResponseObject,
  ZodOpenApiResponsesObject,
} from './document';
import { createBaseParameter } from './parameters';

export const createResponseHeaders = (
  responseHeaders: AnyZodObject | undefined,
  components: Components,
): oas31.ResponseObject['headers'] => {
  if (!responseHeaders) {
    return undefined;
  }

  return Object.entries(responseHeaders).reduce<
    NonNullable<oas31.ResponseObject['headers']>
  >((acc, [key, zodSchema]: [string, ZodType]) => {
    acc[key] = createBaseParameter(zodSchema, components);
    return acc;
  }, {});
};

export const createHeaders = (
  responseObject: ZodOpenApiResponseObject,
  components: Components,
): oas31.ResponseObject['headers'] => {
  const { responseHeaders, headers } = responseObject;

  if (!responseHeaders && !headers) {
    return undefined;
  }

  const createdHeaders = createResponseHeaders(responseHeaders, components);

  return {
    ...headers,
    ...createdHeaders,
  };
};

export const createResponse = (
  responseObject: ZodOpenApiResponseObject | oas31.ReferenceObject,
  components: Components,
): oas31.ResponseObject | oas31.ReferenceObject => {
  if ('$ref' in responseObject) {
    return responseObject;
  }

  const { content, ...rest } = responseObject;

  return {
    ...rest,
    headers: createHeaders(responseObject, components),
    ...(content && { content: createContent(content, components) }),
  };
};

export const createResponses = (
  responsesObject: ZodOpenApiResponsesObject,
  components: Components,
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
      acc[path] = createResponse(responseObject, components);
      return acc;
    },
    {},
  );
