import { Types } from "mongoose";
import { ObjectId } from "mongodb";

export enum OccurrenceType {
  intrusion = "intrusion",
  perimeter_breach = "perimeter_breach",
  low_battery = "low_battery",
  signal_loss = "signal_loss",
}

export enum Status {
  open = "open",
  acknowledged = "acknowledged",
  resolved = "resolved",
}

export class OccurrenceEntity {
  public _id: Types.ObjectId;
  public siteId: string;
  public droneId: string;
  public type: OccurrenceType;
  public severity: number;
  public detectedAt: Date | null;
  public status: Status;
  public count: number;
  public note?: string;

  constructor(input: Omit<OccurrenceEntity, "_id">) {
    this._id = new ObjectId();
    this.siteId = input.siteId;
    this.droneId = input.droneId;
    this.type = input.type;
    this.severity = input.severity;
    this.detectedAt = new Date();
    this.status = input.status;
    this.count = input.count || 1;
    this.note = input.note;
  }
}
