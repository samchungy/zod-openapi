import { oas31 } from 'openapi3-ts';
import { ZodTypeAny, ZodUnion } from 'zod';

import { ComponentsObject } from '../components';

import { createSchemaOrRef } from '.';

export const createUnionSchema = (
  zodUnion: ZodUnion<any>,
  components: ComponentsObject,
): oas31.SchemaObject => {
  const options = zodUnion.options as ZodTypeAny[];
  const schemas = options.map((option) =>
    createSchemaOrRef(option, components),
  );
  return {
    anyOf: schemas,
  };
};
