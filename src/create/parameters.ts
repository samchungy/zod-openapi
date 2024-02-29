import type { AnyZodObject, ZodRawShape, ZodType } from 'zod';

import type { oas30, oas31 } from '../openapi3-ts/dist';
import { isAnyZodType, isZodType } from '../zodType';

import type { ComponentsObject } from './components';
import type { ZodObjectType, ZodOpenApiParameters } from './document';
import { type SchemaState, createSchema } from './schema';
import { isOptionalSchema } from './schema/parsers/optional';

export const createComponentParamRef = (ref: string) =>
  `#/components/parameters/${ref}`;

export const createBaseParameter = (
  schema: ZodType,
  components: ComponentsObject,
  subpath: string[],
): oas31.BaseParameterObject => {
  const { ref, ...rest } = schema._def.openapi?.param ?? {};
  const state: SchemaState = {
    components,
    type: 'input',
    path: [],
    visited: new Set(),
  };
  const schemaObject = createSchema(schema, state, [...subpath, 'schema']);
  const required = !isOptionalSchema(schema, state)?.optional;
  const description =
    schema._def.openapi?.description ?? schema._def.description;

  return {
    ...(description && { description }),
    ...rest,
    ...(schema && { schema: schemaObject }),
    ...(required && { required }),
  };
};

export const createParamOrRef = (
  zodSchema: ZodType,
  components: ComponentsObject,
  subpath: string[],
  type?: keyof ZodOpenApiParameters,
  name?: string,
): oas31.ParameterObject | oas31.ReferenceObject => {
  const component = components.parameters.get(zodSchema);
  const paramType = zodSchema._def?.openapi?.param?.in ?? component?.in ?? type;
  const paramName =
    zodSchema._def?.openapi?.param?.name ?? component?.name ?? name;

  if (!paramType) {
    throw new Error('Parameter type missing');
  }

  if (!paramName) {
    throw new Error('Parameter name missing');
  }

  if (component && component.type === 'complete') {
    if (
      !('$ref' in component.paramObject) &&
      (component.in !== paramType || component.name !== paramName)
    ) {
      throw new Error(`parameterRef "${component.ref}" is already registered`);
    }
    return {
      $ref: createComponentParamRef(component.ref),
    };
  }

  // Optional Objects can return a reference object
  const baseParamOrRef = createBaseParameter(zodSchema, components, subpath);
  if ('$ref' in baseParamOrRef) {
    throw new Error('Unexpected Error: received a reference object');
  }

  const ref = zodSchema?._def?.openapi?.param?.ref ?? component?.ref;

  const paramObject: oas31.ParameterObject = {
    in: paramType,
    name: paramName,
    ...baseParamOrRef,
  };

  if (ref) {
    components.parameters.set(zodSchema, {
      type: 'complete',
      paramObject,
      ref,
      in: paramType,
      name: paramName,
    });

    return {
      $ref: createComponentParamRef(ref),
    };
  }

  return paramObject;
};

const createParameters = (
  type: keyof ZodOpenApiParameters,
  zodObjectType: ZodObjectType | undefined,
  components: ComponentsObject,
  subpath: string[],
): Array<oas31.ParameterObject | oas31.ReferenceObject> => {
  if (!zodObjectType) {
    return [];
  }

  const zodObject = getZodObject(zodObjectType, 'input').shape as ZodRawShape;

  return Object.entries(zodObject).map(([key, zodSchema]: [string, ZodType]) =>
    createParamOrRef(zodSchema, components, [...subpath, key], type, key),
  );
};

const createRequestParams = (
  requestParams: ZodOpenApiParameters | undefined,
  components: ComponentsObject,
  subpath: string[],
): NonNullable<oas31.OperationObject['parameters']> => {
  if (!requestParams) {
    return [];
  }

  const pathParams = createParameters('path', requestParams.path, components, [
    ...subpath,
    'path',
  ]);
  const queryParams = createParameters(
    'query',
    requestParams.query,
    components,
    [...subpath, 'query'],
  );
  const cookieParams = createParameters(
    'cookie',
    requestParams.cookie,
    components,
    [...subpath, 'cookie'],
  );
  const headerParams = createParameters(
    'header',
    requestParams.header,
    components,
    [...subpath, 'header'],
  );

  return [...pathParams, ...queryParams, ...cookieParams, ...headerParams];
};

export const createManualParameters = (
  parameters:
    | Array<
        | oas31.ParameterObject
        | oas31.ReferenceObject
        | oas30.ParameterObject
        | oas30.ReferenceObject
        | ZodType
      >
    | undefined,
  components: ComponentsObject,
  subpath: string[],
): Array<oas31.ParameterObject | oas31.ReferenceObject> =>
  parameters?.map((param, index) => {
    if (isAnyZodType(param)) {
      return createParamOrRef(param, components, [
        ...subpath,
        `param index ${index}`,
      ]);
    }
    return param as oas31.ParameterObject | oas31.ReferenceObject;
  }) ?? [];

export const createParametersObject = (
  parameters:
    | Array<
        | oas31.ParameterObject
        | oas31.ReferenceObject
        | oas30.ParameterObject
        | oas30.ReferenceObject
        | ZodType
      >
    | undefined,
  requestParams: ZodOpenApiParameters | undefined,
  components: ComponentsObject,
  subpath: string[],
): Array<oas31.ParameterObject | oas31.ReferenceObject> | undefined => {
  const manualParameters = createManualParameters(
    parameters,
    components,
    subpath,
  );
  const createdParams = createRequestParams(requestParams, components, subpath);
  const combinedParameters: oas31.OperationObject['parameters'] = [
    ...manualParameters,
    ...createdParams,
  ];

  return combinedParameters.length ? combinedParameters : undefined;
};

export const getZodObject = (
  schema: ZodObjectType,
  type: 'input' | 'output',
): AnyZodObject => {
  if (isZodType(schema, 'ZodObject')) {
    return schema;
  }
  if (isZodType(schema, 'ZodLazy')) {
    return getZodObject(schema.schema as ZodObjectType, type);
  }
  if (isZodType(schema, 'ZodEffects')) {
    return getZodObject(schema.innerType() as ZodObjectType, type);
  }
  if (isZodType(schema, 'ZodBranded')) {
    return getZodObject(schema.unwrap() as ZodObjectType, type);
  }
  if (isZodType(schema, 'ZodPipeline')) {
    if (type === 'input') {
      return getZodObject(schema._def.in as ZodObjectType, type);
    }
    return getZodObject(schema._def.out as ZodObjectType, type);
  }

  if (
    isZodType(schema, 'ZodEffects') &&
    schema._def.effect.type === 'transform'
  ) {
    return getZodObject(schema._def.schema as ZodObjectType, type);
  }

  throw new Error('failed to find ZodObject in schema');
};
