import type { KeySchema, ZodRecord, ZodString, ZodTypeAny } from 'zod';

import { satisfiesVersion } from '../../../openapi';
import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaObject } from '../../schema';

export const createRecordSchema = <
  Key extends KeySchema = ZodString,
  Value extends ZodTypeAny = ZodTypeAny,
>(
  zodRecord: ZodRecord<Key, Value>,
  state: SchemaState,
): oas31.SchemaObject => {
  const additionalProperties = createSchemaObject(
    zodRecord.valueSchema as ZodTypeAny,
    state,
    ['record value'],
  );

  const keySchema = createSchemaObject(zodRecord.keySchema, state, [
    'record key',
  ]);

  const maybeComponent =
    '$ref' in keySchema && state.components.schemas.get(zodRecord.keySchema);
  const maybeSchema =
    maybeComponent &&
    maybeComponent.type === 'complete' &&
    maybeComponent.schemaObject;

  const renderedKeySchema = maybeSchema || keySchema;

  if ('enum' in renderedKeySchema && renderedKeySchema.enum) {
    return {
      type: 'object',
      properties: (renderedKeySchema.enum as string[]).reduce<
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
    'type' in renderedKeySchema &&
    renderedKeySchema.type === 'string' &&
    Object.keys(renderedKeySchema).length > 1
  ) {
    return {
      type: 'object',
      // @ts-expect-error FIXME: https://github.com/metadevpro/openapi3-ts/pull/120
      propertyNames: keySchema,
      additionalProperties,
    };
  }

  return {
    type: 'object',
    additionalProperties,
  };
};
