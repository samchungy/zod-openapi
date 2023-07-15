import type { ZodRecord, ZodType, ZodTypeAny } from 'zod';

import { satisfiesVersion } from '../../../openapi';
import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaOrRef } from '../../schema';

export const createRecordSchema = (
  zodRecord: ZodRecord<any, any>,
  state: SchemaState,
): oas31.SchemaObject => {
  const additionalProperties = createSchemaOrRef(
    zodRecord.valueSchema as ZodTypeAny,
    state,
    ['record value'],
  );

  const keySchema = createSchemaOrRef(zodRecord.keySchema as ZodType, state, [
    'record key',
  ]);

  const maybeComponent =
    '$ref' in keySchema &&
    state.components.schemas.get(zodRecord.keySchema as ZodType);
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
