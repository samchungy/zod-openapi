import * as z from 'zod/v4';
import type { ZodLazy, ZodType } from 'zod/v4';

import { createRegistry } from '../../components';
import { type SchemaResult, createSchema } from '../schema';

describe('lazy', () => {
  it('supports the new lazy syntax', () => {
    const lazy = z.object({
      id: z.string(),
      get a() {
        return lazy;
      },
    });

    const registry = createRegistry();

    const result = createSchema(lazy, { registry });

    expect(result).toEqual<SchemaResult>({
      schema: {
        $ref: '#/components/schemas/__schema0',
      },
      components: {
        __schema0: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            a: {
              $ref: '#/components/schemas/__schema0',
            },
          },
          additionalProperties: false,
          required: ['id', 'a'],
        },
      },
    });
  });
  it('creates a dynamic component', () => {
    type Lazy = Lazy[];
    const lazy: z.ZodType<Lazy> = z.lazy(() => lazy.array());

    const result = createSchema(lazy as z.ZodLazy<any>);

    expect(result).toEqual<SchemaResult>({
      schema: {
        $ref: '#/components/schemas/__schema0',
      },
      components: {
        __schema0: {
          items: {
            $ref: '#/components/schemas/__schema0',
          },
          type: 'array',
        },
      },
    });
  });

  it('creates a lazy schema when the schema contains a ref', () => {
    type Lazy = Lazy[];
    const lazy: z.ZodType<Lazy> = z
      .lazy(() => lazy.array())
      .meta({ id: 'lazy' });

    const result = createSchema(lazy as ZodLazy<any>);

    expect(result).toEqual<SchemaResult>({
      schema: {
        $ref: '#/components/schemas/lazy',
      },
      components: {
        lazy: {
          items: {
            $ref: '#/components/schemas/lazy',
          },
          type: 'array',
        },
      },
    });
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
    }).meta({ id: 'post' });

    const UserSchema: ZodType<User> = BaseUser.extend({
      posts: z.array(z.lazy(() => PostSchema)).optional(),
    }).meta({ id: 'user' });

    const result = createSchema(UserSchema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        $ref: '#/components/schemas/user',
      },
      components: {
        user: {
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
          additionalProperties: false,
          required: ['id'],
        },
        post: {
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
          additionalProperties: false,
          required: ['id', 'userId'],
        },
      },
    });
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
    }).meta({ id: 'post2' });

    const UserSchema: ZodType<User> = BaseUser.extend({
      posts: z.array(z.lazy(() => PostSchema)).optional(),
    }).meta({ id: 'user2' });

    const result = createSchema(PostSchema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        $ref: '#/components/schemas/post2',
      },
      components: {
        post2: {
          type: 'object',
          properties: {
            author: {
              $ref: '#/components/schemas/user2',
            },
            id: {
              type: 'string',
            },
            userId: {
              type: 'string',
            },
            user: {
              $ref: '#/components/schemas/user2',
            },
          },
          additionalProperties: false,
          required: ['id', 'userId'],
        },
        user2: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            posts: {
              type: 'array',
              items: { $ref: '#/components/schemas/post2' },
            },
          },
          additionalProperties: false,
          required: ['id'],
        },
      },
    });
  });
});
