import type { ZodRawShape, z } from 'zod';
import './extendZodTypes';

export function extendZodWithOpenApi(zod: typeof z) {
  if (typeof zod.ZodType.prototype.openapi !== 'undefined') {
    return;
  }
  zod.ZodType.prototype.openapi = function (openapi) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    const result = new (this as any).constructor({
      ...this._def,
      openapi,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
  };

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const zodObjectExtend = zod.ZodObject.prototype.extend;

  zod.ZodObject.prototype.extend = function (
    ...args: [augmentation: ZodRawShape]
  ) {
    const extendResult = zodObjectExtend.apply(this, args);
    extendResult._def.extendMetadata = {
      extends: this,
    };
    delete extendResult._def.openapi;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    return extendResult as any;
  };

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const zodObjectOmit = zod.ZodObject.prototype.omit;

  zod.ZodObject.prototype.omit = function (
    ...args: [mask: Record<string, true | undefined>]
  ) {
    const omitResult = zodObjectOmit.apply(this, args);
    delete omitResult._def.extendMetadata;
    delete omitResult._def.openapi;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    return omitResult as any;
  };

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const zodObjectPick = zod.ZodObject.prototype.pick;

  zod.ZodObject.prototype.pick = function (
    ...args: [mask: Record<string, true | undefined>]
  ) {
    const pickResult = zodObjectPick.apply(this, args);
    delete pickResult._def.extendMetadata;
    delete pickResult._def.openapi;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    return pickResult as any;
  };
}
