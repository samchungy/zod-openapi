import { globalRegistry } from 'zod/v4';
import type { $ZodType, $ZodTypes } from 'zod/v4/core';

import type { oas31 } from '../openapi3-ts/dist';
import { isAnyZodType } from '../zod';

import type { ComponentRegistry } from './components';
import type { ZodOpenApiParameters } from './document';
import { isRequired, unwrapZodObject } from './object';

export const createParameter = (
  parameter: $ZodType,
  location: { in: oas31.ParameterLocation; name: string } | undefined,
  ctx: {
    registry: ComponentRegistry;
    io: 'input' | 'output';
  },
  path: string[],
): oas31.ParameterObject | oas31.ReferenceObject => {
  const seenParameter = ctx.registry.parameters.seen.get(parameter);
  if (seenParameter) {
    return seenParameter as oas31.ParameterObject;
  }

  const meta = globalRegistry.get(parameter);

  const name = location?.name ?? meta?.param?.name;
  const inLocation = location?.in ?? meta?.param?.in;

  if (!name || !inLocation) {
    throw new Error(
      `Parameter at ${path.join(' > ')} is missing \`.meta({ param: { name, in } })\` information`,
    );
  }

  const computedPath = [...path, inLocation, name].join(' > ');

  const schemaObject = ctx.registry.schemas.setSchema(
    computedPath,
    parameter,
    ctx.io,
  );

  const { id, ...rest } = meta?.param ?? {};

  const parameterObject: oas31.ParameterObject = {
    ...rest,
    name,
    in: inLocation,
    schema: schemaObject,
  };

  if (isRequired(parameter, ctx.io)) {
    parameterObject.required = true;
  }

  if (!parameterObject.description && meta?.description) {
    parameterObject.description = meta.description;
  }

  if (id) {
    const ref: oas31.ReferenceObject = {
      $ref: `#/components/parameters/${id}`,
    };
    ctx.registry.parameters.seen.set(parameter, ref);
    ctx.registry.parameters.ids.set(id, parameterObject);
    return ref;
  }

  ctx.registry.parameters.seen.set(parameter, parameterObject);
  return parameterObject;
};

export const createManualParameters = (
  parameters:
    | Array<$ZodType | oas31.ParameterObject | oas31.ReferenceObject>
    | undefined,
  ctx: {
    registry: ComponentRegistry;
    io: 'input' | 'output';
  },
  path: string[],
) => {
  if (!parameters) {
    return undefined;
  }

  const parameterObjects: Array<oas31.ParameterObject | oas31.ReferenceObject> =
    [];

  for (const parameter of parameters) {
    if (isAnyZodType(parameter)) {
      const seenParameter = ctx.registry.parameters.seen.get(parameter);
      if (seenParameter) {
        parameterObjects.push(seenParameter as oas31.ParameterObject);
        continue;
      }

      const paramObject = createParameter(parameter, undefined, ctx, [
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
  ctx: {
    registry: ComponentRegistry;
    io: 'input' | 'output';
  },
  path: string[],
): Array<oas31.ParameterObject | oas31.ReferenceObject> | undefined => {
  if (!requestParams) {
    return undefined;
  }
  const parameterObjects: Array<oas31.ParameterObject | oas31.ReferenceObject> =
    [];
  for (const [location, schema] of Object.entries(requestParams ?? {})) {
    if (!schema) {
      continue;
    }

    const zodObject = unwrapZodObject(schema as $ZodTypes, ctx.io, path);

    for (const [name, zodSchema] of Object.entries(zodObject._zod.def.shape)) {
      const seenParameter = ctx.registry.parameters.seen.get(zodSchema);
      if (seenParameter) {
        parameterObjects.push(seenParameter as oas31.ParameterObject);
        continue;
      }

      const paramObject = createParameter(
        zodSchema,
        {
          in: location as oas31.ParameterLocation,
          name,
        },
        ctx,
        [...path, location, name],
      );

      parameterObjects.push(paramObject);
    }
  }

  return parameterObjects;
};
