import '../../../entries/extend';
import { z } from 'zod/v4';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';
import type { CreateDocumentOptions } from '../../document';

describe('date', () => {
  it('creates a string schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };

    const schema = z.date();

    const result = createSchema(schema, createOutputState(), ['date']);

    expect(result).toEqual(expected);
  });

  it('sets a custom format', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      format: 'date-time',
    };

    const schema = z.date();
    const documentOptions: CreateDocumentOptions = {
      defaultDateSchema: {
        type: 'string',
        format: 'date-time',
      },
    };

    const result = createSchema(
      schema,
      createOutputState(undefined, documentOptions),
      ['date'],
    );

    expect(result).toEqual(expected);
  });

  it('sets a custom type', () => {
    const expected: oas31.SchemaObject = {
      type: 'number',
    };

    const schema = z.date();
    const documentOptions: CreateDocumentOptions = {
      defaultDateSchema: {
        type: 'number',
      },
    };

    const result = createSchema(
      schema,
      createOutputState(undefined, documentOptions),
      ['date'],
    );

    expect(result).toEqual(expected);
  });
});
