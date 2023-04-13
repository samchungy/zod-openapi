import { oas31 } from 'openapi3-ts';
import { ZodObject, ZodType } from 'zod';

import { ZodOpenApiComponentsObject } from './document';
import { createSchemaOrRef } from './schema';

export interface Schema {
  zodSchema?: ZodType;
  schemaObject: oas31.SchemaObject | oas31.ReferenceObject;
}

interface SchemaComponent {
  [ref: string]: Schema | undefined;
}

export interface Parameter {
  zodSchema?: ZodType;
  paramObject: oas31.ParameterObject | oas31.ReferenceObject;
}

interface ParamComponent {
  [ref: string]: Parameter | undefined;
}

export interface Components {
  schemas: SchemaComponent;
  parameters: ParamComponent;
}

export const getDefaultComponents = (
  componentsObject?: ZodOpenApiComponentsObject,
): Components => {
  const defaultComponents = { schemas: {}, parameters: {} };
  if (!componentsObject) {
    return defaultComponents;
  }

  createSchemas(componentsObject.schemas, defaultComponents);
  createParameters(componentsObject.parameters, defaultComponents);

  return defaultComponents;
};

export const createSchemas = (
  schemas: ZodOpenApiComponentsObject['schemas'],
  components: Components,
): void => {
  if (!schemas) {
    return;
  }
  return Object.entries(schemas).forEach(([key, schema]) => {
    const component = components.schemas[key];
    if (component) {
      throw new Error(`schemaRef "${key}" is already registered`);
    }

    if (schema instanceof ZodObject) {
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

export const createParameters = (
  parameters: ZodOpenApiComponentsObject['parameters'],
  components: Components,
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

export const createComponentSchemaRef = (schemaRef: string) =>
  `#/components/schemas/${schemaRef}`;

export const createComponents = (
  componentsObject: ZodOpenApiComponentsObject | undefined,
  components: Components,
): oas31.ComponentsObject | undefined => {
  const schemas = createSchemaComponents(components.schemas);
  const parameters = createParamComponents(components.parameters);

  const {
    schemas: _schemas,
    parameters: _parameters,
    ...rest
  } = componentsObject ?? {};

  const componentsObj: oas31.ComponentsObject = {
    ...rest,
    ...(schemas && { schemas }),
    ...(parameters && { parameters }),
  };
  return Object.keys(componentsObj).length ? componentsObj : undefined;
};

export const createSchemaComponents = (
  component: SchemaComponent,
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

export const createParamComponents = (
  component: ParamComponent,
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
