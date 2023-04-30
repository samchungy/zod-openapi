import { ZodTuple, ZodTypeAny } from 'zod';

import { satisfiesVersion } from '../../openapi';
import { oas31 } from '../../openapi3-ts/dist';

import { SchemaState, createSchemaOrRef } from '.';

export const createTupleSchema = (
  zodTuple: ZodTuple<any, any>,
  state: SchemaState,
): oas31.SchemaObject => {
  const items = zodTuple.items as ZodTypeAny[];
  const rest = zodTuple._def.rest as ZodTypeAny;
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
    return items.map((item) => createSchemaOrRef(item, state));
  }
  return undefined;
};

const mapItemProperties = (
  items: ZodTypeAny[],
  rest: ZodTypeAny,
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
      items: createSchemaOrRef(rest, state),
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
        oneOf: [...prefixItems, createSchemaOrRef(rest, state)],
      },
    }),
  };
};
