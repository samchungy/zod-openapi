import { oas31 } from 'openapi3-ts';
import { ZodCatch, ZodType } from 'zod';

import { ComponentsObject } from '../components';

import { createSchemaOrRef } from '.';

export const createCatchSchema = (
  zodCatch: ZodCatch<any>,
  components: ComponentsObject,
): oas31.SchemaObject | oas31.ReferenceObject =>
  createSchemaOrRef(zodCatch._def.innerType as ZodType, components);
