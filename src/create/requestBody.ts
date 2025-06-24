import type { oas31 } from '../openapi3-ts/dist';

import type { ComponentRegistry } from './components';
import { createContent } from './content';
import type { ZodOpenApiRequestBodyObject } from './document';

export const createRequestBody = (
  requestBody: ZodOpenApiRequestBodyObject | undefined,
  ctx: {
    registry: ComponentRegistry;
    io: 'input' | 'output';
  },
  path: string[],
): oas31.RequestBodyObject | oas31.ReferenceObject | undefined => {
  if (!requestBody) {
    return undefined;
  }

  const seenRequestBody = ctx.registry.requestBodies.seen.get(requestBody);
  if (seenRequestBody) {
    return seenRequestBody as oas31.RequestBodyObject;
  }

  const { content, id, ...rest } = requestBody;

  const requestBodyObject: oas31.RequestBodyObject = {
    ...rest,
    content: createContent(content, ctx, [...path, 'content']),
  };

  if (id) {
    const ref: oas31.ReferenceObject = {
      $ref: `#/components/requestBodies/${id}`,
    };
    ctx.registry.requestBodies.ids.set(id, requestBodyObject);
    ctx.registry.requestBodies.seen.set(requestBody, ref);
    return ref;
  }

  ctx.registry.requestBodies.seen.set(requestBody, requestBodyObject);

  return requestBodyObject;
};
