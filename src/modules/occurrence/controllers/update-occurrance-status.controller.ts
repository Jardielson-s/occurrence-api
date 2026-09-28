import { IController } from "../../../shared/interfaces/IController";
import { IHttpResponse } from "../../../shared/interfaces/IHttpResponse";
import {
  invalidRequest,
  notFound,
  ok,
  server,
} from "../../interfaces/responses";
import { UpdateOccurrenStatusceDto } from "../dto/update-occurrance-status.dto";
import { Status } from "../occurrence.entity";
import { OcurrenceService } from "../services/occurrence.service";

export class UpdateOccurranceStatusController implements IController {
  constructor(private readonly service: OcurrenceService) {}

  async handler(input: {
    requestBody: UpdateOccurrenStatusceDto;
    requestParams: {
      id: string;
      status: Status;
    };
  }): Promise<IHttpResponse> {
    try {
      const data = await this.service.updateStatus(
        input.requestParams.id,
        input.requestBody.status,
      );
      return ok({ message: `Occurrance Updated!`, _id: data?._id });
    } catch (error: any) {
      if (["Invalid status"].includes(error.message)) {
        return invalidRequest({ message: error.message });
      }
      if (["Occurrance not found"].includes(error.message)) {
        return notFound({ message: error.message });
      }
      return server({ message: error.message });
    }
  }
}
