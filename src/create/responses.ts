import { oas31 } from 'openapi3-ts';
import { AnyZodObject, ZodRawShape, ZodType } from 'zod';

import { ComponentsObject } from './components';
import { createContent } from './content';
import {
  ZodOpenApiResponseObject,
  ZodOpenApiResponsesObject,
} from './document';
import { createBaseParameter } from './parameters';
import { createSchemaOrRef } from './schema';
import { isISpecificationExtension } from './specificationExtension';

export const createResponseHeaders = (
  responseHeaders: AnyZodObject | undefined,
  components: ComponentsObject,
): oas31.ResponseObject['headers'] => {
  if (!responseHeaders) {
    return undefined;
  }

  return Object.entries(responseHeaders.shape as ZodRawShape).reduce<
    NonNullable<oas31.ResponseObject['headers']>
  >((acc, [key, zodSchema]: [string, ZodType]) => {
    acc[key] = createHeaderOrRef(zodSchema, components);
    return acc;
  }, {});
};

const createHeaderOrRef = (
  schema: ZodType,
  components: ComponentsObject,
): oas31.BaseParameterObject | oas31.ReferenceObject => {
  const ref = schema?._def?.openapi?.header?.ref;

  if (ref) {
    return createRegisteredHeader(schema, ref, components);
  }

  return createBaseHeader(schema, components);
};

export const createBaseHeader = (
  schema: ZodType,
  components: ComponentsObject,
): oas31.BaseParameterObject => {
  const { ref, ...rest } = schema._def.openapi?.header ?? {};
  const schemaOrRef = createSchemaOrRef(schema, {
    components,
    type: 'input',
  });
  const required = !schema.isOptional();
  return {
    ...rest,
    ...(schema && { schema: schemaOrRef }),
    ...(required && { required }),
  };
};

const createRegisteredHeader = (
  zodSchema: ZodType,
  ref: string,
  components: ComponentsObject,
): oas31.ReferenceObject => {
  const component = components.headers.get(zodSchema);
  if (component && component.type === 'complete') {
    if (!('$ref' in component.headerObject)) {
      throw new Error(`header "${ref}" is already registered`);
    }
    return {
      $ref: createComponentHeaderRef(ref),
    };
  }

  // Optional Objects can return a reference object
  const baseParamOrRef = createBaseParameter(zodSchema, components);
  if ('$ref' in baseParamOrRef) {
    throw new Error('Unexpected Error: received a reference object');
  }

  components.headers.set(zodSchema, {
    type: 'complete',
    headerObject: baseParamOrRef,
    ref,
  });

  return {
    $ref: createComponentHeaderRef(ref),
  };
};

export const createComponentHeaderRef = (ref: string) =>
  `#/components/headers/${ref}`;

const createHeaders = (
  headers: oas31.ResponseObject['headers'],
  responseHeaders: AnyZodObject | undefined,
  components: ComponentsObject,
): oas31.ResponseObject['headers'] => {
  if (!responseHeaders && !headers) {
    return undefined;
  }

  const createdHeaders = createResponseHeaders(responseHeaders, components);

  return {
    ...headers,
    ...createdHeaders,
  };
};

const createResponse = (
  responseObject: ZodOpenApiResponseObject | oas31.ReferenceObject,
  components: ComponentsObject,
): oas31.ResponseObject | oas31.ReferenceObject => {
  if ('$ref' in responseObject) {
    return responseObject;
  }

  const { content, headers, responseHeaders, ...rest } = responseObject;

  const maybeHeaders = createHeaders(headers, responseHeaders, components);

  return {
    ...rest,
    ...(maybeHeaders && { headers: maybeHeaders }),
    ...(content && { content: createContent(content, components, 'output') }),
  };
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
