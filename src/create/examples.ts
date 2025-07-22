import type { ComponentRegistry } from './components.js';
import type { ZodOpenApiExamplesObject } from './document.js';

import type { oas31 } from '@zod-openapi/openapi3-ts';

export const createExamples = (
  examples: ZodOpenApiExamplesObject | undefined,
  registry: ComponentRegistry,
  path: string[],
): oas31.ExamplesObject | undefined => {
  if (!examples) {
    return undefined;
  }

  const examplesObject: Record<
    string,
    oas31.ExampleObject | oas31.ReferenceObject
  > = {};

  for (const [name, example] of Object.entries(examples)) {
    const exampleObject = registry.addExample(example, [...path, name]);
    examplesObject[name] = exampleObject;
  }

  return examplesObject;
};
