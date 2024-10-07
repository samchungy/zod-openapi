import '../../../entries/extend';
import { z } from 'zod';

import type { Schema } from '..';
import { createOutputState } from '../../../testing/state';
import type { CreateDocumentOptions } from '../../document';

import { createDateSchema } from './date';

describe('createDateSchema', () => {
  it('creates a string schema', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'string',
      },
    };
    const schema = z.date();

    const result = createDateSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });

  it('sets a custom format', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'string',
        format: 'date-time',
      },
    };
    const schema = z.date();
    const documentOptions: CreateDocumentOptions = {
      defaultDateSchema: {
        type: 'string',
        format: 'date-time',
      },
    };

    const result = createDateSchema(
      schema,
      createOutputState(undefined, documentOptions),
    );

    expect(result).toEqual(expected);
  });

  it('sets a custom type', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'number',
      },
    };
    const schema = z.date();
    const documentOptions: CreateDocumentOptions = {
      defaultDateSchema: {
        type: 'number',
      },
    };

    const result = createDateSchema(
      schema,
      createOutputState(undefined, documentOptions),
    );

    expect(result).toEqual(expected);
  });
});
