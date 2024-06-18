import type { KeySchema, ZodRecord, ZodString, ZodTypeAny } from 'zod';

import { satisfiesVersion } from '../../../openapi';
import type { oas31 } from '../../../openapi3-ts/dist/index';
import { type Schema, type SchemaState, createSchemaObject } from '../schema';

import { flattenEffects } from './transform';

export const createRecordSchema = <
  Key extends KeySchema = ZodString,
  Value extends ZodTypeAny = ZodTypeAny,
>(
  zodRecord: ZodRecord<Key, Value>,
  state: SchemaState,
): Schema => {
  const additionalProperties = createSchemaObject(
    zodRecord.valueSchema as ZodTypeAny,
    state,
    ['record value'],
  );

  const keySchema = createSchemaObject(zodRecord.keySchema, state, [
    'record key',
  ]);

  const maybeComponent = state.components.schemas.get(zodRecord.keySchema);
  const isComplete = maybeComponent && maybeComponent.type === 'complete';
  const maybeSchema = isComplete && maybeComponent.schemaObject;
  const maybeEffects = (isComplete && maybeComponent.effects) || undefined;

  const renderedKeySchema = maybeSchema || keySchema.schema;

  if ('enum' in renderedKeySchema && renderedKeySchema.enum) {
    return {
      type: 'schema',
      schema: {
        type: 'object',
        properties: (renderedKeySchema.enum as string[]).reduce<
          NonNullable<oas31.SchemaObject['properties']>
        >((acc, key) => {
          acc[key] = additionalProperties.schema;
          return acc;
        }, {}),
        additionalProperties: false,
      },
      effects: flattenEffects([
        keySchema.effects,
        additionalProperties.effects,
        maybeEffects,
      ]),
    };
  }

  if (
    satisfiesVersion(state.components.openapi, '3.1.0') &&
    'type' in renderedKeySchema &&
    renderedKeySchema.type === 'string' &&
    Object.keys(renderedKeySchema).length > 1
  ) {
    return {
      type: 'schema',
      schema: {
        type: 'object',
        propertyNames: keySchema.schema,
        additionalProperties: additionalProperties.schema,
      },
      effects: flattenEffects([
        keySchema.effects,
        additionalProperties.effects,
      ]),
    };
  }

  return {
    type: 'schema',
    schema: {
      type: 'object',
      additionalProperties: additionalProperties.schema,
    },
    effects: additionalProperties.effects,
  };
};
