import '../../../entries/extend';
import assert from 'assert';

import { type ZodLazy, type ZodType, z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('lazy', () => {
  it('throws an error when a lazy schema has no ref', () => {
    type Lazy = Lazy[];
    const lazy: z.ZodType<Lazy> = z.lazy(() => lazy.array());

    expect(() =>
      createSchema(lazy as ZodLazy<any>, createOutputState(), ['response']),
    ).toThrowErrorMatchingInlineSnapshot(
      `"The schema at response > lazy schema > array items needs to be registered because it's circularly referenced"`,
    );
  });

  it('throws errors when cycles without refs are detected', () => {
    const cycle1: any = z.lazy(() => z.array(z.object({ foo: cycle1 })));
    expect(() =>
      createSchema(cycle1, createOutputState(), ['response']),
    ).toThrowErrorMatchingInlineSnapshot(
      `"The schema at response > lazy schema > array items > property: foo needs to be registered because it's circularly referenced"`,
    );

    const cycle2: any = z.lazy(() => z.union([z.number(), z.array(cycle2)]));
    expect(() =>
      createSchema(cycle2, createOutputState(), ['response']),
    ).toThrowErrorMatchingInlineSnapshot(
      `"The schema at response > lazy schema > union option 1 > array items needs to be registered because it's circularly referenced"`,
    );

    const cycle3: any = z.lazy(() => z.record(z.tuple([cycle3.optional()])));
    expect(() =>
      createSchema(cycle3, createOutputState(), ['response']),
    ).toThrowErrorMatchingInlineSnapshot(
      `"The schema at response > lazy schema > record value > tuple item 0 > optional needs to be registered because it's circularly referenced"`,
    );
  });

  it('creates a lazy schema when the schema contains a ref', () => {
    type Lazy = Lazy[];
    const lazy: z.ZodType<Lazy> = z
      .lazy(() => lazy.array())
      .openapi({ ref: 'lazy' });

    const state = createOutputState();

    const expectedComponent: oas31.SchemaObject = {
      type: 'array',
      items: { $ref: '#/components/schemas/lazy' },
    };

    const result = createSchema(lazy as ZodLazy<any>, state, ['lazy']);

    expect(result).toEqual(expectedComponent.items);

    const component = state.components.schemas.get(lazy);

    assert(component?.type === 'complete');

    expect(component.schemaObject).toEqual(expectedComponent);
  });

  it('supports registering the base schema', () => {
    const BasePost = z.object({
      id: z.string(),
      userId: z.string(),
    });

    type Post = z.infer<typeof BasePost> & {
      user?: User;
    };

    const BaseUser = z.object({
      id: z.string(),
    });

    type User = z.infer<typeof BaseUser> & {
      posts?: Post[];
    };

    const PostSchema: ZodType<Post> = BasePost.extend({
      user: z.lazy(() => UserSchema).optional(),
    }).openapi({ ref: 'post' });

    const UserSchema: ZodType<User> = BaseUser.extend({
      posts: z.array(z.lazy(() => PostSchema)).optional(),
    }).openapi({ ref: 'user' });

    const state = createOutputState();

    const expectedUserComponent: oas31.SchemaObject = {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        posts: {
          type: 'array',
          items: { $ref: '#/components/schemas/post' },
        },
      },
      required: ['id'],
    };
    const expectedPostComponent: oas31.SchemaObject = {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        userId: {
          type: 'string',
        },
        user: {
          $ref: '#/components/schemas/user',
        },
      },
      required: ['id', 'userId'],
    };

    const expectedUser: oas31.ReferenceObject = {
      $ref: '#/components/schemas/user',
    };

    const result = createSchema(UserSchema, state, ['object']);

    expect(result).toEqual(expectedUser);

    const component = state.components.schemas.get(UserSchema);
    assert(component?.type === 'complete');
    expect(component.schemaObject).toEqual(expectedUserComponent);

    const postComponent = state.components.schemas.get(PostSchema);
    assert(postComponent?.type === 'complete');
    expect(postComponent.schemaObject).toEqual(expectedPostComponent);
  });

  it('supports sibling properties that are circular references', () => {
    const BasePost = z.object({
      id: z.string(),
      userId: z.string(),
    });

    type Post = z.infer<typeof BasePost> & {
      user?: User;
      author?: User;
    };

    const BaseUser = z.object({
      id: z.string(),
    });

    type User = z.infer<typeof BaseUser> & {
      posts?: Post[];
    };

    const PostSchema: ZodType<Post> = BasePost.extend({
      user: z.lazy(() => UserSchema).optional(),
      author: z.lazy(() => UserSchema).optional(),
    }).openapi({ ref: 'post' });

    const UserSchema: ZodType<User> = BaseUser.extend({
      posts: z.array(z.lazy(() => PostSchema)).optional(),
    }).openapi({ ref: 'user' });

    const state = createOutputState();

    const expectedPostComponent: oas31.SchemaObject = {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        userId: {
          type: 'string',
        },
        user: {
          $ref: '#/components/schemas/user',
        },
        author: {
          $ref: '#/components/schemas/user',
        },
      },
      required: ['id', 'userId'],
    };
    const expected: oas31.ReferenceObject = {
      $ref: '#/components/schemas/post',
    };
    const expectedUserComponent: oas31.SchemaObject = {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        posts: {
          type: 'array',
          items: { $ref: '#/components/schemas/post' },
        },
      },
      required: ['id'],
    };

    const result = createSchema(PostSchema, state, ['object']);

    expect(result).toEqual(expected);

    const component = state.components.schemas.get(PostSchema);
    assert(component?.type === 'complete');
    expect(component.schemaObject).toEqual(expectedPostComponent);

    const userComponent = state.components.schemas.get(UserSchema);
    assert(userComponent?.type === 'complete');
    expect(userComponent.schemaObject).toEqual(expectedUserComponent);
  });
});
