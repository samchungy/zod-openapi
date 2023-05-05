import type { EnumLike, ZodNativeEnum } from 'zod';

import { satisfiesVersion } from '../../openapi';
import type { oas31 } from '../../openapi3-ts/dist';

import type { SchemaState } from '.';

export const createNativeEnumSchema = <T extends EnumLike>(
  zodEnum: ZodNativeEnum<T>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => {
  const enumValues = getValidEnumValues(zodEnum._def.values);
  const { numbers, strings } = sortStringsAndNumbers(enumValues);

  if (strings.length && numbers.length) {
    if (satisfiesVersion(state.components.openapi, '3.1.0'))
      return {
        type: ['string', 'number'],
        enum: [...strings, ...numbers],
      };
    return {
      oneOf: [
        { type: 'string', enum: strings },
        { type: 'number', enum: numbers },
      ],
    };
  }

  if (strings.length) {
    return {
      type: 'string',
      enum: strings,
    };
  }

  return {
    type: 'number',
    enum: numbers,
  };
};

interface StringsAndNumbers {
  strings: string[];
  numbers: number[];
}

export const getValidEnumValues = (enumValues: EnumLike) => {
  const keys = Object.keys(enumValues).filter(
    (key) => typeof enumValues[enumValues[key]] !== 'number',
  );
  return keys.map((key) => enumValues[key]);
};

export const sortStringsAndNumbers = (
  values: (string | number)[],
): StringsAndNumbers => ({
  strings: values.filter((value): value is string => typeof value === 'string'),
  numbers: values.filter((value): value is number => typeof value === 'number'),
});
