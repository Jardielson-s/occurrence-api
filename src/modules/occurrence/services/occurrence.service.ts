import { IRepository } from "../../../shared/interfaces/IRepository";
import { OccurrenceEntity, Status } from "../occurrence.entity";

export class OcurrenceService {
  constructor(
    private readonly occurrenceRepository: IRepository<OccurrenceEntity>,
  ) {}

  async createOccurrence(
    input: Omit<OccurrenceEntity, "_id" | "detectedAt" | "count">,
  ) {
    const occurrence = new OccurrenceEntity({
      ...input,
      detectedAt: new Date(),
      count: 1,
    });
    const theLast10Minutes = new Date(Date.now() - 10 * 60 * 1000);

    const occurrenceAlreadyExists = await this.occurrenceRepository.findOne({
      siteId: occurrence.siteId,
      type: occurrence.type,
      detectedAt: { $gte: theLast10Minutes },
    });

    if (!occurrenceAlreadyExists) {
      return this.occurrenceRepository.save(occurrence);
    }
    return this.occurrenceRepository.update(
      occurrenceAlreadyExists._id.toString(),
      {
        count: occurrenceAlreadyExists.count + 1,
        severity:
          occurrenceAlreadyExists.severity === 5
            ? 5
            : occurrenceAlreadyExists.severity + 1,
      },
    );
  }

  async list(query?: object): Promise<Array<OccurrenceEntity> | []> {
    return this.occurrenceRepository.find(query);
  }

  async updateStatus(
    id: string,
    status: Status,
  ): Promise<OccurrenceEntity | null> {
    try {
      const occurrance = await this.occurrenceRepository.findOne({ _id: id });
      if (!occurrance) {
        throw new Error("Occurrance not found");
      }
      const sequentialStatus = {
        [Status.open]: 1,
        [Status.acknowledged]: 2,
        [Status.resolved]: 3,
      };
      const updateStatus = sequentialStatus[status];
      const currentStatus = sequentialStatus[occurrance.status];
      if (
        (currentStatus === 1 && updateStatus !== 2) ||
        (currentStatus === 2 && updateStatus !== 3) ||
        currentStatus === 3
      ) {
        throw new Error("Invalid status");
      }
      return this.occurrenceRepository.update(occurrance._id.toString(), {
        status: status,
      });
    } catch (error) {
      throw error;
    }
  }
}
