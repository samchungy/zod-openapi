import { globalRegistry } from 'zod/v4';
import type { $ZodType, $ZodTypes } from 'zod/v4/core';

import type { oas31 } from '../openapi3-ts/dist';
import { isAnyZodType } from '../zod';

import type { ComponentRegistry } from './components';
import type { ZodOpenApiHeadersObject } from './document';
import { isRequired, unwrapZodObject } from './object';

export const createHeader = (
  header: $ZodType,
  ctx: {
    registry: ComponentRegistry;
    io: 'input' | 'output';
  },
  path: string[],
): oas31.HeaderObject | oas31.ReferenceObject => {
  const seenHeader = ctx.registry.headers.seen.get(header);
  if (seenHeader) {
    return seenHeader as oas31.HeaderObject;
  }

  const meta = globalRegistry.get(header);

  const { id, ...rest } = meta?.header ?? {};

  const headerObject: oas31.HeaderObject = rest;

  if (isRequired(header, ctx.io)) {
    headerObject.required = true;
  }

  if (!headerObject.description && meta?.description) {
    headerObject.description = meta.description;
  }

  const computedPath = path.join(' > ');
  headerObject.schema = ctx.registry.schemas.setSchema(
    computedPath,
    header,
    ctx.io,
  );

  if (id) {
    const ref: oas31.ReferenceObject = {
      $ref: `#/components/headers/${id}`,
    };
    ctx.registry.headers.ids.set(id, headerObject);
    ctx.registry.headers.seen.set(header, ref);
    return ref;
  }

  ctx.registry.headers.seen.set(header, headerObject);

  return headerObject;
};

export const createHeaders = (
  headers: ZodOpenApiHeadersObject | undefined,
  ctx: {
    registry: ComponentRegistry;
    io: 'input' | 'output';
  },
  path: string[],
): oas31.HeadersObject | undefined => {
  if (!headers) {
    return undefined;
  }

  if (isAnyZodType(headers)) {
    const zodObject = unwrapZodObject(headers as $ZodTypes, ctx.io, path);

    const headersObject: oas31.HeadersObject = {};
    for (const [key, zodSchema] of Object.entries(zodObject._zod.def.shape)) {
      const header = createHeader(zodSchema, ctx, [...path, key]);
      headersObject[key] = header;
    }
    return headersObject;
  }

  return headers as oas31.HeadersObject;
};
