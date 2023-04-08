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

import { components } from '../../components';

import { createArraySchema } from './array';
import { createBooleanSchema } from './boolean';
import { createDateSchema } from './date';
import { createDefaultSchema } from './default';
import { createDiscriminatedUnionSchema } from './discriminatedUnion';
import { createEnumSchema } from './enum';
import { createLiteralSchema } from './literal';
import { createNullSchema } from './null';
import { createNullableSchemaObject } from './nullable';
import { createNumberSchema } from './number';
import { createObjectSchema } from './object';
import { createOptionalSchema } from './optional';
import { createRecordSchema } from './record';
import { createStringSchema } from './string';
import { createTupleSchema } from './tuple';
import { createUnionSchema } from './union';

const createSchema = <
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
    return createBooleanSchema();
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
    return createNullSchema();
  }

  if (zodSchema instanceof ZodNullable) {
    return createNullableSchemaObject(zodSchema);
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
    return createDateSchema();
  }

  return {};
};

// const createSchemaWithMetadata = <
//   Output = any,
//   Def extends ZodTypeDef = ZodTypeDef,
//   Input = Output,
// >(
//   zodSchema: ZodType<Output, Def, Input>,
// ): oas31.SchemaObject | oas31.ReferenceObject => {
//   const schemaOrRef = createSchema(zodSchema);

//   if ('$ref' in schemaOrRef) {
//     return {

//     }
//   }
// };

export const createSchemaOrRef = <
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
): oas31.SchemaObject | oas31.ReferenceObject => {
  const schemaRef = zodSchema._def.openapi?.schemaRef;

  if (!schemaRef) {
    return createSchema(zodSchema);
  }

  const component = components.schema[schemaRef];

  if (component && component.zodSchema !== zodSchema) {
    throw new Error(`schemaRef "${schemaRef}" is already registered`);
  }

  // Optional Objects can return a reference object
  const schemaOrRefObject = createSchema(zodSchema);
  if ('$ref' in schemaOrRefObject) {
    throw new Error('Unexpected Error: received a reference object');
  }

  components.schema[schemaRef] = {
    schemaObject: schemaOrRefObject,
    zodSchema,
  };

  return {
    $ref: createComponentSchemaRef(schemaRef),
  };
};

export const createComponentSchemaRef = (schemaRef: string) =>
  `#/components/schemas/${schemaRef}`;
