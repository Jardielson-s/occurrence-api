export class HealthCheckService {
  constructor() {}

  async check(): Promise<{
    message: string;
  }> {
    return { message: "System OK!" };
  }
}
