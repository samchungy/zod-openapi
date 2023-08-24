import type { ZodTuple, ZodTypeAny } from 'zod';

import { satisfiesVersion } from '../../../openapi';
import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaObject } from '../../schema';

export const createTupleSchema = <
  T extends [] | [ZodTypeAny, ...ZodTypeAny[]] = [ZodTypeAny, ...ZodTypeAny[]],
  Rest extends ZodTypeAny | null = null,
>(
  zodTuple: ZodTuple<T, Rest>,
  state: SchemaState,
): oas31.SchemaObject => {
  const items = zodTuple.items;
  const rest = zodTuple._def.rest;
  return {
    type: 'array',
    ...mapItemProperties(items, rest, state),
  } as oas31.SchemaObject;
};

const mapPrefixItems = (
  items: ZodTypeAny[],
  state: SchemaState,
): oas31.SchemaObject['prefixItems'] | undefined => {
  if (items.length) {
    return items.map((item, index) =>
      createSchemaObject(item, state, [`tuple item ${index}`]),
    );
  }
  return undefined;
};

const mapItemProperties = (
  items: ZodTypeAny[],
  rest: ZodTypeAny | null,
  state: SchemaState,
): Pick<
  oas31.SchemaObject,
  'items' | 'minItems' | 'maxItems' | 'prefixItems'
> => {
  const prefixItems = mapPrefixItems(items, state);

  if (satisfiesVersion(state.components.openapi, '3.1.0')) {
    if (!rest) {
      return {
        maxItems: items.length,
        minItems: items.length,
        ...(prefixItems && { prefixItems }),
      };
    }

    return {
      items: createSchemaObject(rest, state, ['tuple items']),
      ...(prefixItems && { prefixItems }),
    };
  }

  if (!rest) {
    return {
      maxItems: items.length,
      minItems: items.length,
      ...(prefixItems && { items: { oneOf: prefixItems } }),
    };
  }

  return {
    ...(prefixItems && {
      items: {
        oneOf: [
          ...prefixItems,
          createSchemaObject(rest, state, ['tuple items']),
        ],
      },
    }),
  };
};
