import { type ZodLazy, type ZodObject, type ZodType, z } from 'zod';

import { extendZodWithOpenApi } from '../../../extendZod';
import { createOutputState } from '../../../testing/state';
import type { SchemaComponent } from '../../components';
import { type Schema, createNewSchema, createSchemaObject } from '../../schema';

import { createLazySchema } from './lazy';
import { createObjectSchema } from './object';

extendZodWithOpenApi(z);

describe('createLazySchema', () => {
  it('throws an error when a lazy schema has no ref', () => {
    type Lazy = Lazy[];
    const lazy: z.ZodType<Lazy> = z.lazy(() => lazy.array());

    expect(() =>
      createSchemaObject(lazy as ZodLazy<any>, createOutputState(), [
        'response',
      ]),
    ).toThrow(
      `The schema at response > lazy schema > array items needs to be registered because it's circularly referenced`,
    );
  });

  it('throws errors when cycles without refs are detected', () => {
    const cycle1: any = z.lazy(() => z.array(z.object({ foo: cycle1 })));
    expect(() =>
      createSchemaObject(cycle1, createOutputState(), ['response']),
    ).toThrow(
      `The schema at response > lazy schema > array items > property: foo needs to be registered because it's circularly referenced`,
    );
    const cycle2: any = z.lazy(() => z.union([z.number(), z.array(cycle2)]));
    expect(() =>
      createSchemaObject(cycle2, createOutputState(), ['response']),
    ).toThrow(
      `The schema at response > lazy schema > union option 1 > array items needs to be registered because it's circularly referenced`,
    );
    const cycle3: any = z.lazy(() => z.record(z.tuple([cycle3.optional()])));
    expect(() =>
      createSchemaObject(cycle3, createOutputState(), ['response']),
    ).toThrow(
      `The schema at response > lazy schema > record value > tuple item 0 > optional needs to be registered because it's circularly referenced`,
    );
  });

  it('creates an lazy schema when the schema contains a ref', () => {
    type Lazy = Lazy[];
    const lazy: z.ZodType<Lazy> = z
      .lazy(() => lazy.array())
      .openapi({ ref: 'lazy' });

    const state = createOutputState();
    state.components.schemas.set(lazy, {
      type: 'in-progress',
      ref: 'lazy',
    });

    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'array',
        items: { $ref: '#/components/schemas/lazy' },
      },
      effects: [
        {
          type: 'component',
          zodType: lazy,
          path: ['lazy schema', 'array items'],
        },
      ],
    };

    const result = createLazySchema(lazy as ZodLazy<any>, state);
    expect(result).toEqual(expected);
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
    state.components.schemas.set(UserSchema, {
      type: 'in-progress',
      ref: 'user',
    });

    const expected: Schema = {
      type: 'schema',
      schema: {
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
      },
      effects: [
        {
          type: 'component',
          path: ['property: posts', 'optional', 'array items', 'lazy schema'],
          zodType: PostSchema,
        },
      ],
    };

    const result = createObjectSchema(
      UserSchema as ZodObject<any, any, any, any, any>,
      state,
    );

    expect(result).toEqual(expected);
  });

  it('supports sibling properties that are circular references', () => {
    const expected: Schema['schema'] = {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        posts: {
          type: 'array',
          items: { $ref: '#/components/schemas/post' },
        },
        comments: {
          type: 'array',
          items: { $ref: '#/components/schemas/post' },
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
    });

    const PostArray = z.array(z.lazy(() => PostSchema));

    const UserSchema: ZodType<User> = z.lazy(() =>
      BaseUser.extend({
        posts: PostArray.optional(),
        comments: PostArray.optional(),
      }),
    );

    const state = createOutputState();

    /**
     * Mimic initial state when doing
     *
     * createDocument({
     *   components: {
     *     schemas: {
     *       user: UserSchema,
     *       post: PostSchema
     *     }
     *   }
     * })
     */
    state.components.schemas.set(UserSchema, {
      type: 'in-progress',
      ref: 'user',
    });
    state.components.schemas.set(PostSchema, {
      type: 'manual',
      ref: 'post',
    });

    const result = createNewSchema(UserSchema, state);

    expect(result.schema).toEqual(expected);
  });

  it('creates a lazy schema which contains an effect', () => {
    type Post = {
      id: string;
      userId: string;
      user: Post;
    };

    const UserIdSchema = z.string().pipe(z.string());

    const PostSchema: ZodType<Post> = z
      .object({
        id: z.string(),
        userId: UserIdSchema,
        user: z.lazy(() => PostSchema).openapi({ ref: 'user' }),
      })
      .openapi({ ref: 'post' });

    const ContainerSchema = z.object({
      post: PostSchema,
    });

    const expected: Schema = {
      type: 'schema',
      schema: {
        properties: {
          post: {
            $ref: '#/components/schemas/post',
          },
        },
        required: ['post'],
        type: 'object',
      },
      effects: [
        {
          type: 'component',
          zodType: PostSchema,
          path: ['property: post'],
        },
      ],
    };

    const state = createOutputState();

    const result = createObjectSchema(ContainerSchema, state);

    expect(result).toEqual(expected);

    const UserSchema = (PostSchema as ZodObject<any, any, any, any, any>).shape
      .user;
    const expectedUserComponent: SchemaComponent = {
      type: 'complete',
      ref: 'user',
      effects: [
        {
          type: 'component',
          zodType: PostSchema,
          path: ['property: post', 'property: user', 'lazy schema'],
        },
      ],
      schemaObject: {
        $ref: '#/components/schemas/post',
      },
    };
    expect(state.components.schemas.get(UserSchema)).toEqual(
      expectedUserComponent,
    );
  });
});
