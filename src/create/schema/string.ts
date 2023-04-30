import { ZodString, ZodStringCheck } from 'zod';

import { oas31 } from '../../openapi3-ts/dist';

export const createStringSchema = (
  zodString: ZodString,
): oas31.SchemaObject => {
  const zodStringChecks = getZodStringChecks(zodString);
  const format = mapStringFormat(zodStringChecks);
  const pattern = mapRegex(zodStringChecks);
  const minLength = zodStringChecks.length?.value ?? zodStringChecks.min?.value;
  const maxLength = zodStringChecks.length?.value ?? zodStringChecks.max?.value;

  return {
    type: 'string',
    ...(format && { format }),
    ...(pattern && { pattern }),
    ...(minLength !== undefined && { minLength }),
    ...(maxLength !== undefined && { maxLength }),
  };
};

type ZodStringCheckMap = {
  [kind in ZodStringCheck['kind']]?: Extract<ZodStringCheck, { kind: kind }>;
};

const getZodStringChecks = (zodString: ZodString): ZodStringCheckMap =>
  zodString._def.checks.reduce<ZodStringCheckMap>((acc, check) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    acc[check.kind] = check as any;
    return acc;
  }, {});

const mapRegex = (
  zodStringChecks: ZodStringCheckMap,
): oas31.SchemaObject['pattern'] => {
  const regexCheck = zodStringChecks.regex;
  if (!regexCheck) {
    return undefined;
  }

  return regexCheck?.regex.source;
};

const mapStringFormat = (
  zodStringChecks: ZodStringCheckMap,
): oas31.SchemaObject['format'] => {
  if (zodStringChecks.uuid) {
    return 'uuid';
  }

  if (zodStringChecks.datetime) {
    return 'date-time';
  }

  if (zodStringChecks.email) {
    return 'email';
  }

  if (zodStringChecks.url) {
    return 'uri';
  }

  return undefined;
};
