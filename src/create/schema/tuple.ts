import { oas31 } from 'openapi3-ts';
import { ZodTuple, ZodTypeAny } from 'zod';

import { Components } from '../components';

import { createSchemaOrRef } from '.';

export const createTupleSchema = (
  zodTuple: ZodTuple<any, any>,
  components: Components,
): oas31.SchemaObject => {
  const items = zodTuple.items as ZodTypeAny[];
  const rest = zodTuple._def.rest as ZodTypeAny;
  return {
    type: 'array',
    ...mapPrefixItems(items, components),
    ...mapItemProperties(items, rest, components),
  } as oas31.SchemaObject;
};

const mapPrefixItems = (
  items: ZodTypeAny[],
  components: Components,
):
  | { prefixItems: (oas31.SchemaObject | oas31.ReferenceObject)[] }
  | undefined =>
  items.length
    ? { prefixItems: items.map((item) => createSchemaOrRef(item, components)) }
    : undefined;

const mapItemProperties = (
  items: ZodTypeAny[],
  rest: ZodTypeAny,
  components: Components,
): Pick<oas31.SchemaObject, 'items' | 'minItems' | 'maxItems'> => {
  if (!rest) {
    return {
      maxItems: items.length,
      minItems: items.length,
    };
  }

  return {
    items: createSchemaOrRef(rest, components),
  };
};
