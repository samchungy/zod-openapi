import type { ZodLiteral } from 'zod';

import { satisfiesVersion } from '../../../openapi';
import type { oas31 } from '../../../openapi3-ts/dist/index';
import type { Schema, SchemaState } from '../index';

import { createNullSchema } from './null';

export const createLiteralSchema = (
  zodLiteral: ZodLiteral<unknown>,
  state: SchemaState,
): Schema => {
  if (zodLiteral.value === null) {
    return createNullSchema();
  }

  if (satisfiesVersion(state.components.openapi, '3.1.0')) {
    return {
      type: 'schema',
      schema: {
        type: typeof zodLiteral.value as oas31.SchemaObject['type'],
        const: zodLiteral.value,
      },
    };
  }

  return {
    type: 'schema',
    schema: {
      type: typeof zodLiteral.value as oas31.SchemaObject['type'],
      enum: [zodLiteral.value],
    },
  };
};
