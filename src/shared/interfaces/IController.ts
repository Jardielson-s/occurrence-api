import { IHttpResponse } from "./IHttpResponse";

export interface IController<B = any, Q = any> {
  handler: (args: {
    requestBody: object | B;
    requestParams: object | Q;
  }) => Promise<IHttpResponse>;
}
