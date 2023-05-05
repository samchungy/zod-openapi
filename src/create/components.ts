import { type ZodRawShape, ZodType } from 'zod';

import type { oas30, oas31 } from '../openapi3-ts/dist';

import type {
  ZodOpenApiComponentsObject,
  ZodOpenApiRequestBodyObject,
  ZodOpenApiResponseObject,
  ZodOpenApiVersion,
} from './document';
import { createParamOrRef } from './parameters';
import { createRequestBody } from './paths';
import { createHeaderOrRef, createResponse } from './responses';
import { type SchemaState, createSchemaOrRef } from './schema';

export type CreationType = 'input' | 'output';

export interface CompleteSchemaComponent extends BaseSchemaComponent {
  type: 'complete';
  schemaObject:
    | oas31.SchemaObject
    | oas31.ReferenceObject
    | oas30.SchemaObject
    | oas30.ReferenceObject;
  /** Set when the created schemaObject is specific to a particular CreationType */
  creationType?: CreationType;
}

export interface PartialSchemaComponent extends BaseSchemaComponent {
  type: 'partial' | 'lazy';
}

interface BaseSchemaComponent {
  ref: string;
}

export type SchemaComponent = CompleteSchemaComponent | PartialSchemaComponent;

export type SchemaComponentMap = Map<ZodType, SchemaComponent>;

export interface CompleteParameterComponent extends BaseParameterComponent {
  type: 'complete';
  paramObject:
    | oas31.ParameterObject
    | oas31.ReferenceObject
    | oas30.ParameterObject
    | oas30.ReferenceObject;
}

export interface PartialParameterComponent extends BaseParameterComponent {
  type: 'partial';
  in: oas31.ParameterLocation;
}

interface BaseParameterComponent {
  ref: string;
}

export type ParameterComponent =
  | CompleteParameterComponent
  | PartialParameterComponent;

export type ParameterComponentMap = Map<ZodType, ParameterComponent>;

export interface CompleteHeaderComponent extends BaseHeaderComponent {
  type: 'complete';
  headerObject:
    | oas31.HeaderObject
    | oas31.ReferenceObject
    | oas30.HeaderObject
    | oas30.ReferenceObject;
}

export interface PartialHeaderComponent extends BaseHeaderComponent {
  type: 'partial';
}

interface BaseHeaderComponent {
  ref: string;
}

export type HeaderComponent = CompleteHeaderComponent | PartialHeaderComponent;

export type HeaderComponentMap = Map<ZodType, HeaderComponent>;

interface BaseResponseComponent {
  ref: string;
}

export interface CompleteResponseComponent extends BaseResponseComponent {
  type: 'complete';
  responseObject:
    | oas31.ResponseObject
    | oas31.ReferenceObject
    | oas30.ResponseObject
    | oas30.ReferenceObject;
}

export interface PartialResponseComponent extends BaseResponseComponent {
  type: 'partial';
}

export type ResponseComponent =
  | CompleteResponseComponent
  | PartialResponseComponent;

export type ResponseComponentMap = Map<
  ZodOpenApiResponseObject,
  ResponseComponent
>;

interface BaseRequestBodyComponent {
  ref: string;
}

export interface CompleteRequestBodyComponent extends BaseRequestBodyComponent {
  type: 'complete';
  requestBodyObject:
    | oas31.RequestBodyObject
    | oas31.ReferenceObject
    | oas30.RequestBodyObject
    | oas30.ReferenceObject;
}

export interface PartialRequestBodyComponent extends BaseRequestBodyComponent {
  type: 'partial';
}

export type RequestBodyComponent =
  | CompleteRequestBodyComponent
  | PartialRequestBodyComponent;

export type RequestBodyComponentMap = Map<
  ZodOpenApiRequestBodyObject,
  RequestBodyComponent
>;

export interface ComponentsObject {
  schemas: SchemaComponentMap;
  parameters: ParameterComponentMap;
  headers: HeaderComponentMap;
  requestBodies: RequestBodyComponentMap;
  responses: ResponseComponentMap;
  openapi: ZodOpenApiVersion;
}

export const getDefaultComponents = (
  componentsObject?: ZodOpenApiComponentsObject,
  openapi: ZodOpenApiVersion = '3.1.0',
): ComponentsObject => {
  const defaultComponents: ComponentsObject = {
    schemas: new Map(),
    parameters: new Map(),
    headers: new Map(),
    requestBodies: new Map(),
    responses: new Map(),
    openapi,
  };
  if (!componentsObject) {
    return defaultComponents;
  }

  createSchemas(componentsObject.schemas, defaultComponents);
  createParameters(componentsObject.requestParams, defaultComponents);
  createRequestBodies(componentsObject.requestBodies, defaultComponents);
  createHeaders(componentsObject.headers, defaultComponents);
  createResponses(componentsObject.responses, defaultComponents);

  return defaultComponents;
};

const createSchemas = (
  schemas: ZodOpenApiComponentsObject['schemas'],
  components: ComponentsObject,
): void => {
  if (!schemas) {
    return;
  }

  Object.entries(schemas).forEach(([key, schema]) => {
    if (schema instanceof ZodType) {
      if (components.schemas.has(schema)) {
        throw new Error(
          `Schema ${JSON.stringify(schema._def)} is already registered`,
        );
      }
      const ref = schema._def.openapi?.ref ?? key;
      components.schemas.set(schema, {
        type: 'partial',
        ref,
      });
    }
  });

  return Array.from(components.schemas).forEach(([schema, { type }]) => {
    if (type === 'partial') {
      const state: SchemaState = {
        components,
        type: schema._def.openapi?.refType ?? 'output',
      };

      createSchemaOrRef(schema, state);
    }
  });
};

const createParameters = (
  requestParams: ZodOpenApiComponentsObject['requestParams'],
  components: ComponentsObject,
): void => {
  if (!requestParams) {
    return;
  }

  Object.entries(requestParams).forEach(([paramType, zodObject]) => {
    Object.entries(zodObject._def.shape() as ZodRawShape).forEach(
      ([key, schema]: [string, ZodType]) => {
        if (schema instanceof ZodType) {
          if (components.parameters.has(schema)) {
            throw new Error(
              `Parameter ${JSON.stringify(schema._def)} is already registered`,
            );
          }
          const ref = schema._def.openapi?.param?.ref ?? key;
          components.parameters.set(schema, {
            type: 'partial',
            ref,
            in: paramType as oas31.ParameterLocation,
          });
        }
      },
    );
  });

  return Array.from(components.parameters).forEach(([schema, component]) => {
    if (component.type === 'partial') {
      createParamOrRef(schema, component.in, component.ref, components);
    }
  });
};

const createHeaders = (
  responseHeaders: ZodOpenApiComponentsObject['headers'],
  components: ComponentsObject,
): void => {
  if (!responseHeaders) {
    return;
  }

  if (!(responseHeaders instanceof ZodType)) {
    return;
  }

  Object.entries(responseHeaders._def.shape() as ZodRawShape).forEach(
    ([key, schema]: [string, ZodType]) => {
      if (components.parameters.has(schema)) {
        throw new Error(
          `Header ${JSON.stringify(schema._def)} is already registered`,
        );
      }
      const ref = schema._def.openapi?.param?.ref ?? key;
      components.headers.set(schema, {
        type: 'partial',
        ref,
      });
    },
  );

  return Array.from(components.headers).forEach(([schema, component]) => {
    if (component.type === 'partial') {
      createHeaderOrRef(schema, components);
    }
  });
};

const createResponses = (
  responses: ZodOpenApiComponentsObject['responses'],
  components: ComponentsObject,
): void => {
  if (!responses) {
    return;
  }

  Object.entries(responses).forEach(([key, responseObject]) => {
    if (components.responses.has(responseObject)) {
      throw new Error(
        `Header ${JSON.stringify(responseObject)} is already registered`,
      );
    }
    const ref = responseObject?.ref ?? key;
    components.responses.set(responseObject, {
      type: 'partial',
      ref,
    });
  });

  return Array.from(components.responses).forEach(([schema, component]) => {
    if (component.type === 'partial') {
      createResponse(schema, components);
    }
  });
};

const createRequestBodies = (
  requestBodies: ZodOpenApiComponentsObject['requestBodies'],
  components: ComponentsObject,
): void => {
  if (!requestBodies) {
    return;
  }

  Object.entries(requestBodies).forEach(([key, requestBody]) => {
    if (components.requestBodies.has(requestBody)) {
      throw new Error(
        `Header ${JSON.stringify(requestBody)} is already registered`,
      );
    }
    const ref = requestBody?.ref ?? key;
    components.requestBodies.set(requestBody, {
      type: 'partial',
      ref,
    });
  });

  return Array.from(components.requestBodies).forEach(([schema, component]) => {
    if (component.type === 'partial') {
      createRequestBody(schema, components);
    }
  });
};

export const createComponentSchemaRef = (schemaRef: string) =>
  `#/components/schemas/${schemaRef}`;

export const createComponentResponseRef = (responseRef: string) =>
  `#/components/responses/${responseRef}`;

export const createComponentRequestBodyRef = (requestBodyRef: string) =>
  `#/components/requestBodies/${requestBodyRef}`;

export const createComponents = (
  componentsObject: ZodOpenApiComponentsObject,
  components: ComponentsObject,
): oas31.ComponentsObject | undefined => {
  const combinedSchemas = createSchemaComponents(
    componentsObject,
    components.schemas,
  );
  const combinedParameters = createParamComponents(
    componentsObject,
    components.parameters,
  );
  const combinedHeaders = createHeaderComponents(
    componentsObject,
    components.headers,
  );
  const combinedResponses = createResponseComponents(components.responses);
  const combinedRequestBodies = createRequestBodiesComponents(
    components.requestBodies,
  );

  const { schemas, parameters, headers, responses, requestBodies, ...rest } =
    componentsObject;

  const finalComponents: oas31.ComponentsObject = {
    ...rest,
    ...(combinedSchemas && { schemas: combinedSchemas }),
    ...(combinedParameters && { parameters: combinedParameters }),
    ...(combinedRequestBodies && { requestBodies: combinedRequestBodies }),
    ...(combinedHeaders && { headers: combinedHeaders }),
    ...(combinedResponses && { responses: combinedResponses }),
  };
  return Object.keys(finalComponents).length ? finalComponents : undefined;
};

const createSchemaComponents = (
  componentsObject: ZodOpenApiComponentsObject,
  componentMap: SchemaComponentMap,
): oas31.ComponentsObject['schemas'] => {
  const customComponents = Object.entries(
    componentsObject.schemas ?? {},
  ).reduce<NonNullable<oas31.ComponentsObject['schemas']>>(
    (acc, [key, value]) => {
      if (value instanceof ZodType) {
        return acc;
      }

      if (acc[key]) {
        throw new Error(`Schema "${key}" is already registered`);
      }

      acc[key] = value as oas31.SchemaObject | oas31.ReferenceObject;
      return acc;
    },
    {},
  );

  const components = Array.from(componentMap).reduce<
    NonNullable<oas31.ComponentsObject['schemas']>
  >((acc, [_zodType, component]) => {
    if (component.type === 'complete') {
      if (acc[component.ref]) {
        throw new Error(`Schema "${component.ref}" is already registered`);
      }
      acc[component.ref] = component.schemaObject as oas31.SchemaObject;
    }

    return acc;
  }, customComponents);

  return Object.keys(components).length ? components : undefined;
};

const createParamComponents = (
  componentsObject: ZodOpenApiComponentsObject,
  componentMap: ParameterComponentMap,
): oas31.ComponentsObject['parameters'] => {
  const customComponents = Object.entries(
    componentsObject.parameters ?? {},
  ).reduce<NonNullable<oas31.ComponentsObject['parameters']>>(
    (acc, [key, value]) => {
      if (acc[key]) {
        throw new Error(`Parameter "${key}" is already registered`);
      }

      acc[key] = value as oas31.ParameterObject;
      return acc;
    },
    {},
  );

  const components = Array.from(componentMap).reduce<
    NonNullable<oas31.ComponentsObject['parameters']>
  >((acc, [_zodType, component]) => {
    if (component.type === 'complete') {
      if (acc[component.ref]) {
        throw new Error(`Parameter "${component.ref}" is already registered`);
      }
      acc[component.ref] = component.paramObject as oas31.ParameterObject;
    }

    return acc;
  }, customComponents);

  return Object.keys(components).length ? components : undefined;
};

const createHeaderComponents = (
  componentsObject: ZodOpenApiComponentsObject,
  componentMap: HeaderComponentMap,
): oas31.ComponentsObject['headers'] => {
  const headers = componentsObject.headers ?? {};
  const customComponents =
    headers instanceof ZodType
      ? {}
      : Object.entries(headers).reduce<
          NonNullable<oas31.ComponentsObject['headers']>
        >((acc, [key, value]) => {
          if (acc[key]) {
            throw new Error(`Header "${key}" is already registered`);
          }

          acc[key] = value as oas31.HeaderObject;
          return acc;
        }, {});

  const components = Array.from(componentMap).reduce<
    NonNullable<oas31.ComponentsObject['headers']>
  >((acc, [_zodType, component]) => {
    if (component.type === 'complete') {
      if (acc[component.ref]) {
        throw new Error(`Header "${component.ref}" is already registered`);
      }
      acc[component.ref] = component.headerObject as oas31.HeaderObject;
    }

    return acc;
  }, customComponents);

  return Object.keys(components).length ? components : undefined;
};

const createResponseComponents = (
  componentMap: ResponseComponentMap,
): oas31.ComponentsObject['responses'] => {
  const components = Array.from(componentMap).reduce<
    NonNullable<oas31.ComponentsObject['responses']>
  >((acc, [_zodType, component]) => {
    if (component.type === 'complete') {
      if (acc[component.ref]) {
        throw new Error(`Response "${component.ref}" is already registered`);
      }
      acc[component.ref] = component.responseObject as oas31.ResponseObject;
    }

    return acc;
  }, {});

  return Object.keys(components).length ? components : undefined;
};

const createRequestBodiesComponents = (
  componentMap: RequestBodyComponentMap,
): oas31.ComponentsObject['requestBodies'] => {
  const components = Array.from(componentMap).reduce<
    NonNullable<oas31.ComponentsObject['requestBodies']>
  >((acc, [_zodType, component]) => {
    if (component.type === 'complete') {
      if (acc[component.ref]) {
        throw new Error(`RequestBody "${component.ref}" is already registered`);
      }
      acc[component.ref] =
        component.requestBodyObject as oas31.RequestBodyObject;
    }

    return acc;
  }, {});

  return Object.keys(components).length ? components : undefined;
};
