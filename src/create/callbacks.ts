import type { oas31 } from '../openapi3-ts/dist';

import {
  type ComponentsObject,
  createComponentCallbackRef,
} from './components';
import type {
  CreateDocumentOptions,
  ZodOpenApiCallbackObject,
} from './document';
import { createPathItem } from './paths';
import { isISpecificationExtension } from './specificationExtension';

export const createCallback = (
  callbackObject: ZodOpenApiCallbackObject,
  components: ComponentsObject,
  subpath: string[],
  documentOptions?: CreateDocumentOptions,
): oas31.CallbackObject => {
  const { ref, ...callbacks } = callbackObject;

  const callback: oas31.CallbackObject = Object.entries(
    callbacks,
  ).reduce<oas31.CallbackObject>((acc, [callbackName, pathItemObject]) => {
    if (isISpecificationExtension(callbackName)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      acc[callbackName] = pathItemObject;
      return acc;
    }

    acc[callbackName] = createPathItem(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      pathItemObject,
      components,
      [...subpath, callbackName],
      documentOptions,
    );
    return acc;
  }, {});

  if (ref) {
    components.callbacks.set(callbackObject, {
      type: 'complete',
      ref,
      callbackObject: callback,
    });
    return {
      $ref: createComponentCallbackRef(ref),
    };
  }

  return callback;
};

export const createCallbacks = (
  callbacksObject: oas31.CallbackObject | undefined,
  components: ComponentsObject,
  subpath: string[],
  documentOptions?: CreateDocumentOptions,
): oas31.CallbackObject | undefined => {
  if (!callbacksObject) {
    return undefined;
  }
  return Object.entries(callbacksObject).reduce<oas31.CallbackObject>(
    (acc, [callbackName, callbackObject]) => {
      if (isISpecificationExtension(callbackName)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        acc[callbackName] = callbackObject;
        return acc;
      }

      acc[callbackName] = createCallback(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        callbackObject,
        components,
        [...subpath, callbackName],
        documentOptions,
      );
      return acc;
    },
    {},
  );
};
