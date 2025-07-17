import {
  type ComponentRegistry,
  createRegistry,
} from '../create/components.js';
import type { CreateDocumentOptions } from '../create/document.js';

export const createOutputContext = (): {
  registry: ComponentRegistry;
  io: 'output';
  opts: CreateDocumentOptions;
} => {
  const registry = createRegistry();

  return {
    registry,
    io: 'output' as const,
    opts: {},
  };
};

export const createInputContext = (): {
  registry: ComponentRegistry;
  io: 'input';
  opts: CreateDocumentOptions;
} => {
  const registry = createRegistry();

  return {
    registry,
    io: 'input' as const,
    opts: {},
  };
};
