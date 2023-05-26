import { z } from 'zod';

import { extendZodWithOpenApi } from '../extendZod';
import type { oas31 } from '../openapi3-ts/dist';

import { getDefaultComponents } from './components';
import { createBaseParameter, createParametersObject } from './parameters';

extendZodWithOpenApi(z);

describe('createBaseParameter', () => {
  it('should create base parameters from a zod string', () => {
    const expectedResult: oas31.BaseParameterObject = {
      schema: {
        type: 'string',
      },
      required: true,
    };
    const result = createBaseParameter(z.string(), getDefaultComponents(), [
      'query',
    ]);

    expect(result).toStrictEqual(expectedResult);
  });

  it('should create optional base parameters from a zod string', () => {
    const expectedResult: oas31.BaseParameterObject = {
      schema: {
        type: 'string',
      },
    };
    const result = createBaseParameter(
      z.string().optional(),
      getDefaultComponents(),
      ['query'],
    );

    expect(result).toStrictEqual(expectedResult);
  });
});

describe('createParametersObject', () => {
  it('should create a parameters object using parameters', () => {
    const expectedResult: oas31.OperationObject['parameters'] = [
      {
        in: 'header',
        name: 'd',
        schema: {
          type: 'string',
        },
        required: true,
      },
    ];
    const result = createParametersObject(
      [z.string().openapi({ param: { in: 'header', name: 'd' } })],
      {},
      getDefaultComponents(),
      ['header'],
    );

    expect(result).toStrictEqual(expectedResult);
  });

  it('should create a parameters object using requestParams', () => {
    const expectedResult: oas31.OperationObject['parameters'] = [
      {
        in: 'path',
        name: 'b',
        schema: {
          type: 'string',
        },
        required: true,
      },
      {
        in: 'query',
        name: 'a',
        schema: {
          type: 'string',
        },
        required: true,
      },
      {
        in: 'cookie',
        name: 'c',
        schema: {
          type: 'string',
        },
        required: true,
      },
      {
        in: 'header',
        name: 'd',
        schema: {
          type: 'string',
        },
        required: true,
      },
    ];
    const result = createParametersObject(
      [],
      {
        path: z.object({ b: z.string() }),
        query: z.object({ a: z.string() }),
        cookie: z.object({ c: z.string() }),
        header: z.object({ d: z.string() }),
      },
      getDefaultComponents(),
      ['parameters'],
    );

    expect(result).toStrictEqual(expectedResult);
  });

  it('should combine parameters with requestParams', () => {
    const expectedResult: oas31.OperationObject['parameters'] = [
      {
        in: 'query',
        name: 'a',
        schema: {
          type: 'string',
        },
        required: true,
      },
      {
        in: 'cookie',
        name: 'c',
        schema: {
          type: 'string',
        },
        required: true,
      },
      {
        in: 'header',
        name: 'd',
        schema: {
          type: 'string',
        },
        required: true,
      },
      {
        in: 'path',
        name: 'b',
        schema: {
          type: 'string',
        },
        required: true,
      },
    ];
    const result = createParametersObject(
      [
        {
          in: 'query',
          name: 'a',
          schema: {
            type: 'string',
          },
          required: true,
        },
        {
          in: 'cookie',
          name: 'c',
          schema: {
            type: 'string',
          },
          required: true,
        },
        {
          in: 'header',
          name: 'd',
          schema: {
            type: 'string',
          },
          required: true,
        },
      ],
      {
        path: z.object({ b: z.string() }),
      },
      getDefaultComponents(),
      ['parameters'],
    );

    expect(result).toStrictEqual(expectedResult);
  });

  it('should create refs using requestParams', () => {
    const expectedResult: oas31.OperationObject['parameters'] = [
      {
        $ref: '#/components/parameters/a',
      },
      {
        $ref: '#/components/parameters/b',
      },
      {
        $ref: '#/components/parameters/c',
      },
      {
        $ref: '#/components/parameters/d',
      },
    ];
    const result = createParametersObject(
      [],
      {
        path: z.object({ a: z.string().openapi({ param: { ref: 'a' } }) }),
        query: z.object({ b: z.string().openapi({ param: { ref: 'b' } }) }),
        cookie: z.object({ c: z.string().openapi({ param: { ref: 'c' } }) }),
        header: z.object({ d: z.string().openapi({ param: { ref: 'd' } }) }),
      },
      getDefaultComponents(),
      ['parameters'],
    );

    expect(result).toStrictEqual(expectedResult);
  });

  it('should create refs using parameters', () => {
    const expectedResult: oas31.OperationObject['parameters'] = [
      {
        $ref: '#/components/parameters/a',
      },
    ];
    const result = createParametersObject(
      [z.string().openapi({ param: { ref: 'a', name: 'a', in: 'header' } })],
      {},
      getDefaultComponents(),
      ['parameters'],
    );

    expect(result).toStrictEqual(expectedResult);
  });
});
