// Inspired by https://github.com/asteasolutions/zod-to-openapi/blob/master/src/lib/zod-is-type.ts

import type {
  ArrayCardinality,
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
  ZodDiscriminatedUnionOption,
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
  ZodUnknown,
  ZodVoid,
  objectInputType,
  objectOutputType,
} from 'zod';

type ZodTypeMap<
  T extends ZodTypeAny,
  U extends ZodTypeAny,
  V,
  W extends ZodRawShape,
  B extends string | number | symbol,
  Discriminator extends string,
  Options extends Array<ZodDiscriminatedUnionOption<Discriminator>>,
  Enum extends [string, ...string[]],
  Returns extends ZodTypeAny,
  Args extends ZodTuple,
  ELike extends EnumLike,
  Union extends readonly [ZodTypeAny, ...ZodTypeAny[]],
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<W, Catchall, UnknownKeys>,
  Input = objectInputType<W, Catchall, UnknownKeys>,
  Cardinality extends ArrayCardinality = 'many',
> = {
  ZodAny: ZodAny;
  ZodArray: ZodArray<T, Cardinality>;
  ZodBigInt: ZodBigInt;
  ZodBoolean: ZodBoolean;
  ZodBranded: ZodBranded<T, B>;
  ZodCatch: ZodCatch<T>;
  ZodDate: ZodDate;
  ZodDefault: ZodDefault<T>;
  ZodDiscriminatedUnion: ZodDiscriminatedUnion<Discriminator, Options>;
  ZodEffects: ZodEffects<T>;
  ZodEnum: ZodEnum<Enum>;
  ZodFunction: ZodFunction<Args, Returns>;
  ZodIntersection: ZodIntersection<T, U>;
  ZodLazy: ZodLazy<T>;
  ZodLiteral: ZodLiteral<V>;
  ZodMap: ZodMap;
  ZodNaN: ZodNaN;
  ZodNativeEnum: ZodNativeEnum<ELike>;
  ZodNever: ZodNever;
  ZodNull: ZodNull;
  ZodNullable: ZodNullable<T>;
  ZodNumber: ZodNumber;
  ZodObject: ZodObject<W, UnknownKeys, Catchall, Output, Input>;
  ZodOptional: ZodOptional<T>;
  ZodPipeline: ZodPipeline<T, U>;
  ZodPromise: ZodPromise<T>;
  ZodReadonly: ZodReadonly<T>;
  ZodRecord: ZodRecord;
  ZodSet: ZodSet;
  ZodString: ZodString;
  ZodSymbol: ZodSymbol;
  ZodTuple: ZodTuple;
  ZodUndefined: ZodUndefined;
  ZodUnion: ZodUnion<Union>;
  ZodUnknown: ZodUnknown;
  ZodVoid: ZodVoid;
};

export const isZodType = <
  T extends ZodTypeAny,
  U extends ZodTypeAny,
  V,
  W extends ZodRawShape,
  B extends string | number | symbol,
  Discriminator extends string,
  Options extends Array<ZodDiscriminatedUnionOption<Discriminator>>,
  Enum extends [string, ...string[]],
  Returns extends ZodTypeAny,
  Args extends ZodTuple,
  ELike extends EnumLike,
  Union extends readonly [ZodTypeAny, ...ZodTypeAny[]],
  K extends keyof ZodTypeMap<
    T,
    U,
    V,
    W,
    B,
    Discriminator,
    Options,
    Enum,
    Returns,
    Args,
    ELike,
    Union,
    UnknownKeys,
    Catchall,
    Output,
    Input,
    Cardinality
  >,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<W, Catchall, UnknownKeys>,
  Input = objectInputType<W, Catchall, UnknownKeys>,
  Cardinality extends ArrayCardinality = 'many',
>(
  zodType: unknown,
  typeName: K,
): zodType is ZodTypeMap<
  T,
  U,
  V,
  W,
  B,
  Discriminator,
  Options,
  Enum,
  Returns,
  Args,
  ELike,
  Union,
  UnknownKeys,
  Catchall,
  Output,
  Input,
  Cardinality
>[K] =>
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
