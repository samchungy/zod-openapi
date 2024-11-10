import type { AnyZodObject, ZodRawShape, ZodType } from 'zod';

import type { oas30, oas31 } from '../openapi3-ts/dist';
import { isAnyZodType, isZodType } from '../zodType';

import type { ComponentsObject } from './components';
import type {
  CreateDocumentOptions,
  ZodObjectInputType,
  ZodOpenApiParameters,
} from './document';
import { type SchemaState, createSchema } from './schema';

export const createComponentParamRef = (ref: string) =>
  `#/components/parameters/${ref}`;

export const createBaseParameter = (
  schema: ZodType,
  components: ComponentsObject,
  subpath: string[],
  documentOptions?: CreateDocumentOptions,
): oas31.BaseParameterObject => {
  const { ref, ...rest } = schema._def.zodOpenApi?.openapi?.param ?? {};
  const state: SchemaState = {
    components,
    type: 'input',
    path: [],
    visited: new Set(),
    documentOptions,
  };
  const schemaObject = createSchema(schema, state, [...subpath, 'schema']);
  const required = !schema.isOptional();

  const description =
    schema._def.zodOpenApi?.openapi?.description ?? schema._def.description;

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
  documentOptions?: CreateDocumentOptions,
): oas31.ParameterObject | oas31.ReferenceObject => {
  const component = components.parameters.get(zodSchema);
  const paramType =
    zodSchema._def.zodOpenApi?.openapi?.param?.in ?? component?.in ?? type;
  const paramName =
    zodSchema._def.zodOpenApi?.openapi?.param?.name ?? component?.name ?? name;

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
  const baseParamOrRef = createBaseParameter(
    zodSchema,
    components,
    subpath,
    documentOptions,
  );
  if ('$ref' in baseParamOrRef) {
    throw new Error('Unexpected Error: received a reference object');
  }

  const ref = zodSchema?._def.zodOpenApi?.openapi?.param?.ref ?? component?.ref;

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
  zodObjectType: ZodObjectInputType | undefined,
  components: ComponentsObject,
  subpath: string[],
  documentOptions?: CreateDocumentOptions,
): Array<oas31.ParameterObject | oas31.ReferenceObject> => {
  if (!zodObjectType) {
    return [];
  }

  const zodObject = getZodObject(zodObjectType, 'input').shape as ZodRawShape;

  return Object.entries(zodObject).map(([key, zodSchema]: [string, ZodType]) =>
    createParamOrRef(
      zodSchema,
      components,
      [...subpath, key],
      type,
      key,
      documentOptions,
    ),
  );
};

const createRequestParams = (
  requestParams: ZodOpenApiParameters | undefined,
  components: ComponentsObject,
  subpath: string[],
  documentOptions?: CreateDocumentOptions,
): NonNullable<oas31.OperationObject['parameters']> => {
  if (!requestParams) {
    return [];
  }

  const pathParams = createParameters(
    'path',
    requestParams.path,
    components,
    [...subpath, 'path'],
    documentOptions,
  );
  const queryParams = createParameters(
    'query',
    requestParams.query,
    components,
    [...subpath, 'query'],
    documentOptions,
  );
  const cookieParams = createParameters(
    'cookie',
    requestParams.cookie,
    components,
    [...subpath, 'cookie'],
    documentOptions,
  );
  const headerParams = createParameters(
    'header',
    requestParams.header,
    components,
    [...subpath, 'header'],
    documentOptions,
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
  documentOptions?: CreateDocumentOptions,
): Array<oas31.ParameterObject | oas31.ReferenceObject> =>
  parameters?.map((param, index) => {
    if (isAnyZodType(param)) {
      return createParamOrRef(
        param,
        components,
        [...subpath, `param index ${index}`],
        undefined,
        undefined,
        documentOptions,
      );
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
  documentOptions?: CreateDocumentOptions,
): Array<oas31.ParameterObject | oas31.ReferenceObject> | undefined => {
  const manualParameters = createManualParameters(
    parameters,
    components,
    subpath,
    documentOptions,
  );
  const createdParams = createRequestParams(
    requestParams,
    components,
    subpath,
    documentOptions,
  );
  const combinedParameters: oas31.OperationObject['parameters'] = [
    ...manualParameters,
    ...createdParams,
  ];

  return combinedParameters.length ? combinedParameters : undefined;
};

export const getZodObject = (
  schema: ZodObjectInputType,
  type: 'input' | 'output',
): AnyZodObject => {
  if (isZodType(schema, 'ZodObject')) {
    return schema;
  }
  if (isZodType(schema, 'ZodLazy')) {
    return getZodObject(schema.schema as ZodObjectInputType, type);
  }
  if (isZodType(schema, 'ZodEffects')) {
    return getZodObject(schema.innerType() as ZodObjectInputType, type);
  }
  if (isZodType(schema, 'ZodBranded')) {
    return getZodObject(schema.unwrap() as ZodObjectInputType, type);
  }
  if (isZodType(schema, 'ZodPipeline')) {
    if (type === 'input') {
      return getZodObject(schema._def.in as ZodObjectInputType, type);
    }
    return getZodObject(schema._def.out as ZodObjectInputType, type);
  }

  throw new Error('failed to find ZodObject in schema');
};
