import type { oas31 } from '../openapi3-ts/dist/index.js';

import type { ComponentRegistry } from './components.js';
import type {
  ZodOpenApiResponseObject,
  ZodOpenApiResponsesObject,
} from './document.js';
import { isISpecificationExtension } from './specificationExtension.js';

export const createResponses = (
  responses: ZodOpenApiResponsesObject | undefined,
  registry: ComponentRegistry,
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

    const responseObject = registry.addResponse(
      response as ZodOpenApiResponseObject,
      [...path, statusCode],
    );

    responsesObject[statusCode] = responseObject;
  }

  return responsesObject;
};
