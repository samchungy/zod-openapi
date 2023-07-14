import { ZodEnum, type ZodRecord, ZodString, type ZodTypeAny } from 'zod';

import { satisfiesVersion } from '../../openapi';
import type { oas31 } from '../../openapi3-ts/dist';

import { type SchemaState, createSchemaOrRef } from '.';

export const createRecordSchema = (
  zodRecord: ZodRecord<any, any>,
  state: SchemaState,
): oas31.SchemaObject => {
  const additionalProperties = createSchemaOrRef(
    zodRecord.valueSchema as ZodTypeAny,
    state,
    ['record value'],
  );

  if (zodRecord.keySchema instanceof ZodEnum) {
    return {
      type: 'object',
      properties: (zodRecord.keySchema._def.values as string[]).reduce<
        NonNullable<oas31.SchemaObject['properties']>
      >((acc, key) => {
        acc[key] = additionalProperties;
        return acc;
      }, {}),
      additionalProperties: false,
    };
  }

  if (
    satisfiesVersion(state.components.openapi, '3.1.0') &&
    zodRecord.keySchema instanceof ZodString &&
    zodRecord.keySchema._def.checks.length
  ) {
    return {
      type: 'object',
      // @ts-expect-error FIXME: https://github.com/metadevpro/openapi3-ts/pull/120
      propertyNames: createSchemaOrRef(
        zodRecord.keySchema as ZodTypeAny,
        state,
        ['record key'],
      ),
      additionalProperties,
    };
  }

  return {
    type: 'object',
    additionalProperties,
  };
};
