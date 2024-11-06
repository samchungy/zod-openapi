import type { ZodRawShape, ZodTypeDef, z } from 'zod';

import './extendZodTypes';

type ZodOpenApiMetadataDef = NonNullable<ZodTypeDef['zodOpenApi']>;
type ZodOpenApiMetadata = ZodOpenApiMetadataDef['openapi'];

const mergeOpenApi = (
  openapi: ZodOpenApiMetadata,
  {
    ref: _ref,
    refType: _refType,
    param: _param,
    header: _header,
    ...rest
  }: ZodOpenApiMetadata = {},
) => ({
  ...rest,
  ...openapi,
});

export function extendZodWithOpenApi(zod: typeof z) {
  if (typeof zod.ZodType.prototype.openapi !== 'undefined') {
    return;
  }

  zod.ZodType.prototype.openapi = function (openapi) {
    const { zodOpenApi, ...rest } = this._def as {
      zodOpenApi?: ZodOpenApiMetadataDef;
      [key: string]: unknown;
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    const result = new (this as any).constructor({
      ...rest,
      zodOpenApi: {
        openapi: mergeOpenApi(
          openapi as unknown as ZodOpenApiMetadata,
          zodOpenApi?.openapi,
        ),
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    result._def.zodOpenApi.current = result;

    if (zodOpenApi) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      result._def.zodOpenApi.previous = this;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
  };

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const zodDescribe = zod.ZodObject.prototype.describe;

  zod.ZodType.prototype.describe = function (...args: [description: string]) {
    const result = zodDescribe.apply(this, args);
    return result.openapi({ description: args[0] });
  };

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const zodObjectExtend = zod.ZodObject.prototype.extend;

  zod.ZodObject.prototype.extend = function (
    ...args: [augmentation: ZodRawShape]
  ) {
    const extendResult = zodObjectExtend.apply(this, args);

    const zodOpenApi = extendResult._def.zodOpenApi;
    if (zodOpenApi) {
      const cloned = { ...zodOpenApi };
      cloned.openapi = mergeOpenApi({}, cloned.openapi);
      cloned.previous = this;
      extendResult._def.zodOpenApi = cloned;
    } else {
      extendResult._def.zodOpenApi = {
        previous: this,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    return extendResult as any;
  };

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const zodObjectOmit = zod.ZodObject.prototype.omit;

  zod.ZodObject.prototype.omit = function (
    ...args: [mask: Record<string, true | undefined>]
  ) {
    const omitResult = zodObjectOmit.apply(this, args);

    const zodOpenApi = omitResult._def.zodOpenApi;
    if (zodOpenApi) {
      const cloned = { ...zodOpenApi };
      cloned.openapi = mergeOpenApi({}, cloned.openapi);
      delete cloned.previous;
      omitResult._def.zodOpenApi = cloned;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    return omitResult as any;
  };

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const zodObjectPick = zod.ZodObject.prototype.pick;

  zod.ZodObject.prototype.pick = function (
    ...args: [mask: Record<string, true | undefined>]
  ) {
    const pickResult = zodObjectPick.apply(this, args);

    const zodOpenApi = pickResult._def.zodOpenApi;
    if (zodOpenApi) {
      const cloned = { ...zodOpenApi };
      cloned.openapi = mergeOpenApi({}, cloned.openapi);
      delete cloned.previous;
      pickResult._def.zodOpenApi = cloned;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    return pickResult as any;
  };
}
