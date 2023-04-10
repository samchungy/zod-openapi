import { oas31 } from 'openapi3-ts';
import {
  ZodArray,
  ZodBoolean,
  ZodDate,
  ZodDefault,
  ZodDiscriminatedUnion,
  ZodEnum,
  ZodLiteral,
  ZodNativeEnum,
  ZodNull,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodRecord,
  ZodString,
  ZodTuple,
  ZodType,
  ZodTypeDef,
  ZodUnion,
} from 'zod';

import { getComponents } from '../../components';

import { createArraySchema } from './array';
import { createBooleanSchema } from './boolean';
import { createDateSchema } from './date';
import { createDefaultSchema } from './default';
import { createDiscriminatedUnionSchema } from './discriminatedUnion';
import { createEnumSchema } from './enum';
import { createLiteralSchema } from './literal';
import { createSchemaWithMetadata } from './metadata';
import { createNullSchema } from './null';
import { createNullableSchema } from './nullable';
import { createNumberSchema } from './number';
import { createObjectSchema } from './object';
import { createOptionalSchema } from './optional';
import { createRecordSchema } from './record';
import { createStringSchema } from './string';
import { createTupleSchema } from './tuple';
import { createUnionSchema } from './union';

export const createSchema = <
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
): oas31.SchemaObject | oas31.ReferenceObject => {
  if (zodSchema instanceof ZodString) {
    return createStringSchema(zodSchema);
  }

  if (zodSchema instanceof ZodNumber) {
    return createNumberSchema(zodSchema);
  }

  if (zodSchema instanceof ZodBoolean) {
    return createBooleanSchema(zodSchema);
  }

  if (zodSchema instanceof ZodEnum) {
    return createEnumSchema(zodSchema);
  }

  if (zodSchema instanceof ZodLiteral) {
    return createLiteralSchema(zodSchema);
  }

  if (zodSchema instanceof ZodNativeEnum) {
    // TODO return createNativeEnumSchema(zodSchema);
  }

  if (zodSchema instanceof ZodArray) {
    return createArraySchema(zodSchema);
  }

  if (zodSchema instanceof ZodObject) {
    return createObjectSchema(zodSchema);
  }

  if (zodSchema instanceof ZodUnion) {
    return createUnionSchema(zodSchema);
  }

  if (zodSchema instanceof ZodDiscriminatedUnion) {
    return createDiscriminatedUnionSchema(zodSchema);
  }

  if (zodSchema instanceof ZodNull) {
    return createNullSchema(zodSchema);
  }

  if (zodSchema instanceof ZodNullable) {
    return createNullableSchema(zodSchema);
  }

  if (zodSchema instanceof ZodOptional) {
    return createOptionalSchema(zodSchema);
  }

  if (zodSchema instanceof ZodDefault) {
    return createDefaultSchema(zodSchema);
  }

  if (zodSchema instanceof ZodRecord) {
    return createRecordSchema(zodSchema);
  }

  if (zodSchema instanceof ZodTuple) {
    return createTupleSchema(zodSchema);
  }

  if (zodSchema instanceof ZodDate) {
    return createDateSchema(zodSchema);
  }

  if (!zodSchema._def.openapi?.type) {
    throw new Error(
      `Unknown schema ${zodSchema.toString()}. Please assign it a manual type`,
    );
  }

  return {};
};

export const createRegisteredSchema = <
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  schemaRef: string,
): oas31.ReferenceObject => {
  const components = getComponents();
  const component = components.schema[schemaRef];
  if (component) {
    if (component.zodSchema !== zodSchema) {
      throw new Error(`schemaRef "${schemaRef}" is already registered`);
    }
    return {
      $ref: createComponentSchemaRef(schemaRef),
    };
  }

  // Optional Objects can return a reference object
  const schemaOrRef = createSchemaWithMetadata(zodSchema);
  if ('$ref' in schemaOrRef) {
    throw new Error('Unexpected Error: received a reference object');
  }

  components.schema[schemaRef] = {
    schemaObject: schemaOrRef,
    zodSchema,
  };

  return {
    $ref: createComponentSchemaRef(schemaRef),
  };
};

export const createSchemaOrRef = <
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
): oas31.SchemaObject | oas31.ReferenceObject => {
  const schemaRef = zodSchema._def.openapi?.ref;
  if (schemaRef) {
    return createRegisteredSchema(zodSchema, schemaRef);
  }

  return createSchemaWithMetadata(zodSchema);
};

export const createComponentSchemaRef = (schemaRef: string) =>
  `#/components/schemas/${schemaRef}`;
