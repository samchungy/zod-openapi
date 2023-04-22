import { oas31 } from 'openapi3-ts';
import { AnyZodObject, ZodRawShape, ZodType } from 'zod';

import { ComponentsObject } from './components';
import { ZodOpenApiParameters } from './document';
import { createSchemaOrRef } from './schema';

export const createComponentParamRef = (ref: string) =>
  `#/components/parameters/${ref}`;

export const createBaseParameter = (
  schema: ZodType,
  components: ComponentsObject,
): oas31.BaseParameterObject => {
  const { ref, ...rest } = schema._def.openapi?.param ?? {};
  const schemaOrRef = createSchemaOrRef(schema, {
    components,
    type: 'input',
  });
  const required = !schema.isOptional();
  return {
    ...rest,
    ...(schema && { schema: schemaOrRef }),
    ...(required && { required }),
  };
};

const createRegisteredParam = (
  zodSchema: ZodType,
  ref: string,
  type: keyof ZodOpenApiParameters,
  name: string,
  components: ComponentsObject,
): oas31.ReferenceObject => {
  const component = components.parameters.get(zodSchema);
  if (component && component.type === 'complete') {
    if (
      !('$ref' in component.paramObject) &&
      (component.paramObject.in !== type || component.paramObject.name !== name)
    ) {
      throw new Error(`parameterRef "${ref}" is already registered`);
    }
    return {
      $ref: createComponentParamRef(ref),
    };
  }

  // Optional Objects can return a reference object
  const baseParamOrRef = createBaseParameter(zodSchema, components);
  if ('$ref' in baseParamOrRef) {
    throw new Error('Unexpected Error: received a reference object');
  }

  components.parameters.set(zodSchema, {
    type: 'complete',
    paramObject: {
      in: type,
      name,
      ...baseParamOrRef,
    },
    ref,
  });

  return {
    $ref: createComponentParamRef(ref),
  };
};

const createParamOrRef = (
  schema: ZodType,
  type: keyof ZodOpenApiParameters,
  name: string,
  components: ComponentsObject,
): oas31.ParameterObject | oas31.ReferenceObject => {
  const ref = schema?._def?.openapi?.param?.ref;

  if (ref) {
    return createRegisteredParam(schema, ref, type, name, components);
  }

  return {
    in: type,
    name,
    ...createBaseParameter(schema, components),
  };
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
      createParamOrRef(zodSchema, type, key, components),
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

export const createParametersObject = (
  parameters: (oas31.ParameterObject | oas31.ReferenceObject)[] | undefined,
  requestParams: ZodOpenApiParameters | undefined,
  components: ComponentsObject,
): (oas31.ParameterObject | oas31.ReferenceObject)[] | undefined => {
  const createdParams = createRequestParams(requestParams, components);
  const combinedParameters: oas31.OperationObject['parameters'] = [
    ...(parameters ? parameters : []),
    ...createdParams,
  ];

  return combinedParameters.length ? combinedParameters : undefined;
};
