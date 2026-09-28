import { IController } from "../../../shared/interfaces/IController";
import { IHttpResponse } from "../../../shared/interfaces/IHttpResponse";
import { ok, server } from "../../interfaces/responses";
import { CreateOccurrenceDto } from "../dto/create-occurrance.dto";
import { OcurrenceService } from "../services/occurrence.service";

export class CreateOccurranceController implements IController {
  constructor(private readonly service: OcurrenceService) {}

  async handler(input: {
    requestBody: CreateOccurrenceDto;
    requestParams: object;
  }): Promise<IHttpResponse> {
    try {
      await this.service.createOccurrence(input.requestBody);
      return ok(`Occurrance created!`);
    } catch (error: any) {
      return server({ message: error.message });
    }
  }
}
