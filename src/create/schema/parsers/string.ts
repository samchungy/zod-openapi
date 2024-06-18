import type { ZodString, ZodStringCheck } from 'zod';

import { satisfiesVersion } from '../../../openapi';
import type { oas31 } from '../../../openapi3-ts/dist/index';
import type { Schema, SchemaState } from '../schema';

export const createStringSchema = (
  zodString: ZodString,
  state: SchemaState,
): Schema => {
  const zodStringChecks = getZodStringChecks(zodString);
  const format = mapStringFormat(zodStringChecks);
  const patterns = mapPatterns(zodStringChecks);
  const minLength =
    zodStringChecks.length?.[0]?.value ?? zodStringChecks.min?.[0]?.value;
  const maxLength =
    zodStringChecks.length?.[0]?.value ?? zodStringChecks.max?.[0]?.value;
  const contentEncoding = satisfiesVersion(state.components.openapi, '3.1.0')
    ? mapContentEncoding(zodStringChecks)
    : undefined;

  if (patterns.length <= 1) {
    return {
      type: 'schema',
      schema: {
        type: 'string',
        ...(format && { format }),
        ...(patterns[0] && { pattern: patterns[0] }),
        ...(minLength !== undefined && { minLength }),
        ...(maxLength !== undefined && { maxLength }),
        ...(contentEncoding && { contentEncoding }),
      },
    };
  }

  return {
    type: 'schema',
    schema: {
      allOf: [
        {
          type: 'string',
          ...(format && { format }),
          ...(patterns[0] && { pattern: patterns[0] }),
          ...(minLength !== undefined && { minLength }),
          ...(maxLength !== undefined && { maxLength }),
          ...(contentEncoding && { contentEncoding }),
        },
        ...patterns.slice(1).map(
          (pattern): oas31.SchemaObject => ({
            type: 'string',
            pattern,
          }),
        ),
      ],
    },
  };
};

type ZodStringCheckMap = {
  [kind in ZodStringCheck['kind']]?: [
    Extract<ZodStringCheck, { kind: kind }>,
    ...Array<Extract<ZodStringCheck, { kind: kind }>>,
  ];
};

const getZodStringChecks = (zodString: ZodString): ZodStringCheckMap =>
  zodString._def.checks.reduce<ZodStringCheckMap>(
    (acc, check: ZodStringCheck) => {
      const mapping = acc[check.kind];
      if (mapping) {
        mapping.push(check as never);
        return acc;
      }

      acc[check.kind] = [check as never];
      return acc;
    },
    {},
  );

const mapPatterns = (zodStringChecks: ZodStringCheckMap): string[] => {
  const startsWith = mapStartsWith(zodStringChecks);
  const endsWith = mapEndsWith(zodStringChecks);
  const regex = mapRegex(zodStringChecks);
  const includes = mapIncludes(zodStringChecks);

  const patterns: string[] = [
    ...(regex ?? []),
    ...(startsWith ? [startsWith] : []),
    ...(endsWith ? [endsWith] : []),
    ...(includes ?? []),
  ];

  return patterns;
};

const mapStartsWith = (
  zodStringChecks: ZodStringCheckMap,
): oas31.SchemaObject['pattern'] => {
  if (zodStringChecks.startsWith?.[0]?.value) {
    return `^${zodStringChecks.startsWith[0].value}`;
  }

  return undefined;
};

const mapEndsWith = (
  zodStringChecks: ZodStringCheckMap,
): oas31.SchemaObject['pattern'] => {
  if (zodStringChecks.endsWith?.[0]?.value) {
    return `${zodStringChecks.endsWith[0].value}$`;
  }

  return undefined;
};

const mapRegex = (zodStringChecks: ZodStringCheckMap): string[] | undefined =>
  zodStringChecks.regex?.map((regexCheck) => regexCheck.regex.source);

const mapIncludes = (
  zodStringChecks: ZodStringCheckMap,
): string[] | undefined =>
  zodStringChecks.includes?.map((includeCheck) => {
    if (includeCheck.position === 0) {
      return `^${includeCheck.value}`;
    }
    if (includeCheck.position) {
      return `^.{${includeCheck.position}}${includeCheck.value}`;
    }
    return includeCheck.value;
  });

const mapStringFormat = (
  zodStringChecks: ZodStringCheckMap,
): oas31.SchemaObject['format'] => {
  if (zodStringChecks.uuid) {
    return 'uuid';
  }

  if (zodStringChecks.datetime) {
    return 'date-time';
  }

  if (zodStringChecks.date) {
    return 'date';
  }

  if (zodStringChecks.time) {
    return 'time';
  }

  if (zodStringChecks.duration) {
    return 'duration';
  }

  if (zodStringChecks.email) {
    return 'email';
  }

  if (zodStringChecks.url) {
    return 'uri';
  }

  return undefined;
};

const mapContentEncoding = (
  zodStringChecks: ZodStringCheckMap,
): string | undefined => {
  if (zodStringChecks.base64) {
    return 'base64';
  }

  return undefined;
};
