import { IsNotEmpty, IsEnum } from "class-validator";
import { Status } from "../occurrence.entity";

export class UpdateOccurrenStatusceDto {
  @IsEnum(Status, { message: "Tipo de status inválido" })
  @IsNotEmpty()
  status!: Status;
}
