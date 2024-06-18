import type { oas31 } from '../openapi3-ts/dist/index';

export const isISpecificationExtension = (
  key: string,
): key is oas31.IExtensionName => key.startsWith('x-');
