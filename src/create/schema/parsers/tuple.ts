import type { ZodTuple, ZodTypeAny } from 'zod';

import { satisfiesVersion } from '../../../openapi';
import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema';

import { flattenEffects } from './transform';

export const createTupleSchema = <
  T extends [] | [ZodTypeAny, ...ZodTypeAny[]] = [ZodTypeAny, ...ZodTypeAny[]],
  Rest extends ZodTypeAny | null = null,
>(
  zodTuple: ZodTuple<T, Rest>,
  state: SchemaState,
): Schema => {
  const items = zodTuple.items;
  const rest = zodTuple._def.rest;

  const prefixItems = mapPrefixItems(items, state);

  if (satisfiesVersion(state.components.openapi, '3.1.0')) {
    if (!rest) {
      return {
        type: 'schema',
        schema: {
          type: 'array',
          maxItems: items.length,
          minItems: items.length,
          ...(prefixItems && {
            prefixItems: prefixItems.schemas.map((item) => item.schema),
          }),
        },
        effects: prefixItems?.effects,
      };
    }

    const itemSchema = createSchemaObject(rest, state, ['tuple items']);

    return {
      type: 'schema',
      schema: {
        type: 'array',
        items: itemSchema.schema,
        ...(prefixItems && {
          prefixItems: prefixItems.schemas.map((item) => item.schema),
        }),
      },
      effects: flattenEffects([prefixItems?.effects, itemSchema.effects]),
    };
  }

  if (!rest) {
    return {
      type: 'schema',
      schema: {
        type: 'array',
        maxItems: items.length,
        minItems: items.length,
        ...(prefixItems && {
          items: { oneOf: prefixItems.schemas.map((item) => item.schema) },
        }),
      },
      effects: prefixItems?.effects,
    };
  }

  if (prefixItems) {
    const restSchema = createSchemaObject(rest, state, ['tuple items']);
    return {
      type: 'schema',
      schema: {
        type: 'array',
        items: {
          oneOf: [
            ...prefixItems.schemas.map((item) => item.schema),
            restSchema.schema,
          ],
        },
      },
      effects: flattenEffects([restSchema.effects, prefixItems.effects]),
    };
  }

  return {
    type: 'schema',
    schema: {
      type: 'array',
    },
  };
};

const mapPrefixItems = (
  items: ZodTypeAny[],
  state: SchemaState,
): { effects?: Schema['effects']; schemas: Schema[] } | undefined => {
  if (items.length) {
    const schemas = items.map((item, index) =>
      createSchemaObject(item, state, [`tuple item ${index}`]),
    );

    return {
      effects: flattenEffects(schemas.map((s) => s.effects)),
      schemas,
    };
  }
  return undefined;
};
