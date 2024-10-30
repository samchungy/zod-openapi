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

export const isOptionalKeys = (zodSchema: ZodTypeAny) =>
  isZodType(zodSchema, 'ZodNever') ||
  isZodType(zodSchema, 'ZodUndefined') ||
  (isZodType(zodSchema, 'ZodLiteral') && zodSchema._def.value === undefined);
