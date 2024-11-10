import type { ZodIntersection, ZodTypeAny } from 'zod';

import { isZodType } from '../../../zodType';
import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema';

import { flattenEffects } from './transform';

export const createIntersectionSchema = <
  T extends ZodTypeAny,
  U extends ZodTypeAny,
>(
  zodIntersection: ZodIntersection<T, U>,
  state: SchemaState,
): Schema => {
  const schemas = flattenIntersection(zodIntersection);
  const allOfs = schemas.map((schema, index) =>
    createSchemaObject(schema, state, [`intersection ${index}`]),
  );
  return {
    type: 'schema',
    schema: {
      allOf: allOfs.map((schema) => schema.schema),
    },
    effects: flattenEffects(allOfs.map((schema) => schema.effects)),
  };
};

export const flattenIntersection = (zodType: ZodTypeAny): ZodTypeAny[] => {
  if (!isZodType(zodType, 'ZodIntersection')) {
    return [zodType];
  }

  const leftSchemas = flattenIntersection(zodType._def.left);
  const rightSchemas = flattenIntersection(zodType._def.right);

  return [...leftSchemas, ...rightSchemas];
};
