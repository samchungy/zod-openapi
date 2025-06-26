import { z } from 'zod/v4';

import { JobIdSchema, JobTitleSchema } from './common';

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

export const CreateJobResponseSchema = z
  .object({
    id: JobIdSchema,
  })
  .meta({ description: 'Create Job Response' });
