import * as oa from '../model/openapi30';
export declare class OpenApiBuilder {
  rootDoc: oa.OpenAPIObject;
  static create(doc?: oa.OpenAPIObject): OpenApiBuilder;
  constructor(doc?: oa.OpenAPIObject);
  getSpec(): oa.OpenAPIObject;
  getSpecAsJson(
    replacer?: (key: string, value: unknown) => unknown,
    space?: string | number,
  ): string;
  getSpecAsYaml(): string;
  private static isValidOpenApiVersion;
  addOpenApiVersion(openApiVersion: string): OpenApiBuilder;
  addInfo(info: oa.InfoObject): OpenApiBuilder;
  addContact(contact: oa.ContactObject): OpenApiBuilder;
  addLicense(license: oa.LicenseObject): OpenApiBuilder;
  addTitle(title: string): OpenApiBuilder;
  addDescription(description: string): OpenApiBuilder;
  addTermsOfService(termsOfService: string): OpenApiBuilder;
  addVersion(version: string): OpenApiBuilder;
  addPath(path: string, pathItem: oa.PathItemObject): OpenApiBuilder;
  addSchema(
    name: string,
    schema: oa.SchemaObject | oa.ReferenceObject,
  ): OpenApiBuilder;
  addResponse(
    name: string,
    response: oa.ResponseObject | oa.ReferenceObject,
  ): OpenApiBuilder;
  addParameter(
    name: string,
    parameter: oa.ParameterObject | oa.ReferenceObject,
  ): OpenApiBuilder;
  addExample(
    name: string,
    example: oa.ExampleObject | oa.ReferenceObject,
  ): OpenApiBuilder;
  addRequestBody(
    name: string,
    reqBody: oa.RequestBodyObject | oa.ReferenceObject,
  ): OpenApiBuilder;
  addHeader(
    name: string,
    header: oa.HeaderObject | oa.ReferenceObject,
  ): OpenApiBuilder;
  addSecurityScheme(
    name: string,
    secScheme: oa.SecuritySchemeObject | oa.ReferenceObject,
  ): OpenApiBuilder;
  addLink(
    name: string,
    link: oa.LinkObject | oa.ReferenceObject,
  ): OpenApiBuilder;
  addCallback(
    name: string,
    callback: oa.CallbackObject | oa.ReferenceObject,
  ): OpenApiBuilder;
  addServer(server: oa.ServerObject): OpenApiBuilder;
  addTag(tag: oa.TagObject): OpenApiBuilder;
  addExternalDocs(extDoc: oa.ExternalDocumentationObject): OpenApiBuilder;
}
