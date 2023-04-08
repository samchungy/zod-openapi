import { oas31 } from 'openapi3-ts';
import { ZodType } from 'zod';

interface Schema {
  zodSchema: ZodType;
  schemaObject: oas31.SchemaObject;
}

interface SchemaComponent {
  [ref: string]: Schema | undefined;
}

interface Components {
  schema: SchemaComponent;
}

export const components: Components = {
  schema: {},
};

export const createComponents = (): oas31.ComponentsObject => ({});
