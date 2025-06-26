import { z } from 'zod/v4';

import { JobIdSchema, JobTitleSchema, UserIdSchema } from './common';

export const GetJobQuerySchema = z
  .strictObject({
    id: JobIdSchema,
  })
  .meta({ description: 'Get Job Query Parameters' });

export const GetJobResponseSchema = z
  .object({
    id: JobIdSchema,
    title: JobTitleSchema,
    userId: UserIdSchema,
  })
  .meta({
    description: 'Get Job Response',
  });
