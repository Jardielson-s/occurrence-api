import { IController } from "../../../shared/interfaces/IController";
import { IHttpResponse } from "../../../shared/interfaces/IHttpResponse";
import { ok, server } from "../../interfaces/responses";
import { OcurrenceService } from "../services/occurrence.service";

export class ListOccurranceController implements IController {
  constructor(private readonly service: OcurrenceService) {}

  async handler(query: {
    requestBody: object;
    requestParams: object;
  }): Promise<IHttpResponse> {
    try {
      const data = await this.service.list(query.requestParams);
      return ok(data);
    } catch (error: any) {
      return server({ message: error.message });
    }
  }
}
