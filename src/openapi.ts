export const openApiVersions = [
  '3.0.0',
  '3.0.1',
  '3.0.2',
  '3.0.3',
  '3.1.0',
] as const;

export type OpenApiVersion = (typeof openApiVersions)[number];

export const satisfiesVersion = (
  test: OpenApiVersion,
  against: OpenApiVersion,
) => openApiVersions.indexOf(test) >= openApiVersions.indexOf(against);
