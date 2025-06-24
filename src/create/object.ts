import type { $ZodObject, $ZodType, $ZodTypes } from 'zod/v4/core';

export const unwrapZodObject = (
  zodType: $ZodTypes,
  io: 'input' | 'output',
  path: string[],
): $ZodObject => {
  const def = zodType._zod.def;
  switch (def.type) {
    case 'object': {
      return zodType as $ZodObject;
    }
    case 'lazy': {
      return unwrapZodObject(def.getter() as $ZodTypes, io, path);
    }
    case 'pipe': {
      if (io === 'input') {
        return unwrapZodObject(def.in as $ZodTypes, io, path);
      }
      return unwrapZodObject(def.out as $ZodTypes, io, path);
    }
  }
  throw new Error(
    `Failed to unwrap ZodObject from type: ${zodType._zod.def.type} at ${path.join(' > ')}`,
  );
};

export const isRequired = (
  zodType: $ZodType,
  io: 'input' | 'output',
): boolean => {
  if (io === 'input') {
    return zodType._zod.optin === undefined;
  }
  return zodType._zod.optout === undefined;
};
