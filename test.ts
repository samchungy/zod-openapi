import { z } from 'zod';

import { extendZodWithOpenApi } from './src';

extendZodWithOpenApi(z);

const a = z.string();

const b = z.string();

const map = new Map();

map.set(a, 1);

console.log(map.get(a));
console.log(map.get(b));
