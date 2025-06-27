import { globalRegistry } from 'zod/v4';

import type { oas31 } from '..';
import { isAnyZodType } from '../zod';

import type { ComponentRegistry } from './components';
import type { ZodOpenApiComponentsObject } from './document';

export const registerSchemas = (
  schemas: ZodOpenApiComponentsObject['schemas'],
  registry: ComponentRegistry,
): void => {
  if (!schemas) {
    return;
  }

  for (const [key, schema] of Object.entries(schemas)) {
    if (registry.schemas.ids.has(key)) {
      throw new Error(`Schema "${key}" is already registered`);
    }

    if (isAnyZodType(schema)) {
      const inputSchemaObject: oas31.SchemaObject = {};
      const outputSchemaObject: oas31.SchemaObject = {};
      const identifier = `components > schemas > ${key}`;
      registry.schemas.input.set(identifier, {
        zodType: schema,
        schemaObject: inputSchemaObject,
      });
      registry.schemas.output.set(identifier, {
        zodType: schema,
        schemaObject: outputSchemaObject,
      });
      registry.schemas.manual.set(key, {
        identifier,
        io: {
          input: {
            schemaObject: inputSchemaObject,
            used: 0,
          },
          output: {
            schemaObject: outputSchemaObject,
            used: 0,
          },
        },
        zodType: schema,
      });

      const meta = globalRegistry.get(schema);
      if (meta?.id) {
        continue;
      }

      globalRegistry.add(schema, {
        ...meta,
        id: key,
      });
      continue;
    }
    registry.schemas.ids.set(key, schema as oas31.SchemaObject);
  }
};
