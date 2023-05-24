import { type AnyZodObject, type ZodRawShape, ZodType } from 'zod';

import type { oas30, oas31 } from '../openapi3-ts/dist';

import {
  type ComponentsObject,
  createComponentResponseRef,
} from './components';
import { createContent } from './content';
import type {
  ZodOpenApiResponseObject,
  ZodOpenApiResponsesObject,
} from './document';
import { type SchemaState, createSchemaOrRef } from './schema';
import { isOptionalSchema } from './schema/optional';
import { isISpecificationExtension } from './specificationExtension';

export const createResponseHeaders = (
  responseHeaders:
    | oas31.HeadersObject
    | oas30.HeadersObject
    | AnyZodObject
    | undefined,
  components: ComponentsObject,
): oas31.ResponseObject['headers'] => {
  if (!responseHeaders) {
    return undefined;
  }

  if (responseHeaders instanceof ZodType) {
    return Object.entries(responseHeaders.shape as ZodRawShape).reduce<
      NonNullable<oas31.ResponseObject['headers']>
    >((acc, [key, zodSchema]: [string, ZodType]) => {
      acc[key] = createHeaderOrRef(zodSchema, components);
      return acc;
    }, {});
  }

  return responseHeaders as oas31.ResponseObject['headers'];
};

export const createHeaderOrRef = (
  schema: ZodType,
  components: ComponentsObject,
): oas31.BaseParameterObject | oas31.ReferenceObject => {
  const component = components.headers.get(schema);
  if (component && component.type === 'complete') {
    return {
      $ref: createComponentHeaderRef(component.ref),
    };
  }

  // Optional Objects can return a reference object
  const baseHeader = createBaseHeader(schema, components);
  if ('$ref' in baseHeader) {
    throw new Error('Unexpected Error: received a reference object');
  }

  const ref = schema._def?.openapi?.header?.ref ?? component?.ref;

  if (ref) {
    components.headers.set(schema, {
      type: 'complete',
      headerObject: baseHeader,
      ref,
    });
    return {
      $ref: createComponentHeaderRef(ref),
    };
  }

  return baseHeader;
};

export const createBaseHeader = (
  schema: ZodType,
  components: ComponentsObject,
): oas31.BaseParameterObject => {
  const { ref, ...rest } = schema._def.openapi?.header ?? {};
  const state: SchemaState = {
    components,
    type: 'output',
  };
  const schemaOrRef = createSchemaOrRef(schema, state);
  const required = !isOptionalSchema(schema, state);
  return {
    ...rest,
    ...(schema && { schema: schemaOrRef }),
    ...(required && { required }),
  };
};

export const createComponentHeaderRef = (ref: string) =>
  `#/components/headers/${ref}`;

export const createResponse = (
  responseObject: ZodOpenApiResponseObject | oas31.ReferenceObject,
  components: ComponentsObject,
): oas31.ResponseObject | oas31.ReferenceObject => {
  if ('$ref' in responseObject) {
    return responseObject;
  }

  const component = components.responses.get(responseObject);
  if (component && component.type === 'complete') {
    return { $ref: createComponentResponseRef(component.ref) };
  }

  const { content, headers, ref, ...rest } = responseObject;

  const maybeHeaders = createResponseHeaders(headers, components);

  const response: oas31.ResponseObject = {
    ...rest,
    ...(maybeHeaders && { headers: maybeHeaders }),
    ...(content && { content: createContent(content, components, 'output') }),
  };

  const responseRef = ref ?? component?.ref;

  if (responseRef) {
    components.responses.set(responseObject, {
      responseObject: response,
      ref: responseRef,
      type: 'complete',
    });
    return {
      $ref: createComponentResponseRef(responseRef),
    };
  }

  return response;
};

export const createResponses = (
  responsesObject: ZodOpenApiResponsesObject,
  components: ComponentsObject,
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
