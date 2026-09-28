import { Express } from "express";
import { adapterRoutes } from "../../adapter/adapter";
import { HealthCheckService } from "../health/health-check.service";
import { HealthCheckController } from "../health/health-check.controller";

export const startServerExpress = async (app: Express) => {
  app.get(
    "/health-check",
    adapterRoutes(new HealthCheckController(new HealthCheckService())),
  );

  return app;
};
