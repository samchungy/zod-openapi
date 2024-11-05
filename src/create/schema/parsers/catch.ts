import type { ZodCatch, ZodTypeAny } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema';
import { enhanceWithMetadata } from '../metadata';

export const createCatchSchema = <T extends ZodTypeAny>(
  zodCatch: ZodCatch<T>,
  state: SchemaState,
): Schema => {
  const schemaObject = createSchemaObject(zodCatch._def.innerType, state, [
    'default',
  ]);

  const catchResult = zodCatch.safeParse(undefined);

  const maybeDefaultValue: Pick<oas31.SchemaObject, 'default'> | undefined =
    catchResult.success
      ? {
          default: catchResult.data,
        }
      : undefined;

  return enhanceWithMetadata(
    schemaObject,
    {
      ...maybeDefaultValue,
    },
    state,
  );
};
