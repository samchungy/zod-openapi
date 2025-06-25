import { createRegistry } from '../create/components';

export const createOutputContext = () => {
  const registry = createRegistry();

  return {
    registry,
    io: 'output' as const,
    opts: {},
  };
};
