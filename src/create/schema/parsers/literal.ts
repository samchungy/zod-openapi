import type { ZodLiteral } from 'zod';

import type { Schema, SchemaState } from '..';
import { satisfiesVersion } from '../../../openapi';
import type { oas31 } from '../../../openapi3-ts/dist';

export const createLiteralSchema = (
  zodLiteral: ZodLiteral<unknown>,
  state: SchemaState,
): Schema => {
  if (satisfiesVersion(state.components.openapi, '3.1.0')) {
    return {
      type: 'schema',
      schema: {
        type: resolveLiteralType(zodLiteral.value),
        const: zodLiteral._def.value,
      },
    };
  }

  return {
    type: 'schema',
    schema: {
      type: resolveLiteralType(zodLiteral.value),
      enum: [zodLiteral._def.value],
    },
  };
};

export const resolveLiteralType = (
  value: unknown,
): oas31.SchemaObject['type'] => {
  if (value === null) {
    return 'null';
  }

  return typeof value as oas31.SchemaObject['type'],
};
