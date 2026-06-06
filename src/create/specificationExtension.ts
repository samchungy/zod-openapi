import type { oas32 } from '@zod-openapi/openapi3-ts';

export const isISpecificationExtension = (
  key: string,
): key is oas32.IExtensionName => key.startsWith('x-');
