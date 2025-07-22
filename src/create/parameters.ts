import type { $ZodType, $ZodTypes } from 'zod/v4/core';

import { isAnyZodType } from '../zod.js';

import type { ComponentRegistry } from './components.js';
import type { ZodOpenApiParameters } from './document.js';
import { unwrapZodObject } from './object.js';

import type { oas31 } from '@zod-openapi/openapi3-ts';

export const createManualParameters = (
  parameters:
    | Array<$ZodType | oas31.ParameterObject | oas31.ReferenceObject>
    | undefined,
  registry: ComponentRegistry,
  path: string[],
) => {
  if (!parameters) {
    return undefined;
  }

  const parameterObjects: Array<oas31.ParameterObject | oas31.ReferenceObject> =
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
    parameterObjects.push(parameter as oas31.ParameterObject);
  }

  return parameterObjects;
};

export const createParameters = (
  requestParams: ZodOpenApiParameters | undefined,
  registry: ComponentRegistry,
  path: string[],
): Array<oas31.ParameterObject | oas31.ReferenceObject> | undefined => {
  if (!requestParams) {
    return undefined;
  }
  const parameterObjects: Array<oas31.ParameterObject | oas31.ReferenceObject> =
    [];
  for (const [location, schema] of Object.entries(requestParams ?? {})) {
    const zodObject = unwrapZodObject(schema as $ZodTypes, 'input', path);

    for (const [name, zodSchema] of Object.entries(zodObject._zod.def.shape)) {
      const paramObject = registry.addParameter(
        zodSchema,
        [...path, location, name],
        {
          location: {
            in: location as oas31.ParameterLocation,
            name,
          },
        },
      );

      parameterObjects.push(paramObject);
    }
  }

  return parameterObjects;
};
