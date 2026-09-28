import { IHttpResponse } from "./IHttpResponse";

export interface IController<T = any> {
  handler: (args?: T) => Promise<IHttpResponse>;
}
