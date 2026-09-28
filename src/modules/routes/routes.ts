import { Express } from "express";
import { adapterRoutes } from "../../adapter/adapter";
import { HealthCheckService } from "../health/health-check.service";
import { HealthCheckController } from "../health/health-check.controller";
import { occurrenceRoutes } from "../occurrence/occurrence.routes";

export const startServerExpress = async (app: Express) => {
  app.get(
    "/health-check",
    adapterRoutes(new HealthCheckController(new HealthCheckService())),
  );
  await occurrenceRoutes(app);
  return app;
};
