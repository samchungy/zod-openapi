import { oas30, oas31 } from 'openapi3-ts';
import { ZodType } from 'zod';

import { ZodOpenApiComponentsObject, ZodOpenApiVersion } from './document';
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

export interface ParameterComponent {
  zodSchema?: ZodType;
  paramObject:
    | oas31.ParameterObject
    | oas31.ReferenceObject
    | oas30.ParameterObject
    | oas30.ReferenceObject;
}

interface ParametersComponentObject {
  [ref: string]: ParameterComponent | undefined;
}

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
  parameters: ParametersComponentObject;
  headers: HeadersComponentObject;
  openapi: ZodOpenApiVersion;
}

export const getDefaultComponents = (
  componentsObject?: ZodOpenApiComponentsObject,
  openapi: ZodOpenApiVersion = '3.1.0',
): ComponentsObject => {
  const defaultComponents: ComponentsObject = {
    schemas: new Map(),
    parameters: {},
    headers: {},
    openapi,
  };
  if (!componentsObject) {
    return defaultComponents;
  }

  createSchemas(componentsObject.schemas, defaultComponents);
  createParameters(componentsObject.parameters, defaultComponents);
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
        schemaObject: createSchemaWithMetadata(schema, state),
        creationType: state.effectType,
      });
    }
  });

  return Array.from(components.schemas).forEach(([schema, { ref }]) => {
    const state: SchemaState = {
      components,
      type: schema._def.openapi?.refType ?? 'output',
    };

    const schemaObject = createSchemaWithMetadata(schema, state);

    components.schemas.set(schema, {
      type: 'complete',
      ref,
      schemaObject,
      creationType: state.effectType,
    });
  });
};

const createParameters = (
  parameters: ZodOpenApiComponentsObject['parameters'],
  components: ComponentsObject,
): void => {
  if (!parameters) {
    return;
  }
  return Object.entries(parameters).forEach(([key, schema]) => {
    const component = components.parameters[key];
    if (component) {
      throw new Error(`parameter "${key}" is already registered`);
    }

    components.parameters[key] = {
      paramObject: schema,
    };
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
  const combinedParameters = createParamComponents(components.parameters);
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
  >((acc, [_zodType, value]) => {
    if (value.type === 'complete') {
      if (acc[value.ref]) {
        throw new Error(`Schema "${value.ref}" is already registered`);
      }
      acc[value.ref] = value.schemaObject as oas31.SchemaObject;
    }

    return acc;
  }, customComponents);

  return Object.keys(components).length ? components : undefined;
};

const createParamComponents = (
  component: ParametersComponentObject,
): oas31.ComponentsObject['parameters'] => {
  const components = Object.entries(component).reduce<
    NonNullable<oas31.ComponentsObject['parameters']>
  >((acc, [key, value]) => {
    if (value) {
      acc[key] = value.paramObject as oas31.ParameterObject;
    }
    return acc;
  }, {});

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
