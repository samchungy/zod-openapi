import type { $ZodTypes } from 'zod/v4/core';

import type { oas31 } from '../openapi3-ts/dist';
import { isAnyZodType } from '../zod';

import type { ComponentRegistry } from './components';
import type { ZodOpenApiHeadersObject } from './document';
import { unwrapZodObject } from './object';

export const createHeaders = (
  headers: ZodOpenApiHeadersObject | undefined,
  registry: ComponentRegistry,
  path: string[],
): oas31.HeadersObject | undefined => {
  if (!headers) {
    return undefined;
  }

  if (isAnyZodType(headers)) {
    const zodObject = unwrapZodObject(headers as $ZodTypes, 'output', path);

    const headersObject: oas31.HeadersObject = {};
    for (const [key, zodSchema] of Object.entries(zodObject._zod.def.shape)) {
      const header = registry.addHeader(zodSchema, [...path, key]);
      headersObject[key] = header;
    }
    return headersObject;
  }

  return headers as oas31.HeadersObject;
};
