// Inspired by https://github.com/asteasolutions/zod-to-openapi/blob/master/src/lib/zod-is-type.ts

import type {
  EnumLike,
  UnknownKeysParam,
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
  ZodRawShape,
  ZodReadonly,
  ZodRecord,
  ZodSet,
  ZodString,
  ZodSymbol,
  ZodTuple,
  ZodType,
  ZodTypeAny,
  ZodTypeDef,
  ZodUndefined,
  ZodUnion,
  ZodUnionOptions,
  ZodUnknown,
  ZodVoid,
} from 'zod';

type ZodTypeMap = {
  ZodAny: ZodAny;
  ZodArray: ZodArray<ZodTypeAny>;
  ZodBigInt: ZodBigInt;
  ZodBoolean: ZodBoolean;
  ZodBranded: ZodBranded<ZodTypeAny, string | number | symbol>;
  ZodCatch: ZodCatch<ZodTypeAny>;
  ZodDate: ZodDate;
  ZodDefault: ZodDefault<ZodTypeAny>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ZodDiscriminatedUnion: ZodDiscriminatedUnion<string, any>;
  ZodEffects: ZodEffects<ZodTypeAny>;
  ZodEnum: ZodEnum<[string, ...string[]]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ZodFunction: ZodFunction<ZodTuple<any, any>, ZodTypeAny>;
  ZodIntersection: ZodIntersection<ZodTypeAny, ZodTypeAny>;
  ZodLazy: ZodLazy<ZodTypeAny>;
  ZodLiteral: ZodLiteral<ZodTypeAny>;
  ZodMap: ZodMap;
  ZodNaN: ZodNaN;
  ZodNativeEnum: ZodNativeEnum<EnumLike>;
  ZodNever: ZodNever;
  ZodNull: ZodNull;
  ZodNullable: ZodNullable<ZodTypeAny>;
  ZodNumber: ZodNumber;
  ZodObject: ZodObject<ZodRawShape, UnknownKeysParam, ZodTypeAny>;
  ZodOptional: ZodOptional<ZodTypeAny>;
  ZodPipeline: ZodPipeline<ZodTypeAny, ZodTypeAny>;
  ZodPromise: ZodPromise<ZodTypeAny>;
  ZodReadonly: ZodReadonly<ZodTypeAny>;
  ZodRecord: ZodRecord;
  ZodSet: ZodSet;
  ZodString: ZodString;
  ZodSymbol: ZodSymbol;
  ZodTuple: ZodTuple;
  ZodUndefined: ZodUndefined;
  ZodUnion: ZodUnion<ZodUnionOptions>;
  ZodUnknown: ZodUnknown;
  ZodVoid: ZodVoid;
};

export const isZodType = <K extends keyof ZodTypeMap>(
  zodType: unknown,
  typeName: K,
): zodType is ZodTypeMap[K] =>
  (
    (zodType as ZodType)?._def as ZodTypeDef & {
      typeName: ZodFirstPartyTypeKind; // FIXME: https://github.com/colinhacks/zod/pull/2459
    }
  )?.typeName === typeName;

export const isAnyZodType = (zodType: unknown): zodType is ZodType =>
  Boolean(
    (
      (zodType as ZodType)?._def as ZodTypeDef & {
        typeName: ZodFirstPartyTypeKind;
      }
    )?.typeName,
  );
