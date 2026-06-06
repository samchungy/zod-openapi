import type { ComponentRegistry } from './components.js';
import type { ZodOpenApiCallbackObject } from './document.js';
import { isISpecificationExtension } from './specificationExtension.js';

import type { oas31 } from '@zod-openapi/openapi3-ts';

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

    callbacksObject[name] = registry.addCallback(
      value as ZodOpenApiCallbackObject,
      [...path, name],
    );
  }

  return callbacksObject;
};
