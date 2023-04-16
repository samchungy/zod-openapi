import { oas30, oas31 } from 'openapi3-ts';
import { ZodNumber, ZodNumberCheck } from 'zod';

import { satisfiesVersion } from '../../openapi';
import { ComponentsObject } from '../components';
import { ZodOpenApiVersion } from '../document';

export const createNumberSchema = (
  zodNumber: ZodNumber,
  components: ComponentsObject,
): oas31.SchemaObject => {
  const zodNumberChecks = getZodNumberChecks(zodNumber);

  return {
    type: mapNumberType(zodNumberChecks),
    ...(mapRanges(zodNumberChecks, components.openapi) as oas31.SchemaObject), // union types are too pesky to drill through
  };
};

const mapRanges = (
  zodNumberChecks: ZodNumberCheckMap,
  openapi: ZodOpenApiVersion,
): Pick<
  oas31.SchemaObject | oas30.SchemaObject,
  'minimum' | 'maximum' | 'exclusiveMinimum' | 'exclusiveMaximum'
> => {
  const minimum = zodNumberChecks.min?.value;
  const maximum = zodNumberChecks.max?.value;

  const exclusiveMinimum = zodNumberChecks.min?.inclusive;
  const exclusiveMaximum = zodNumberChecks.max?.inclusive;

  return {
    ...(minimum !== undefined && { minimum }),
    ...(maximum !== undefined && { maximum }),
    ...(exclusiveMinimum && {
      exclusiveMinimum: satisfiesVersion(openapi, '3.1.0') ? minimum : true,
    }),
    ...(exclusiveMaximum && {
      exclusiveMaximum: satisfiesVersion(openapi, '3.1.0') ? maximum : true,
    }),
  };
};

type ZodNumberCheckMap = {
  [kind in ZodNumberCheck['kind']]?: Extract<ZodNumberCheck, { kind: kind }>;
};

const getZodNumberChecks = (zodNumber: ZodNumber): ZodNumberCheckMap =>
  zodNumber._def.checks.reduce<ZodNumberCheckMap>((acc, check) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    acc[check.kind] = check as any;
    return acc;
  }, {});

const mapNumberType = (
  zodNumberChecks: ZodNumberCheckMap,
): oas31.SchemaObject['type'] => (zodNumberChecks.int ? 'integer' : 'number');
