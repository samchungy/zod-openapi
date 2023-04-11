import { oas31 } from 'openapi3-ts';
import { EnumLike, ZodNativeEnum } from 'zod';

export const createNativeEnumSchema = <T extends EnumLike>(
  zodEnum: ZodNativeEnum<T>,
): oas31.SchemaObject | oas31.ReferenceObject => {
  const enumValues = getValidEnumValues(zodEnum._def.values);
  const { numbers, strings } = sortStringsAndNumbers(enumValues);

  if (strings.length && numbers.length) {
    return {
      type: ['string', 'number'],
      enum: [...strings, ...numbers],
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
