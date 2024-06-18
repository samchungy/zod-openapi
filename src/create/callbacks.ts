import type { oas31 } from '../openapi3-ts/dist/index';

import {
  type ComponentsObject,
  createComponentCallbackRef,
} from './components';
import type { ZodOpenApiCallbackObject } from './document';
import { createPathItem } from './paths';
import { isISpecificationExtension } from './specificationExtension';

export const createCallback = (
  callbackObject: ZodOpenApiCallbackObject,
  components: ComponentsObject,
  subpath: string[],
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    acc[callbackName] = createPathItem(pathItemObject, components, [
      ...subpath,
      callbackName,
    ]);
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      acc[callbackName] = createCallback(callbackObject, components, [
        ...subpath,
        callbackName,
      ]);
      return acc;
    },
    {},
  );
};
