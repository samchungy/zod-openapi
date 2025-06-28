// Check if we have schemas that already registered in the components
// and if they are the same as the current schema
// if not we need to rename them to ensure accuracy

import type { core } from 'zod/v4';

import type { ComponentRegistry } from '../components';
import type { CreateDocumentOptions } from '../document';

interface ComponentDependencies {
  pure?: boolean;
  dependencies: Set<string>;
}

export const renameComponents = (
  components: Record<string, core.JSONSchema.JSONSchema>,
  outputIds: Map<string, string>,
  ctx: {
    registry: ComponentRegistry;
    io: string;
    opts: CreateDocumentOptions;
  },
) => {
  const componentsToRename = new Map<string, string>();

  if (ctx.io === 'input') {
    return componentsToRename;
  }

  // Create a dependency map
  const componentDependencies = new Map<string, ComponentDependencies>();
  const stringifiedComponents = new Map<string, string>();

  for (const [key, value] of Object.entries(components)) {
    const stringified = JSON.stringify(value);
    const matches = stringified.matchAll(/"#\/components\/schemas\/([^"]+)"/g);
    const dependencies = new Set<string>();
    for (const match of matches) {
      const dep = match[1] as string;
      if (dep !== key) {
        dependencies.add(dep);
      }
    }
    stringifiedComponents.set(key, stringified);
    componentDependencies.set(key, {
      dependencies,
    });
  }

  for (const [key] of stringifiedComponents) {
    const registeredComponent = ctx.registry.components.schemas.ids.get(key);
    if (!registeredComponent) {
      continue;
    }

    if (
      isDependencyPure(
        componentDependencies,
        stringifiedComponents,
        ctx.registry,
        key,
      )
    ) {
      continue;
    }
    const newName = outputIds.get(key) ?? `${key}Output`;
    componentsToRename.set(key, newName);
    components[newName] = components[key] as core.JSONSchema.JSONSchema;
    delete components[key];
    continue;
  }

  return componentsToRename;
};

const isDependencyPure = (
  componentDependencies: Map<string, ComponentDependencies>,
  stringifiedComponents: Map<string, string>,
  registry: ComponentRegistry,
  key: string,
  visited: Set<string> = new Set(),
): boolean => {
  if (visited.has(key)) {
    return true; // Assume pure for circular references to break the cycle
  }

  const dependencies = componentDependencies.get(key) as ComponentDependencies;
  if (dependencies.pure !== undefined) {
    return dependencies.pure;
  }

  const stringified = stringifiedComponents.get(key);
  const component = registry.components.schemas.ids.get(key);

  if (component && stringified !== JSON.stringify(component)) {
    dependencies.pure = false;
    return false;
  }

  visited.add(key);

  const result = [...dependencies.dependencies].every((dep) =>
    isDependencyPure(
      componentDependencies,
      stringifiedComponents,
      registry,
      dep,
      new Set(visited),
    ),
  );

  dependencies.pure = result;

  return result;
};
