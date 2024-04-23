import { z } from 'zod';

import { extendZodWithOpenApi } from './extendZod';

extendZodWithOpenApi(z);

export * from './extendZodTypes'; // compatibility with < TS 5.0 as the export type * syntax is not supported
