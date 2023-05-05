import type { oas31 } from '../openapi3-ts/dist';

import {
  type ComponentsObject,
  createComponentRequestBodyRef,
} from './components';
import { createContent } from './content';
import type {
  ZodOpenApiOperationObject,
  ZodOpenApiPathItemObject,
  ZodOpenApiPathsObject,
  ZodOpenApiRequestBodyObject,
} from './document';
import { createParametersObject } from './parameters';
import { createResponses } from './responses';
import { isISpecificationExtension } from './specificationExtension';

export const createRequestBody = (
  requestBodyObject: ZodOpenApiRequestBodyObject | undefined,
  components: ComponentsObject,
): oas31.ReferenceObject | oas31.RequestBodyObject | undefined => {
  if (!requestBodyObject) {
    return undefined;
  }

  const component = components.requestBodies.get(requestBodyObject);
  if (component && component.type === 'complete') {
    return {
      $ref: createComponentRequestBodyRef(component.ref),
    };
  }

  const ref = requestBodyObject.ref ?? component?.ref;

  const requestBody: oas31.RequestBodyObject = {
    ...requestBodyObject,
    content: createContent(requestBodyObject.content, components, 'input'),
  };

  if (ref) {
    components.requestBodies.set(requestBodyObject, {
      type: 'complete',
      ref,
      requestBodyObject: requestBody,
    });
    return {
      $ref: createComponentRequestBodyRef(ref),
    };
  }

  return requestBody;
};

const createOperation = (
  operationObject: ZodOpenApiOperationObject | undefined,
  components: ComponentsObject,
): oas31.OperationObject | undefined => {
  if (!operationObject) {
    return undefined;
  }

  const { parameters, requestParams, requestBody, responses, ...rest } =
    operationObject;

  const maybeParameters = createParametersObject(
    parameters,
    requestParams,
    components,
  );

  const maybeRequestBody = createRequestBody(
    operationObject.requestBody,
    components,
  );

  const maybeResponses = createResponses(operationObject.responses, components);

  return {
    ...rest,
    ...(maybeParameters && { parameters: maybeParameters }),
    ...(maybeRequestBody && { requestBody: maybeRequestBody }),
    ...(maybeResponses && { responses: maybeResponses }),
  };
};

const createPathItem = (
  pathObject: ZodOpenApiPathItemObject,
  components: ComponentsObject,
): oas31.PathItemObject => {
  const {
    get,
    put,
    post,
    delete: del,
    options,
    head,
    patch,
    trace,
    ...rest
  } = pathObject;
  const maybeGet = createOperation(get, components);
  const maybePut = createOperation(put, components);
  const maybePost = createOperation(post, components);
  const maybeDelete = createOperation(del, components);
  const maybeOptions = createOperation(options, components);
  const maybeHead = createOperation(head, components);
  const maybePatch = createOperation(patch, components);
  const maybeTrace = createOperation(trace, components);

  return {
    ...rest,
    ...(get && { get: maybeGet }),
    ...(put && { put: maybePut }),
    ...(post && { post: maybePost }),
    ...(del && { delete: maybeDelete }),
    ...(options && { options: maybeOptions }),
    ...(head && { head: maybeHead }),
    ...(patch && { patch: maybePatch }),
    ...(trace && { trace: maybeTrace }),
  };
};

export const createPaths = (
  pathsObject: ZodOpenApiPathsObject | undefined,
  components: ComponentsObject,
): oas31.PathsObject | undefined => {
  if (!pathsObject) {
    return undefined;
  }

  return Object.entries(pathsObject).reduce<oas31.PathsObject>(
    (acc, [path, pathItemObject]): oas31.PathsObject => {
      if (isISpecificationExtension(path)) {
        acc[path] = pathItemObject;
        return acc;
      }
      acc[path] = createPathItem(pathItemObject, components);
      return acc;
    },
    {},
  );
};
