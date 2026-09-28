import { Model, Mongoose, Document, Types } from "mongoose";

export enum OccurrenceType {
  intrusion = "intrusion",
  perimeter_breach = "perimeter_breach",
  low_battery = "low_battery",
  signal_loss = "signal_loss", // Corrigido de "low_battery" para evitar duplicidade lógica
}

export enum Status {
  open = "open",
  acknowledged = "acknowledged",
  resolved = "resolved",
}

export interface IOccurrenceSchema {
  _id: Types.ObjectId;
  siteId: string;
  droneId: string;
  type: OccurrenceType;
  severity: number;
  detectedAt: Date | null;
  status: Status;
  count: number;
  note: string;
}

export interface IOccurrenceDocument extends IOccurrenceSchema, Document {}

export class OccurrenceSchema {
  private readonly model: Model<IOccurrenceDocument>;

  constructor(private readonly mongoose: Mongoose) {
    const OccurrenceSchemaDefinition = new this.mongoose.Schema(
      {
        _id: {
          type: String,
        },
        siteId: {
          type: String,
          required: true,
        },
        droneId: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: Object.values(OccurrenceType),
          required: true,
        },
        severity: {
          type: Number,
          required: true,
        },
        detectedAt: {
          type: Date,
          required: true,
          default: () => new Date(),
        },
        status: {
          type: String,
          enum: Object.values(Status),
          required: true,
        },
        count: {
          type: Number,
          required: true,
          default: 1,
        },
        note: {
          type: String,
          required: false,
        },
      },
      {
        timestamps: {
          createdAt: "createdAt",
          updatedAt: "updatedAt",
        },
      },
    );

    this.model = mongoose.model<IOccurrenceDocument>(
      "Occurrences",
      OccurrenceSchemaDefinition,
    );
  }

  getModel(): Model<IOccurrenceDocument> {
    return this.model;
  }
}
