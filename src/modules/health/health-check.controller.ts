import { IHttpResponse } from "../../shared/interfaces/IHttpResponse";
import { ok, server } from "../interfaces/responses";
import { HealthCheckService } from "./health-check.service";

export class HealthCheckController {
  constructor(private readonly service: HealthCheckService) {}
  async handler(): Promise<IHttpResponse> {
    try {
      const message = await this.service.check();
      return ok(message);
    } catch (error: any) {
      return server(error.message);
    }
  }
}
