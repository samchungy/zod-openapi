import type { ZodOptional, ZodTypeAny } from 'zod';

import { isZodType } from '../../../zodType';
import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema';

export const createOptionalSchema = <T extends ZodTypeAny>(
  zodOptional: ZodOptional<T>,
  state: SchemaState,
): Schema => createSchemaObject(zodOptional.unwrap(), state, ['optional']); // Optional doesn't change OpenAPI schema

export const isOptionalObjectKey = (zodSchema: ZodTypeAny): boolean =>
  isZodType(zodSchema, 'ZodNever') ||
  isZodType(zodSchema, 'ZodUndefined') ||
  (isZodType(zodSchema, 'ZodOptional') &&
    isOptionalObjectKey(zodSchema.unwrap())) ||
  (isZodType(zodSchema, 'ZodLiteral') && zodSchema._def.value === undefined);
