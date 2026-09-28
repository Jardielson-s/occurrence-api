import { mongoDB } from "./config";
import { OccurrenceRepository } from "./repositories/occurrence/occurrence.repository";
import { OccurrenceSchema } from "./repositories/occurrence/occurrence.schema";

export const occurrenceRepository = async () => {
  return new OccurrenceRepository(
    new OccurrenceSchema(await mongoDB()).getModel(),
  );
};
