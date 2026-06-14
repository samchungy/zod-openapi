import type { ComponentRegistry } from './components.js';
import type { ZodOpenApiExamplesObject } from './document.js';

import type { oas32 } from '@zod-openapi/openapi3-ts';

export const createExamples = (
  examples: ZodOpenApiExamplesObject | undefined,
  registry: ComponentRegistry,
  path: string[],
): oas32.ExamplesObject | undefined => {
  if (!examples) {
    return undefined;
  }

  const examplesObject: Record<
    string,
    oas32.ExampleObject | oas32.ReferenceObject
  > = {};

  for (const [name, example] of Object.entries(examples)) {
    const exampleObject = registry.addExample(example, [...path, name]);
    examplesObject[name] = exampleObject;
  }

  return examplesObject;
};
