import fs from 'fs';
import path from 'path';

import { ZodOpenApiOperationObject, createDocumentYaml } from '../../src';

import {
  CreateJobRequestSchema,
  CreateJobResponseSchema,
  GetJobQuerySchema,
  GetJobResponseSchema,
  JobIdSchema,
  JobTitleSchema,
} from './types';

const getJobOperation: ZodOpenApiOperationObject = {
  operationId: 'getJob',
  summary: 'Get Job',
  requestParams: {
    query: GetJobQuerySchema,
  },
  responses: {
    '200': {
      description: 'Successful operation',
      content: {
        'application/json': {
          schema: GetJobResponseSchema,
        },
      },
    },
  },
};

const createJobOperation: ZodOpenApiOperationObject = {
  operationId: 'createJob',
  summary: 'Create Job',
  requestBody: {
    content: {
      'application/json': {
        schema: CreateJobRequestSchema,
      },
    },
  },
  responses: {
    '201': {
      description: 'Successful creation',
      content: {
        'application/json': {
          schema: CreateJobResponseSchema,
        },
      },
    },
  },
};

const yaml = createDocumentYaml({
  openapi: '3.1.0',
  info: {
    title: 'Simple API',
    version: '1.0.0',
    description: 'A simple demo for zod-openapi',
    license: {
      name: 'MIT',
    },
  },
  components: {
    securitySchemes: {
      s2sauth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'An s2s token issued by an allow listed consumer',
      },
    },
    schemas: {
      jobTitle: JobTitleSchema,
      jobId: JobIdSchema,
    },
  },
  servers: [
    {
      url: 'http://example.com/dev',
      description: 'Dev Endpoint',
    },
    {
      url: 'http://example.com/prod',
      description: 'Prod Endpoint',
    },
  ],
  security: [
    {
      s2sauth: [],
    },
  ],
  paths: {
    '/job': {
      get: getJobOperation,
      post: createJobOperation,
    },
  },
});

// eslint-disable-next-line no-sync
fs.writeFileSync(path.join(__dirname, 'openapi.yml'), yaml);
