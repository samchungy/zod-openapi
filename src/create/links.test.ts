import type { oas31 } from '..';

import { createRegistry } from './components';
import { createLinks } from './links';

describe('createLinks', () => {
  it('should create a links object with a link', () => {
    const registry = createRegistry();
    const links = createLinks(
      {
        link1: {
          operationId: 'getUser',
          parameters: {
            userId: '$response.body#/id',
          },
        },
      },
      registry,
      ['test'],
    );

    expect(links).toEqual<oas31.LinksObject>({
      link1: {
        operationId: 'getUser',
        parameters: {
          userId: '$response.body#/id',
        },
      },
    });
  });
});
