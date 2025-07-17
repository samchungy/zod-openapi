import * as z from 'zod/v4';

import { JobIdSchema, JobTitleSchema } from './common.js';

/**
 * Create Job Request
 */
export const CreateJobRequestSchema = z
  .strictObject({
    /**
     * A name that describes the job
     * @example "Mid level developer"
     */
    title: JobTitleSchema,
  })
  .meta({
    description: 'Create Job Request',
  });

/**
 * Create Job Response
 */
export const CreateJobResponseSchema = z
  .object({
    /**
     * A unique identifier for a job
     * @example "4dd643ff-7ec7-4666-9c88-50b7d3da34e4"
     */
    id: JobIdSchema,
  })
  .meta({ description: 'Create Job Response' });
