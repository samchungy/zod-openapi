import { z } from 'zod';

import { extendZodWithOpenApi } from './extendZod';

extendZodWithOpenApi(z);

export type * from './extendZod';
