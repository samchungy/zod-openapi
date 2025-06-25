import type { oas31 } from '../openapi3-ts/dist';

import type { ComponentRegistry } from './components';
import type {
  ZodOpenApiCallbackObject,
  ZodOpenApiPathItemObject,
} from './document';
import { createPathItem } from './paths';
import { isISpecificationExtension } from './specificationExtension';

export const createCallback = (
  callbackObject: ZodOpenApiCallbackObject,
  registry: ComponentRegistry,
  path: string[],
): ZodOpenApiCallbackObject | oas31.ReferenceObject => {
  const seenCallback = registry.callbacks.seen.get(callbackObject);
  if (seenCallback) {
    return seenCallback;
  }

  const { id, ...rest } = callbackObject;

  const callback: oas31.CallbackObject = {};
  for (const [name, pathItem] of Object.entries(rest)) {
    if (isISpecificationExtension(name)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      callback[name] = pathItem;
      continue;
    }

    callback[name] = createPathItem(
      pathItem as ZodOpenApiPathItemObject,
      registry,
      [...path, name],
    );
  }

  if (id) {
    const ref: oas31.ReferenceObject = {
      $ref: `#/components/callbacks/${id}`,
    };
    registry.callbacks.ids.set(id, callback);
    registry.callbacks.seen.set(callbackObject, ref);
    return ref;
  }

  registry.callbacks.seen.set(callbackObject, callback);
  return callback;
};

export const createCallbacks = (
  callbacks: oas31.CallbackObject | undefined,
  registry: ComponentRegistry,
  path: string[],
): oas31.CallbackObject | undefined => {
  if (!callbacks) {
    return undefined;
  }

  const callbacksObject: oas31.CallbacksObject = {};
  for (const [name, value] of Object.entries(callbacks)) {
    if (isISpecificationExtension(name)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      callbacksObject[name] = value;
      continue;
    }

    callbacksObject[name] = createCallback(
      value as ZodOpenApiCallbackObject,
      registry,
      [...path, name],
    );
  }

  return callbacksObject;
};
