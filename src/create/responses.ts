import type { oas31 } from '../openapi3-ts/dist';

import type { ComponentRegistry } from './components';
import { createContent } from './content';
import type {
  ZodOpenApiResponseObject,
  ZodOpenApiResponsesObject,
} from './document';
import { createHeaders } from './headers';
import { isISpecificationExtension } from './specificationExtension';

export const createResponse = (
  response: ZodOpenApiResponseObject,
  ctx: {
    registry: ComponentRegistry;
    io: 'input' | 'output';
  },
  path: string[],
): oas31.ResponseObject | oas31.ReferenceObject => {
  const seenResponse = ctx.registry.responses.seen.get(response);
  if (seenResponse) {
    return seenResponse;
  }

  const { content, headers, id, ...rest } = response;

  const responseObject: oas31.ResponseObject = rest;

  if (id) {
    ctx.registry.responses.ids.set(id, responseObject);
  }
  ctx.registry.responses.seen.set(response, responseObject);

  const maybeHeaders = createHeaders(headers, ctx, [...path, 'headers']);
  if (maybeHeaders) {
    responseObject.headers = maybeHeaders;
  }

  if (content) {
    responseObject.content = createContent(content, ctx, [...path, 'content']);
  }

  return responseObject;
};

export const createResponses = (
  responses: ZodOpenApiResponsesObject | undefined,
  ctx: {
    registry: ComponentRegistry;
    io: 'input' | 'output';
  },
  path: string[],
) => {
  if (!responses) {
    return undefined;
  }

  const responsesObject: oas31.ResponsesObject = {};

  for (const [statusCode, response] of Object.entries(responses)) {
    if (!response) {
      continue;
    }

    if (isISpecificationExtension(statusCode)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      responsesObject[statusCode] = response;
      continue;
    }

    if ('$ref' in response) {
      // If the response is a reference, we can just return it as is.
      responsesObject[statusCode] = response as oas31.ReferenceObject;
      continue;
    }

    const responseObject = createResponse(
      response as oas31.ResponseObject,
      ctx,
      [...path, statusCode],
    );

    responsesObject[statusCode] = responseObject;
  }

  return responsesObject;
};
