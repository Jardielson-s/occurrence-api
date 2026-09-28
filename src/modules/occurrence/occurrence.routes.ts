import { Express, Router } from "express";
import { CreateOccurranceController } from "../occurrence/controllers/create-occurrance.controller";
import { occurrenceRepository } from "../../infra/database/repositories.module";
import { OcurrenceService } from "../occurrence/services/occurrence.service";
import { ListOccurranceController } from "../occurrence/controllers/list-occurrances.controller";
import { UpdateOccurranceStatusController } from "../occurrence/controllers/update-occurrance-status.controller";
import { adapterRoutes } from "../../adapter/adapter";

export const occurrenceRoutes = async (app: Express) => {
  const occurranceMount = new OcurrenceService(await occurrenceRepository());
  const router = Router();
  router.post(
    "",
    adapterRoutes(new CreateOccurranceController(occurranceMount)),
  );
  router.get("", adapterRoutes(new ListOccurranceController(occurranceMount)));
  router.patch(
    "/:id/status",
    adapterRoutes(new UpdateOccurranceStatusController(occurranceMount)),
  );
  app.use("/occurrances", router);
};
