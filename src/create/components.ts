import { oas31 } from 'openapi3-ts';
import { ZodType } from 'zod';

import { ZodOpenApiComponentsObject } from './document';
import { createSchemaOrRef } from './schema';

export interface Schema {
  zodSchema?: ZodType;
  schemaObject: oas31.SchemaObject | oas31.ReferenceObject;
}

interface SchemaComponentObject {
  [ref: string]: Schema | undefined;
}

export interface Parameter {
  zodSchema?: ZodType;
  paramObject: oas31.ParameterObject | oas31.ReferenceObject;
}

interface ParametersComponentObject {
  [ref: string]: Parameter | undefined;
}

export interface Header {
  zodSchema?: ZodType;
  headerObject: oas31.HeaderObject | oas31.ReferenceObject;
}

interface HeadersComponentObject {
  [ref: string]: Header | undefined;
}

export interface ComponentsObject {
  schemas: SchemaComponentObject;
  parameters: ParametersComponentObject;
  headers: HeadersComponentObject;
}

export const getDefaultComponents = (
  componentsObject?: Pick<
    ZodOpenApiComponentsObject,
    'schemas' | 'parameters' | 'headers'
  >,
): ComponentsObject => {
  const defaultComponents = { schemas: {}, parameters: {}, headers: {} };
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
  return Object.entries(schemas).forEach(([key, schema]) => {
    const component = components.schemas[key];
    if (component) {
      throw new Error(`schemaRef "${key}" is already registered`);
    }

    if (schema instanceof ZodType) {
      components.schemas[key] = {
        schemaObject: createSchemaOrRef(schema, components),
        zodSchema: schema,
      };
      return;
    }

    components.schemas[key] = {
      schemaObject: schema,
    };
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
  componentsObject:
    | Omit<ZodOpenApiComponentsObject, 'schemas' | 'parameters' | 'headers'>
    | undefined,
  components: ComponentsObject,
): oas31.ComponentsObject | undefined => {
  const schemas = createSchemaComponents(components.schemas);
  const parameters = createParamComponents(components.parameters);
  const headers = createHeaderComponents(components.headers);

  const finalComponents: oas31.ComponentsObject = {
    ...componentsObject,
    ...(schemas && { schemas }),
    ...(parameters && { parameters }),
    ...(headers && { headers }),
  };
  return Object.keys(finalComponents).length ? finalComponents : undefined;
};

const createSchemaComponents = (
  component: SchemaComponentObject,
): oas31.ComponentsObject['schemas'] => {
  const components = Object.entries(component).reduce<
    NonNullable<oas31.ComponentsObject['schemas']>
  >((acc, [key, value]) => {
    if (value) {
      acc[key] = value.schemaObject;
    }
    return acc;
  }, {});

  return Object.keys(components).length ? components : undefined;
};

const createParamComponents = (
  component: ParametersComponentObject,
): oas31.ComponentsObject['parameters'] => {
  const components = Object.entries(component).reduce<
    NonNullable<oas31.ComponentsObject['parameters']>
  >((acc, [key, value]) => {
    if (value) {
      acc[key] = value.paramObject;
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
      acc[key] = value.headerObject;
    }
    return acc;
  }, {});

  return Object.keys(components).length ? components : undefined;
};
