import { oas31 } from 'openapi3-ts';
import { ZodType } from 'zod';

export interface Schema {
  zodSchema: ZodType;
  schemaObject: oas31.SchemaObject;
}

interface SchemaComponent {
  [ref: string]: Schema | undefined;
}

export interface Parameter {
  zodSchema: ZodType;
  paramObject: oas31.ParameterObject;
}

interface ParamComponent {
  [ref: string]: Parameter | undefined;
}

export interface Components {
  schema: SchemaComponent;
  parameters: ParamComponent;
}

export const getDefaultComponents = (): Components => ({
  schema: {},
  parameters: {},
});
