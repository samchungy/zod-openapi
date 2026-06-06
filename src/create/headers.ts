import { isAnyZodType } from '../zod.js';

import type { ComponentRegistry } from './components.js';
import type { ZodOpenApiHeadersObject } from './document.js';
import { unwrapZodObject } from './object.js';

import type { oas32 } from '@zod-openapi/openapi3-ts';

export const createHeaders = (
  headers: ZodOpenApiHeadersObject | undefined,
  registry: ComponentRegistry,
  path: string[],
): oas32.HeadersObject | undefined => {
  if (!headers) {
    return undefined;
  }

  if (isAnyZodType(headers)) {
    const zodObject = unwrapZodObject(headers, 'output', path);

    const headersObject: oas32.HeadersObject = {};
    for (const [key, zodSchema] of Object.entries(zodObject._zod.def.shape)) {
      const header = registry.addHeader(zodSchema, [...path, key]);
      headersObject[key] = header;
    }
    return headersObject;
  }

  return headers as oas32.HeadersObject;
};
