import { oas30, oas31 } from 'openapi3-ts';
import { ParameterLocation } from 'openapi3-ts/dist/mjs/oas31';
import { ZodRawShape, ZodType } from 'zod';

import { ZodOpenApiComponentsObject, ZodOpenApiVersion } from './document';
import { createBaseParameter } from './parameters';
import { SchemaState } from './schema';
import { createSchemaWithMetadata } from './schema/metadata';

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
  type: 'partial';
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
  in: ParameterLocation;
}

interface BaseParameterComponent {
  ref: string;
}

export type ParameterComponent =
  | CompleteParameterComponent
  | PartialParameterComponent;

export type ParameterComponentMap = Map<ZodType, ParameterComponent>;

export interface Header {
  zodSchema?: ZodType;
  headerObject:
    | oas31.HeaderObject
    | oas31.ReferenceObject
    | oas30.HeaderObject
    | oas30.ReferenceObject;
}

interface HeadersComponentObject {
  [ref: string]: Header | undefined;
}

export interface ComponentsObject {
  schemas: SchemaComponentMap;
  parameters: ParameterComponentMap;
  headers: HeadersComponentObject;
  openapi: ZodOpenApiVersion;
}

export const getDefaultComponents = (
  componentsObject?: ZodOpenApiComponentsObject,
  openapi: ZodOpenApiVersion = '3.1.0',
): ComponentsObject => {
  const defaultComponents: ComponentsObject = {
    schemas: new Map(),
    parameters: new Map(),
    headers: {},
    openapi,
  };
  if (!componentsObject) {
    return defaultComponents;
  }

  createSchemas(componentsObject.schemas, defaultComponents);
  createParameters(componentsObject.requestParams, defaultComponents);
  createHeaders(componentsObject.headers, defaultComponents);

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
          `schema ${JSON.stringify(schema._def)} is already registered`,
        );
      }
      const ref = schema._def.openapi?.ref ?? key;
      components.schemas.set(schema, {
        type: 'partial',
        ref,
      });
    }
  });

  return Array.from(components.schemas).forEach(([schema, { ref, type }]) => {
    if (type === 'partial') {
      const state: SchemaState = {
        components,
        type: schema._def.openapi?.refType ?? 'output',
      };

      const schemaObject = createSchemaWithMetadata(schema, state);

      components.schemas.set(schema, {
        type: 'complete',
        ref,
        schemaObject,
        ...(state.effectType && { creationType: state.effectType }),
      });
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
              `parameter ${JSON.stringify(schema._def)} is already registered`,
            );
          }
          const ref = schema._def.openapi?.param?.ref ?? key;
          components.parameters.set(schema, {
            type: 'partial',
            ref,
            in: paramType as ParameterLocation,
          });
        }
      },
    );
  });

  return Array.from(components.parameters).forEach(([schema, component]) => {
    if (component.type === 'partial') {
      const parameter = createBaseParameter(schema, components);

      components.parameters.set(schema, {
        type: 'complete',
        ref: component.ref,
        paramObject: {
          in: component.in,
          name: component.ref,
          ...parameter,
        },
      });
    }
  });
};

const createHeaders = (
  headers: ZodOpenApiComponentsObject['headers'],
  components: ComponentsObject,
): void => {
  if (!headers) {
    return;
  }
  return Object.entries(headers).forEach(([key, schema]) => {
    const component = components.headers[key];
    if (component) {
      throw new Error(`header "${key}" is already registered`);
    }

    components.headers[key] = {
      headerObject: schema,
    };
  });
};

export const createComponentSchemaRef = (schemaRef: string) =>
  `#/components/schemas/${schemaRef}`;
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
  const combinedHeaders = createHeaderComponents(components.headers);

  const { schemas, parameters, headers, ...rest } = componentsObject;

  const finalComponents: oas31.ComponentsObject = {
    ...rest,
    ...(combinedSchemas && { schemas: combinedSchemas }),
    ...(combinedParameters && { parameters: combinedParameters }),
    ...(combinedHeaders && { headers: combinedHeaders }),
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
  component: HeadersComponentObject,
): oas31.ComponentsObject['headers'] => {
  const components = Object.entries(component).reduce<
    NonNullable<oas31.ComponentsObject['headers']>
  >((acc, [key, value]) => {
    if (value) {
      acc[key] = value.headerObject as oas31.HeaderObject;
    }
    return acc;
  }, {});

  return Object.keys(components).length ? components : undefined;
};
