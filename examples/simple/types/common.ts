import { z } from 'zod';

/**
 * A unique identifier for a user
 * @example "60001234"
 */
export const UserIdSchema = z.string().openapi({
  description: 'A unique identifier for a user',
  example: '60001234',
});

/**
 * A unique identifier for a job
 * @example "4dd643ff-7ec7-4666-9c88-50b7d3da34e4"
 */
export const JobIdSchema = z.string().uuid().openapi({
  description: 'A unique identifier for a job',
  example: '4dd643ff-7ec7-4666-9c88-50b7d3da34e4',
});

/**
 * A name that describes the job
 * @example "Mid level developer"
 */
export const JobTitleSchema = z.string().nonempty().openapi({
  description: 'A name that describes the job',
  example: 'Mid level developer',
});
