import { IsNotEmpty, IsEnum, isString, IsString } from "class-validator";
import { Status } from "../occurrence.entity";

export class UpdateOccurrenStatusceDto {
  @IsEnum(Status, { message: "Tipo de status inválido" })
  @IsNotEmpty()
  status!: Status;

  @IsString({ message: "Nota" })
  @IsNotEmpty()
  note!: string;
}
