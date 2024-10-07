import type { EnumLike, ZodNativeEnum } from 'zod';

import { satisfiesVersion } from '../../../openapi';
import type { Schema, SchemaState } from '../../schema';

export const createNativeEnumSchema = <T extends EnumLike>(
  zodEnum: ZodNativeEnum<T>,
  state: SchemaState,
): Schema => {
  const enumValues = getValidEnumValues(zodEnum._def.values);
  const { numbers, strings } = sortStringsAndNumbers(enumValues);

  if (strings.length && numbers.length) {
    if (satisfiesVersion(state.components.openapi, '3.1.0')) {
      return {
        type: 'schema',
        schema: {
          type: ['string', 'number'],
          enum: [...strings, ...numbers],
        },
      };
    }
    return {
      type: 'schema',
      schema: {
        oneOf: [
          { type: 'string', enum: strings },
          { type: 'number', enum: numbers },
        ],
      },
    };
  }

  if (strings.length) {
    return {
      type: 'schema',
      schema: {
        type: 'string',
        enum: strings,
      },
    };
  }

  return {
    type: 'schema',
    schema: {
      type: 'number',
      enum: numbers,
    },
  };
};

interface StringsAndNumbers {
  strings: string[];
  numbers: number[];
}

export const getValidEnumValues = (enumValues: EnumLike) => {
  const keys = Object.keys(enumValues).filter(
    (key) => typeof enumValues[enumValues[key] as number] !== 'number',
  );
  return keys.map((key) => enumValues[key] as number);
};

export const sortStringsAndNumbers = (
  values: Array<string | number>,
): StringsAndNumbers => ({
  strings: values.filter((value): value is string => typeof value === 'string'),
  numbers: values.filter((value): value is number => typeof value === 'number'),
});
