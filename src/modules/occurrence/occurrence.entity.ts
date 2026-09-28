import { Types } from "mongoose";

export class OccurrenceEntity {
  public _id: string;
  public siteId: string;
  public droneId: string;
  public type: any;
  public severity: number;
  public detectedAt: Date;
  public status: string;
  public count: number;
  public note: string;

  constructor(input: Omit<OccurrenceEntity, "_id">) {
    this._id = Types.ObjectId.generate().toString();
    this.siteId = input.siteId;
    this.droneId = input.droneId;
    this.type = input.type;
    this.severity = input.severity;
    this.detectedAt = new Date();
    this.status = input.status;
    this.count = input.count;
    this.note = input.note;
  }
}
