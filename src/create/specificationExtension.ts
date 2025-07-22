import type { oas31 } from '@zod-openapi/openapi3-ts';

export const isISpecificationExtension = (
  key: string,
): key is oas31.IExtensionName => key.startsWith('x-');
