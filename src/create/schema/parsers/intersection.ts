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
  const schemas = flattenIntersections(zodIntersection);
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

export const flattenIntersections = (zodType: ZodTypeAny): ZodTypeAny[] => {
  if (!isZodType(zodType, 'ZodIntersection')) {
    return [zodType];
  }

  const leftSubTypes = flattenIntersections(zodType._def.left);
  const rightSubTypes = flattenIntersections(zodType._def.right);

  return [...leftSubTypes, ...rightSubTypes];
};
