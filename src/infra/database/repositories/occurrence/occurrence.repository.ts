import { _QueryFilter, Model } from "mongoose";
import {
  IOccurrenceDocument,
  IOccurrenceSchema,
  OccurrenceType,
} from "./occurrence.schema";
import { IRepository } from "../../../../shared/interfaces/IRepository";

export class OccurrenceRepository implements IRepository<IOccurrenceSchema> {
  constructor(private readonly model: Model<IOccurrenceDocument>) {}

  async save(data: IOccurrenceSchema): Promise<IOccurrenceDocument> {
    return await this.model.create(data);
  }

  async findById(id: string | number): Promise<IOccurrenceDocument | null> {
    return await this.model.findById({ _id: id });
  }

  async find(
    filterQuery: Record<string, any> = {},
  ): Promise<Array<IOccurrenceDocument> | []> {
    return this.model.aggregate([
      {
        $match: {
          ...(Object.keys(filterQuery).length > 0 ? filterQuery : []),
        },
      },
      {
        $addFields: {
          typeWeight: {
            $switch: {
              branches: [
                { case: { $eq: ["$type", OccurrenceType.intrusion] }, then: 3 },
                {
                  case: { $eq: ["$type", OccurrenceType.perimeter_breach] },
                  then: 2,
                },
                {
                  case: { $eq: ["$type", OccurrenceType.low_battery] },
                  then: 1,
                },
                {
                  case: { $eq: ["$type", OccurrenceType.signal_loss] },
                  then: 1,
                },
              ],
              default: 1,
            },
          },
        },
      },
      {
        $addFields: {
          priority: { $multiply: ["$severity", "$typeWeight"] },
        },
      },
      {
        $sort: { priority: -1, detectedAt: -1 },
      },
    ]);
  }

  async findOne(query?: object): Promise<IOccurrenceDocument | null> {
    return await this.model.findOne({
      ...(query ? query : {}),
    });
  }

  async update(
    id: string,
    data: Partial<IOccurrenceSchema>,
  ): Promise<IOccurrenceSchema | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }
}
