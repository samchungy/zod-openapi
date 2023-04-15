import { oas31 } from 'openapi3-ts';
import { ZodTuple, ZodTypeAny } from 'zod';

import { satisfiesVersion } from '../../openapi';
import { ComponentsObject } from '../components';

import { createSchemaOrRef } from '.';

export const createTupleSchema = (
  zodTuple: ZodTuple<any, any>,
  components: ComponentsObject,
): oas31.SchemaObject => {
  const items = zodTuple.items as ZodTypeAny[];
  const rest = zodTuple._def.rest as ZodTypeAny;
  return {
    type: 'array',
    ...mapItemProperties(items, rest, components),
  } as oas31.SchemaObject;
};

const mapPrefixItems = (
  items: ZodTypeAny[],
  components: ComponentsObject,
): oas31.SchemaObject['prefixItems'] | undefined => {
  if (items.length) {
    return items.map((item) => createSchemaOrRef(item, components));
  }
  return undefined;
};

const mapItemProperties = (
  items: ZodTypeAny[],
  rest: ZodTypeAny,
  components: ComponentsObject,
): Pick<
  oas31.SchemaObject,
  'items' | 'minItems' | 'maxItems' | 'prefixItems'
> => {
  const prefixItems = mapPrefixItems(items, components);

  if (satisfiesVersion(components.openapi, '3.1.0')) {
    if (!rest) {
      return {
        maxItems: items.length,
        minItems: items.length,
        ...(prefixItems && { prefixItems }),
      };
    }

    return {
      items: createSchemaOrRef(rest, components),
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
      items: { oneOf: [...prefixItems, createSchemaOrRef(rest, components)] },
    }),
  };
};
