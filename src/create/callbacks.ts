import type { ComponentRegistry } from './components.js';
import type { ZodOpenApiCallbacksObject } from './document.js';
import { isISpecificationExtension } from './specificationExtension.js';

import type { oas32 } from '@zod-openapi/openapi3-ts';

export const createCallbacks = (
  callbacks: ZodOpenApiCallbacksObject | undefined,
  registry: ComponentRegistry,
  path: string[],
): oas32.CallbackObject | undefined => {
  if (!callbacks) {
    return undefined;
  }

  const callbacksObject: oas32.CallbacksObject = {};
  for (const [name, value] of Object.entries(callbacks)) {
    if (isISpecificationExtension(name)) {
       
      callbacksObject[name] = value;
      continue;
    }

    callbacksObject[name] = registry.addCallback(
      value,
      [...path, name],
    );
  }

  return callbacksObject;
};
