import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from "class-validator";
import { OccurrenceType, Status } from "../occurrence.entity";

export class CreateOccurrenceDto {
  @IsString()
  @IsNotEmpty()
  siteId!: string;

  @IsString()
  @IsNotEmpty()
  droneId!: string;

  @IsEnum(OccurrenceType, { message: "Tipo de ocorrência inválido" })
  @IsNotEmpty()
  type!: OccurrenceType;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  severity!: number;

  @IsEnum(Status, { message: "Status inválido" })
  @IsNotEmpty()
  status!: Status;

  @IsString()
  @IsOptional()
  note!: string;
}
