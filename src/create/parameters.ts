import { ZodType } from 'zod';
import type { AnyZodObject, ZodRawShape } from 'zod';

import type { oas30, oas31 } from '../openapi3-ts/dist';

import type { ComponentsObject } from './components';
import type { ZodOpenApiParameters } from './document';
import { type SchemaState, createSchemaOrRef, newSchemaState } from './schema';
import { isOptionalSchema } from './schema/optional';

export const createComponentParamRef = (ref: string) =>
  `#/components/parameters/${ref}`;

export const createBaseParameter = (
  schema: ZodType,
  components: ComponentsObject,
): oas31.BaseParameterObject => {
  const { ref, ...rest } = schema._def.openapi?.param ?? {};
  const state: SchemaState = newSchemaState({
    components,
    type: 'input',
    path: [],
    visited: new Set(),
  });
  const schemaOrRef = createSchemaOrRef(schema, state, 'parameter');
  const required = !isOptionalSchema(schema, state);
  return {
    ...rest,
    ...(schema && { schema: schemaOrRef }),
    ...(required && { required }),
  };
};

export const createParamOrRef = (
  zodSchema: ZodType,
  components: ComponentsObject,
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
      (component.in !== type || component.name !== name)
    ) {
      throw new Error(`parameterRef "${component.ref}" is already registered`);
    }
    return {
      $ref: createComponentParamRef(component.ref),
    };
  }

  // Optional Objects can return a reference object
  const baseParamOrRef = createBaseParameter(zodSchema, components);
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
  zodObject: AnyZodObject | undefined,
  components: ComponentsObject,
): (oas31.ParameterObject | oas31.ReferenceObject)[] => {
  if (!zodObject) {
    return [];
  }

  return Object.entries(zodObject.shape as ZodRawShape).map(
    ([key, zodSchema]: [string, ZodType]) =>
      createParamOrRef(zodSchema, components, type, key),
  );
};

const createRequestParams = (
  requestParams: ZodOpenApiParameters | undefined,
  components: ComponentsObject,
): NonNullable<oas31.OperationObject['parameters']> => {
  if (!requestParams) {
    return [];
  }

  const pathParams = createParameters('path', requestParams.path, components);
  const queryParams = createParameters(
    'query',
    requestParams.query,
    components,
  );
  const cookieParams = createParameters(
    'cookie',
    requestParams.cookie,
    components,
  );
  const headerParams = createParameters(
    'header',
    requestParams.header,
    components,
  );

  return [...pathParams, ...queryParams, ...cookieParams, ...headerParams];
};

export const createManualParameters = (
  parameters:
    | (
        | oas31.ParameterObject
        | oas31.ReferenceObject
        | oas30.ParameterObject
        | oas30.ReferenceObject
        | ZodType
      )[]
    | undefined,
  components: ComponentsObject,
): (oas31.ParameterObject | oas31.ReferenceObject)[] =>
  parameters?.map((param) => {
    if (param instanceof ZodType) {
      return createParamOrRef(param, components);
    }
    return param as oas31.ParameterObject | oas31.ReferenceObject;
  }) ?? [];

export const createParametersObject = (
  parameters:
    | (
        | oas31.ParameterObject
        | oas31.ReferenceObject
        | oas30.ParameterObject
        | oas30.ReferenceObject
        | ZodType
      )[]
    | undefined,
  requestParams: ZodOpenApiParameters | undefined,
  components: ComponentsObject,
): (oas31.ParameterObject | oas31.ReferenceObject)[] | undefined => {
  const manualParameters = createManualParameters(parameters, components);
  const createdParams = createRequestParams(requestParams, components);
  const combinedParameters: oas31.OperationObject['parameters'] = [
    ...manualParameters,
    ...createdParams,
  ];

  return combinedParameters.length ? combinedParameters : undefined;
};
