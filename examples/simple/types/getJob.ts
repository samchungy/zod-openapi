import { z } from 'zod';

import { FooSchema, JobIdSchema, JobTitleSchema, UserIdSchema } from './common';

/**
 * Get Job Query Parameters
 */
export const GetJobQuerySchema = z
  .strictObject({
    /**
     * A unique identifier for a job
     * @example "4dd643ff-7ec7-4666-9c88-50b7d3da34e4"
     */
    id: JobIdSchema,
    /**
     * Foo Schema
     * @example "123"
     */
    foo: FooSchema,
  })
  .openapi({ description: 'Get Job Query Parameters' });

/**
 * Get Job Response
 */
export const GetJobResponseSchema = z
  .object({
    /**
     * A unique identifier for a job
     * @example "4dd643ff-7ec7-4666-9c88-50b7d3da34e4"
     */
    id: JobIdSchema,
    /**
     * A name that describes the job
     * @example "Mid level developer"
     */
    title: JobTitleSchema,
    /**
     * A unique identifier for a user
     * @example "60001234"
     */
    userId: UserIdSchema,
    /**
     * Foo Schema
     * @example "123"
     */
    foo: FooSchema,
  })
  .openapi({
    description: 'Get Job Response',
  });
