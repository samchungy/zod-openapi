import type { $ZodType, $ZodTypes } from 'zod/v4/core';

import { isAnyZodType } from '../zod.js';

import type { ComponentRegistry } from './components.js';
import type { ZodOpenApiParameters } from './document.js';
import { unwrapZodObject } from './object.js';

import type { oas32 } from '@zod-openapi/openapi3-ts';

export const createManualParameters = (
  parameters:
    | Array<$ZodType | oas32.ParameterObject | oas32.ReferenceObject>
    | undefined,
  registry: ComponentRegistry,
  path: string[],
) => {
  if (!parameters) {
    return undefined;
  }

  const parameterObjects: Array<oas32.ParameterObject | oas32.ReferenceObject> =
    [];

  for (const parameter of parameters) {
    if (isAnyZodType(parameter)) {
      const paramObject = registry.addParameter(parameter, [
        ...path,
        'parameters',
      ]);

      parameterObjects.push(paramObject);
      continue;
    }
    parameterObjects.push(parameter as oas32.ParameterObject);
  }

  return parameterObjects;
};

export const createParameters = (
  requestParams: ZodOpenApiParameters | undefined,
  registry: ComponentRegistry,
  path: string[],
): Array<oas32.ParameterObject | oas32.ReferenceObject> | undefined => {
  if (!requestParams) {
    return undefined;
  }
  const parameterObjects: Array<oas32.ParameterObject | oas32.ReferenceObject> =
    [];
  for (const [location, schema] of Object.entries(requestParams ?? {})) {
    const zodObject = unwrapZodObject(schema as $ZodTypes, 'input', path);

    for (const [name, zodSchema] of Object.entries(zodObject._zod.def.shape)) {
      const paramObject = registry.addParameter(
        zodSchema,
        [...path, location, name],
        {
          location: {
            in: location as oas32.ParameterLocation,
            name,
          },
        },
      );

      parameterObjects.push(paramObject);
    }
  }

  return parameterObjects;
};
