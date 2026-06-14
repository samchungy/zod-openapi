import type { ComponentRegistry } from './components.js';
import type { ZodOpenApiLinksObject } from './document.js';

import type { oas32 } from '@zod-openapi/openapi3-ts';

export const createLinks = (
  links: ZodOpenApiLinksObject | undefined,
  registry: ComponentRegistry,
  path: string[],
) => {
  if (!links) {
    return undefined;
  }

  const linksObject: Record<string, oas32.LinkObject | oas32.ReferenceObject> =
    {};

  for (const [name, link] of Object.entries(links)) {
    const linkObject = registry.addLink(link, [...path, name]);
    linksObject[name] = linkObject;
  }

  return linksObject;
};
