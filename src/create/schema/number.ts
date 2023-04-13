import { oas31 } from 'openapi3-ts';
import { ZodNumber, ZodNumberCheck } from 'zod';

export const createNumberSchema = (
  zodNumber: ZodNumber,
): oas31.SchemaObject => {
  const zodNumberChecks = getZodNumberChecks(zodNumber);

  return {
    type: mapNumberType(zodNumberChecks),
    ...mapRanges(zodNumberChecks),
  };
};

const mapRanges = (
  zodNumberChecks: ZodNumberCheckMap,
): Pick<
  oas31.SchemaObject,
  'minimum' | 'maximum' | 'exclusiveMinimum' | 'exclusiveMaximum'
> => {
  const minimum = zodNumberChecks.min?.value;
  const maximum = zodNumberChecks.max?.value;
  return {
    ...(minimum !== undefined && { minimum }),
    ...(maximum !== undefined && { maximum }),
    ...(zodNumberChecks.min?.inclusive && { exclusiveMinimum: minimum }),
    ...(zodNumberChecks.max?.inclusive && { exclusiveMaximum: maximum }),
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
