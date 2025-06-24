export const openApiVersions = ['3.1.0', '3.1.1'] as const;

export type OpenApiVersion = (typeof openApiVersions)[number];
