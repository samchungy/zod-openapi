import { describe, expect, it } from 'vitest';
import type * as core from 'zod/v4/core';

import { createRegistry } from '../components.js';

import { renameComponents } from './rename.js';

describe('rename', () => {
  it('should not rename components if they are the same as in the registry', () => {
    const components: Record<string, core.JSONSchema.JSONSchema> = {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
        required: ['id', 'name'],
        additionalProperties: false,
      },
    };

    const outputIds = new Map();

    const registry = createRegistry();

    registry.components.schemas.ids.set('User', {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
      required: ['id', 'name'],
      additionalProperties: false,
    });

    const result = renameComponents(
      components,
      outputIds,
      {
        registry,
        io: 'output',
        opts: {},
      },
      '#/components/schemas/',
    );

    expect([...result.entries()]).toEqual([]);

    expect(components).toEqual<Record<string, core.JSONSchema.JSONSchema>>({
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
        required: ['id', 'name'],
        additionalProperties: false,
      },
    });
  });

  it('should not rename components if they do not exist in the registry', () => {
    const components: Record<string, core.JSONSchema.JSONSchema> = {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
        required: ['id', 'name'],
        additionalProperties: false,
      },
    };

    const outputIds = new Map();

    const registry = createRegistry();

    const result = renameComponents(
      components,
      outputIds,
      {
        registry,
        io: 'output',
        opts: {},
      },
      '#/components/schemas/',
    );

    expect([...result.entries()]).toEqual([]);

    expect(components).toEqual<Record<string, core.JSONSchema.JSONSchema>>({
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
        required: ['id', 'name'],
        additionalProperties: false,
      },
    });
  });

  it('should rename components if they differ from what is in the registry', () => {
    const components: Record<string, core.JSONSchema.JSONSchema> = {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
        required: ['id', 'name'],
        additionalProperties: false,
      },
    };

    const outputIds = new Map();

    const registry = createRegistry();

    registry.components.schemas.ids.set('User', {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
    });

    const result = renameComponents(
      components,
      outputIds,
      {
        registry,
        io: 'output',
        opts: {},
      },
      '#/components/schemas/',
    );

    expect([...result.entries()]).toEqual([['User', 'UserOutput']]);

    expect(components).toEqual<Record<string, core.JSONSchema.JSONSchema>>({
      UserOutput: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
        required: ['id', 'name'],
        additionalProperties: false,
      },
    });
  });

  it('should not rename components when they have dependencies which are the same', () => {
    const components: Record<string, core.JSONSchema.JSONSchema> = {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { $ref: '#/components/schemas/Name' },
        },
        required: ['id', 'name'],
        additionalProperties: false,
      },
      Name: {
        type: 'string',
      },
    };

    const outputIds = new Map();

    const registry = createRegistry();

    registry.components.schemas.ids.set('User', {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { $ref: '#/components/schemas/Name' },
      },
      required: ['id', 'name'],
      additionalProperties: false,
    });

    registry.components.schemas.ids.set('Name', {
      type: 'string',
    });

    const result = renameComponents(
      components,
      outputIds,
      {
        registry,
        io: 'output',
        opts: {},
      },
      '#/components/schemas/',
    );

    expect([...result.entries()]).toEqual([]);

    expect(components).toEqual<Record<string, core.JSONSchema.JSONSchema>>({
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { $ref: '#/components/schemas/Name' },
        },
        required: ['id', 'name'],
        additionalProperties: false,
      },
      Name: {
        type: 'string',
      },
    });
  });

  it('should rename components when they have dependencies which are different', () => {
    const components: Record<string, core.JSONSchema.JSONSchema> = {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { $ref: '#/components/schemas/Name' },
        },
        required: ['id', 'name'],
        additionalProperties: false,
      },
      Name: {
        type: 'string',
        pattern: '^[A-Z][a-z]+$',
      },
    };

    const outputIds = new Map();

    const registry = createRegistry();

    registry.components.schemas.ids.set('User', {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { $ref: '#/components/schemas/Name' },
      },
      required: ['id', 'name'],
      additionalProperties: false,
    });

    registry.components.schemas.ids.set('Name', {
      type: 'string',
    });

    const result = renameComponents(
      components,
      outputIds,
      {
        registry,
        io: 'output',
        opts: {},
      },
      '#/components/schemas/',
    );

    expect([...result.entries()]).toEqual([
      ['User', 'UserOutput'],
      ['Name', 'NameOutput'],
    ]);

    expect(components).toEqual<Record<string, core.JSONSchema.JSONSchema>>({
      UserOutput: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { $ref: '#/components/schemas/Name' },
        },
        required: ['id', 'name'],
        additionalProperties: false,
      },
      NameOutput: {
        type: 'string',
        pattern: '^[A-Z][a-z]+$',
      },
    });
  });

  it('should handle components which have circular dependencies', () => {
    const components: Record<string, core.JSONSchema.JSONSchema> = {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { $ref: '#/components/schemas/Name' },
          users: {
            type: 'array',
            items: { $ref: '#/components/schemas/User' },
          },
        },
        required: ['id', 'name'],
        additionalProperties: false,
      },
      Name: {
        type: 'string',
        pattern: '^[A-Z][a-z]+$',
      },
    };

    const outputIds = new Map();

    const registry = createRegistry();

    registry.components.schemas.ids.set('User', {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { $ref: '#/components/schemas/Name' },
        users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
      },
      required: ['id', 'name'],
      additionalProperties: false,
    });

    registry.components.schemas.ids.set('Name', {
      type: 'string',
    });

    const result = renameComponents(
      components,
      outputIds,
      {
        registry,
        io: 'output',
        opts: {},
      },
      '#/components/schemas/',
    );

    expect([...result.entries()]).toEqual([
      ['User', 'UserOutput'],
      ['Name', 'NameOutput'],
    ]);

    expect(components).toEqual<Record<string, core.JSONSchema.JSONSchema>>({
      UserOutput: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { $ref: '#/components/schemas/Name' },
          users: {
            type: 'array',
            items: { $ref: '#/components/schemas/User' },
          },
        },
        required: ['id', 'name'],
        additionalProperties: false,
      },
      NameOutput: {
        type: 'string',
        pattern: '^[A-Z][a-z]+$',
      },
    });
  });
});
