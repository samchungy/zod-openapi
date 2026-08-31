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

const inputOptin = (schema: $ZodType): 'optional' | undefined => {
  const def = (schema as $ZodTypes)._zod.def;
  // Transforms and catch set optin to "optional" at runtime so they can observe
  // an absent key, but their declared input type stays required. Unwrap to the
  // schema that actually carries optionality — same approach as Zod 4.5.4+
  // toJSONSchema.
  if (def.type === 'pipe' && def.in._zod.traits.has('$ZodTransform')) {
    return inputOptin(def.out);
  }
  if (def.type === 'catch') {
    return inputOptin(def.innerType);
  }
  return schema._zod.optin;
};

export const isRequired = (
  zodType: $ZodType,
  io: 'input' | 'output',
): boolean => {
  if (io === 'input') {
    return inputOptin(zodType) === undefined;
  }
  return zodType._zod.optout === undefined;
};
