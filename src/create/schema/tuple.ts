import { oas31 } from 'openapi3-ts';
import { ZodTuple, ZodTypeAny } from 'zod';

import { createSchemaOrRef } from '.';

export const createTupleSchema = (
  zodTuple: ZodTuple<any, any>,
): oas31.SchemaObject => {
  const items = zodTuple.items as ZodTypeAny[];
  const rest = zodTuple._def.rest as ZodTypeAny;
  return {
    type: 'array',
    ...mapPrefixItems(items),
    ...mapItemProperties(items, rest),
  } as oas31.SchemaObject;
};

const mapPrefixItems = (
  items: ZodTypeAny[],
):
  | { prefixItems: (oas31.SchemaObject | oas31.ReferenceObject)[] }
  | undefined =>
  items.length
    ? { prefixItems: items.map((item) => createSchemaOrRef(item)) }
    : undefined;

const mapItemProperties = (
  items: ZodTypeAny[],
  rest: ZodTypeAny,
): Pick<oas31.SchemaObject, 'items' | 'minItems' | 'maxItems'> => {
  if (!rest) {
    return {
      maxItems: items.length,
      minItems: items.length,
    };
  }

  return {
    items: createSchemaOrRef(rest),
  };
};
