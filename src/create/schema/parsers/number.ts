import type { ZodNumber, ZodNumberCheck } from 'zod';

import { satisfiesVersion } from '../../../openapi';
import type { oas30, oas31 } from '../../../openapi3-ts/dist';
import type { ZodOpenApiVersion } from '../../document';
import type { Schema, SchemaState } from '../../schema';

export const createNumberSchema = (
  zodNumber: ZodNumber,
  state: SchemaState,
): Schema => {
  const zodNumberChecks = getZodNumberChecks(zodNumber);

  const minimum = mapMinimum(zodNumberChecks, state.components.openapi);
  const maximum = mapMaximum(zodNumberChecks, state.components.openapi);

  return {
    type: 'schema',
    schema: {
      type: mapNumberType(zodNumberChecks),
      ...(minimum && (minimum as oas31.SchemaObject)), // Union types are not easy to tame
      ...(maximum && (maximum as oas31.SchemaObject)),
    },
  };
};

export const mapMaximum = (
  zodNumberCheck: ZodNumberCheckMap,
  openapi: ZodOpenApiVersion,
):
  | Pick<
      oas31.SchemaObject | oas30.SchemaObject,
      'maximum' | 'exclusiveMaximum'
    >
  | undefined => {
  if (!zodNumberCheck.max) {
    return undefined;
  }

  const maximum = zodNumberCheck.max.value;
  if (zodNumberCheck.max.inclusive) {
    return { ...(maximum !== undefined && { maximum }) };
  }
  if (satisfiesVersion(openapi, '3.1.0')) {
    return { exclusiveMaximum: maximum };
  }
  return { maximum, exclusiveMaximum: true };
};
export const mapMinimum = (
  zodNumberCheck: ZodNumberCheckMap,
  openapi: ZodOpenApiVersion,
):
  | Pick<
      oas31.SchemaObject | oas30.SchemaObject,
      'minimum' | 'exclusiveMinimum'
    >
  | undefined => {
  if (!zodNumberCheck.min) {
    return undefined;
  }

  const minimum = zodNumberCheck.min.value;
  if (zodNumberCheck.min.inclusive) {
    return { ...(minimum !== undefined && { minimum }) };
  }
  if (satisfiesVersion(openapi, '3.1.0')) {
    return { exclusiveMinimum: minimum };
  }
  return { minimum, exclusiveMinimum: true };
};

type ZodNumberCheckMap = {
  [kind in ZodNumberCheck['kind']]?: Extract<ZodNumberCheck, { kind: kind }>;
};

const getZodNumberChecks = (zodNumber: ZodNumber): ZodNumberCheckMap =>
  zodNumber._def.checks.reduce<ZodNumberCheckMap>((acc, check) => {
    // union type issues
    acc[check.kind] = check as never;
    return acc;
  }, {});

const mapNumberType = (
  zodNumberChecks: ZodNumberCheckMap,
): oas31.SchemaObject['type'] => (zodNumberChecks.int ? 'integer' : 'number');
