import { describe, expect, it } from 'vitest';
import * as z from 'zod/v4';

import { createRegistry } from './components.js';
import type { ZodOpenApiParameters } from './document.js';
import { createManualParameters, createParameters } from './parameters.js';

import type { oas31 } from '@zod-openapi/openapi3-ts';

describe('createParameters', () => {
  it('should create a parameter object with a schema', () => {
    const requestParams: ZodOpenApiParameters = {
      query: z.object({
        search: z.string().describe('Search term'),
      }),
      cookie: z.object({
        sessionId: z.string().optional().describe('Session ID'),
      }),
      header: z.object({
        'X-Custom-Header': z.string().describe('A custom header'),
      }),
      path: z.object({
        userId: z.string().describe('User ID'),
      }),
    };

    const registry = createRegistry();

    const parameters = createParameters(requestParams, registry, ['test']);

    expect(parameters).toEqual<oas31.ParameterObject[]>([
      {
        in: 'query',
        name: 'search',
        description: 'Search term',
        schema: {},
        required: true,
      },
      {
        in: 'cookie',
        name: 'sessionId',
        description: 'Session ID',
        schema: {},
      },
      {
        in: 'header',
        name: 'X-Custom-Header',
        description: 'A custom header',
        schema: {},
        required: true,
      },
      {
        in: 'path',
        name: 'userId',
        description: 'User ID',
        schema: {},
        required: true,
      },
    ]);
  });
});

describe('createParameter', () => {
  it('should create a parameter object', () => {
    const zodSchema = z.string().describe('A custom parameter');

    const registry = createRegistry();

    const parameter = registry.addParameter(zodSchema, ['test', 'parameter'], {
      location: {
        in: 'query',
        name: 'search',
      },
    });

    expect(parameter).toEqual<oas31.ParameterObject>({
      in: 'query',
      name: 'search',
      description: 'A custom parameter',
      schema: {},
      required: true,
    });
  });

  it('should create a parameter object with meta', () => {
    const zodSchema = z.string().meta({
      param: {
        in: 'query',
        name: 'search',
      },
    });

    const registry = createRegistry();

    const parameter = registry.addParameter(zodSchema, ['test', 'parameter']);

    expect(parameter).toEqual<oas31.ParameterObject>({
      in: 'query',
      name: 'search',
      schema: {},
      required: true,
    });
  });
});

describe('createManualParmaeters', () => {
  it('should create manual parameters from an array of Zod types', () => {
    const zodSchema1 = z.string().meta({
      param: {
        in: 'query',
        name: 'test > parameters > 0',
      },
    });
    const zodSchema2 = z.string().meta({
      param: {
        in: 'query',
        name: 'test > parameters > 1',
      },
    });

    const registry = createRegistry();

    const parameters = createManualParameters(
      [zodSchema1, zodSchema2],
      registry,
      ['test'],
    );

    expect(parameters).toEqual<oas31.ParameterObject[]>([
      {
        in: 'query',
        name: 'test > parameters > 0',
        schema: {},
        required: true,
      },
      {
        in: 'query',
        name: 'test > parameters > 1',
        schema: {},
        required: true,
      },
    ]);
  });
});
