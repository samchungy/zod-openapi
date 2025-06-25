import z from 'zod/v4';

import { createRegistry } from './components';
import type { ZodOpenApiRequestBodyObject } from './document';
import { createRequestBody } from './requestBody';

describe('createRequestBody', () => {
  it('should create a request body object', () => {
    const requestBody: ZodOpenApiRequestBodyObject = {
      description: 'A request body',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            name: z.string(),
          }),
        },
      },
    };

    const registry = createRegistry();

    const result = createRequestBody(requestBody, { registry, io: 'input' }, [
      'test',
    ]);

    expect(result).toEqual({
      description: 'A request body',
      content: {
        'application/json': {
          schema: {},
        },
      },
    });
  });
});
