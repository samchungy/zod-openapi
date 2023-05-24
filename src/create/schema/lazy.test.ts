import { type ZodLazy, type ZodObject, type ZodType, z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import type { oas31 } from '../../openapi3-ts/dist';
import { createOutputState } from '../../testing/state';

import { createLazySchema } from './lazy';
import { createObjectSchema } from './object';

import { createSchemaOrRef } from '.';
import { createSchema } from './index';

extendZodWithOpenApi(z);

describe('createLazySchema', () => {
  it('throws an error when a lazy schema has no ref', () => {
    type Lazy = Lazy[];
    const lazy: z.ZodType<Lazy> = z.lazy(() => lazy.array());

    expect(() =>
      createSchemaOrRef(lazy as ZodLazy<any>, createOutputState()),
    ).toThrow(
      `The schema {\"typeName\":\"ZodLazy\"} needs to be registered because it's circularly referenced`,
    );
  });

  it('creates an lazy schema when the schema contains a ref', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      items: { $ref: '#/components/schemas/lazy' },
    };

    type Lazy = Lazy[];
    const lazy: z.ZodType<Lazy> = z
      .lazy(() => lazy.array())
      .openapi({ ref: 'lazy' });

    const state = createOutputState();
    state.components.schemas.set(lazy, {
      type: 'inProgress',
      ref: 'lazy',
    });

    const result = createLazySchema(lazy as ZodLazy<any>, state);
    expect(result).toStrictEqual(expected);
  });

  it('supports registering the base schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        posts: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/post',
          },
        },
      },
      required: ['id'],
    };

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
    state.components.schemas.set(UserSchema, {
      type: 'inProgress',
      ref: 'user',
    });

    const result = createObjectSchema(
      UserSchema as ZodObject<any, any, any, any, any>,
      state,
    );

    expect(result).toStrictEqual(expected);
  });

  it('supports sibling properties that are circular references', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        posts: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/post',
          },
        },
        comments: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/post',
          },
        },
      },
      required: ['id'],
    };

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

    const PostArray = z.array(z.lazy(() => PostSchema));

    const UserSchema: ZodType<User> = z
      .lazy(() =>
        BaseUser.extend({
          posts: PostArray.optional(),
          comments: PostArray.optional(),
        }),
      )
      .openapi({ ref: 'user' });

    const state = createOutputState();
    state.components.schemas.set(UserSchema, {
      type: 'inProgress',
      ref: 'user',
    });

    const result = createSchema(UserSchema, state);

    expect(result).toStrictEqual(expected);
  });
});
