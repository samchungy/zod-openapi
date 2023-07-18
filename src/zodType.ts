// Inspired by https://github.com/asteasolutions/zod-to-openapi/blob/master/src/lib/zod-is-type.ts

import type {
  ZodAny,
  ZodArray,
  ZodBigInt,
  ZodBoolean,
  ZodBranded,
  ZodCatch,
  ZodDate,
  ZodDefault,
  ZodDiscriminatedUnion,
  ZodEffects,
  ZodEnum,
  ZodFirstPartyTypeKind,
  ZodFunction,
  ZodIntersection,
  ZodLazy,
  ZodLiteral,
  ZodMap,
  ZodNaN,
  ZodNativeEnum,
  ZodNever,
  ZodNull,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodPipeline,
  ZodPromise,
  ZodRecord,
  ZodSet,
  ZodString,
  ZodSymbol,
  ZodTuple,
  ZodType,
  ZodTypeDef,
  ZodUndefined,
  ZodUnion,
  ZodUnknown,
  ZodVoid,
} from 'zod';

type ZodTypeMap = {
  ZodAny: ZodAny;
  ZodArray: ZodArray<any>;
  ZodBigInt: ZodBigInt;
  ZodBoolean: ZodBoolean;
  ZodBranded: ZodBranded<any, any>;
  ZodCatch: ZodCatch<any>;
  ZodDate: ZodDate;
  ZodDefault: ZodDefault<any>;
  ZodDiscriminatedUnion: ZodDiscriminatedUnion<any, any>;
  ZodEffects: ZodEffects<any>;
  ZodEnum: ZodEnum<any>;
  ZodFunction: ZodFunction<any, any>;
  ZodIntersection: ZodIntersection<any, any>;
  ZodLazy: ZodLazy<any>;
  ZodLiteral: ZodLiteral<any>;
  ZodMap: ZodMap;
  ZodNaN: ZodNaN;
  ZodNativeEnum: ZodNativeEnum<any>;
  ZodNever: ZodNever;
  ZodNull: ZodNull;
  ZodNullable: ZodNullable<any>;
  ZodNumber: ZodNumber;
  ZodObject: ZodObject<any>;
  ZodOptional: ZodOptional<any>;
  ZodPipeline: ZodPipeline<any, any>;
  ZodPromise: ZodPromise<any>;
  ZodRecord: ZodRecord;
  ZodSet: ZodSet;
  ZodString: ZodString;
  ZodSymbol: ZodSymbol;
  ZodTuple: ZodTuple;
  ZodUndefined: ZodUndefined;
  ZodUnion: ZodUnion<any>;
  ZodUnknown: ZodUnknown;
  ZodVoid: ZodVoid;
};

export const isZodType = <U extends keyof ZodTypeMap>(
  zodType: unknown,
  typeName: U,
): zodType is ZodTypeMap[U] =>
  (
    (zodType as ZodType)?._def as ZodTypeDef & {
      typeName: ZodFirstPartyTypeKind; // FIXME: https://github.com/colinhacks/zod/pull/2459
    }
  ).typeName === typeName;

export const isAnyZodType = (zodType: unknown): zodType is ZodType =>
  Boolean(
    (zodType as ZodType)?._def as ZodTypeDef & {
      typeName: ZodFirstPartyTypeKind;
    },
  );
