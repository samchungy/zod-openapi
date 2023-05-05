import type { ZodType } from 'zod';

export const throwTransformError = (zodType: ZodType) => {
  throw new Error(
    `${JSON.stringify(
      zodType,
    )} contains a transform but is used in both an input and an output. This is likely a mistake. Set an \`effectType\` to resolve`,
  );
};
