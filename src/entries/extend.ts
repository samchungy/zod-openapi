import { z } from 'zod';

import { extendZodWithOpenApi } from '../extendZod';

extendZodWithOpenApi(z);

// eslint-disable-next-line @typescript-eslint/consistent-type-exports
export * from '../extendZodTypes'; // compatibility with < TS 5.0 as the export type * syntax is not supported
