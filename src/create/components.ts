import type { ZodType } from 'zod';

import type { oas30, oas31 } from '../openapi3-ts/dist';
import { isAnyZodType } from '../zodType';

import type {
  ZodOpenApiComponentsObject,
  ZodOpenApiRequestBodyObject,
  ZodOpenApiResponseObject,
  ZodOpenApiVersion,
} from './document';
import { createParamOrRef } from './parameters';
import { createRequestBody } from './paths';
import { createHeaderOrRef, createResponse } from './responses';
import { type SchemaState, createSchemaObject, newSchemaState } from './schema';

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

/**
 *
 */
export interface ManualSchemaComponent extends BaseSchemaComponent {
  type: 'manual';
}

export interface InProgressSchemaComponent extends BaseSchemaComponent {
  type: 'in-progress';
}

interface BaseSchemaComponent {
  ref: string;
}

export type SchemaComponent =
  | CompleteSchemaComponent
  | ManualSchemaComponent
  | InProgressSchemaComponent;

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
  type: 'manual';
}

interface BaseParameterComponent {
  ref: string;
  in: oas31.ParameterLocation;
  name: string;
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
  type: 'manual';
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
  type: 'manual';
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
  type: 'manual';
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

  getSchemas(componentsObject.schemas, defaultComponents);
  getParameters(componentsObject.parameters, defaultComponents);
  getRequestBodies(componentsObject.requestBodies, defaultComponents);
  getHeaders(componentsObject.headers, defaultComponents);
  getResponses(componentsObject.responses, defaultComponents);

  return defaultComponents;
};

const getSchemas = (
  schemas: ZodOpenApiComponentsObject['schemas'],
  components: ComponentsObject,
): void => {
  if (!schemas) {
    return;
  }

  Object.entries(schemas).forEach(([key, schema]) => {
    if (isAnyZodType(schema)) {
      if (components.schemas.has(schema)) {
        throw new Error(
          `Schema ${JSON.stringify(schema._def)} is already registered`,
        );
      }
      const ref = schema._def.openapi?.ref ?? key;
      components.schemas.set(schema, {
        type: 'manual',
        ref,
      });
    }
  });
};

const getParameters = (
  parameters: ZodOpenApiComponentsObject['parameters'],
  components: ComponentsObject,
): void => {
  if (!parameters) {
    return;
  }

  Object.entries(parameters).forEach(([key, schema]) => {
    if (isAnyZodType(schema)) {
      if (components.parameters.has(schema)) {
        throw new Error(
          `Parameter ${JSON.stringify(schema._def)} is already registered`,
        );
      }
      const ref = schema._def.openapi?.param?.ref ?? key;
      const name = schema._def.openapi?.param?.name;
      const location = schema._def.openapi?.param?.in;

      if (!name || !location) {
        throw new Error('`name` or `in` missing in .openapi()');
      }
      components.parameters.set(schema, {
        type: 'manual',
        ref,
        in: location,
        name,
      });
    }
  });
};

const getHeaders = (
  responseHeaders: ZodOpenApiComponentsObject['headers'],
  components: ComponentsObject,
): void => {
  if (!responseHeaders) {
    return;
  }

  Object.entries(responseHeaders).forEach(([key, schema]) => {
    if (isAnyZodType(schema)) {
      if (components.parameters.has(schema)) {
        throw new Error(
          `Header ${JSON.stringify(schema._def)} is already registered`,
        );
      }
      const ref = schema._def.openapi?.param?.ref ?? key;
      components.headers.set(schema, {
        type: 'manual',
        ref,
      });
    }
  });
};

const getResponses = (
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
      type: 'manual',
      ref,
    });
  });
};

const getRequestBodies = (
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
      type: 'manual',
      ref,
    });
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
  const combinedSchemas = createSchemaComponents(componentsObject, components);
  const combinedParameters = createParamComponents(
    componentsObject,
    components,
  );
  const combinedHeaders = createHeaderComponents(componentsObject, components);
  const combinedResponses = createResponseComponents(components);
  const combinedRequestBodies = createRequestBodiesComponents(components);

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
  components: ComponentsObject,
): oas31.ComponentsObject['schemas'] => {
  Array.from(components.schemas).forEach(([schema, { type }], index) => {
    if (type === 'manual') {
      const state: SchemaState = newSchemaState({
        components,
        type: schema._def.openapi?.refType ?? 'output',
        path: [],
        visited: new Set(),
      });

      createSchemaObject(schema, state, [`component schema index ${index}`]);
    }
  });

  const customComponents = Object.entries(
    componentsObject.schemas ?? {},
  ).reduce<NonNullable<oas31.ComponentsObject['schemas']>>(
    (acc, [key, value]) => {
      if (isAnyZodType(value)) {
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

  const finalComponents = Array.from(components.schemas).reduce<
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

  return Object.keys(finalComponents).length ? finalComponents : undefined;
};

const createParamComponents = (
  componentsObject: ZodOpenApiComponentsObject,
  components: ComponentsObject,
): oas31.ComponentsObject['parameters'] => {
  Array.from(components.parameters).forEach(([schema, component], index) => {
    if (component.type === 'manual') {
      createParamOrRef(
        schema,
        components,
        [`component parameter index ${index}`],
        component.in,
        component.ref,
      );
    }
  });

  const customComponents = Object.entries(
    componentsObject.parameters ?? {},
  ).reduce<NonNullable<oas31.ComponentsObject['parameters']>>(
    (acc, [key, value]) => {
      if (!isAnyZodType(value)) {
        if (acc[key]) {
          throw new Error(`Parameter "${key}" is already registered`);
        }

        acc[key] = value as oas31.ParameterObject;
      }
      return acc;
    },
    {},
  );

  const finalComponents = Array.from(components.parameters).reduce<
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

  return Object.keys(finalComponents).length ? finalComponents : undefined;
};

const createHeaderComponents = (
  componentsObject: ZodOpenApiComponentsObject,
  components: ComponentsObject,
): oas31.ComponentsObject['headers'] => {
  Array.from(components.headers).forEach(([schema, component]) => {
    if (component.type === 'manual') {
      createHeaderOrRef(schema, components);
    }
  });

  const headers = componentsObject.headers ?? {};
  const customComponents = Object.entries(headers).reduce<
    NonNullable<oas31.ComponentsObject['headers']>
  >((acc, [key, value]) => {
    if (!isAnyZodType(value)) {
      if (acc[key]) {
        throw new Error(`Header Ref "${key}" is already registered`);
      }

      acc[key] = value as oas31.HeaderObject;
    }
    return acc;
  }, {});

  const finalComponents = Array.from(components.headers).reduce<
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

  return Object.keys(finalComponents).length ? finalComponents : undefined;
};

const createResponseComponents = (
  components: ComponentsObject,
): oas31.ComponentsObject['responses'] => {
  Array.from(components.responses).forEach(([schema, component], index) => {
    if (component.type === 'manual') {
      createResponse(schema, components, [`component response index ${index}`]);
    }
  });

  const finalComponents = Array.from(components.responses).reduce<
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

  return Object.keys(finalComponents).length ? finalComponents : undefined;
};

const createRequestBodiesComponents = (
  components: ComponentsObject,
): oas31.ComponentsObject['requestBodies'] => {
  Array.from(components.requestBodies).forEach(([schema, component], index) => {
    if (component.type === 'manual') {
      createRequestBody(schema, components, [
        `component request body ${index}`,
      ]);
    }
  });

  const finalComponents = Array.from(components.requestBodies).reduce<
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

  return Object.keys(finalComponents).length ? finalComponents : undefined;
};
