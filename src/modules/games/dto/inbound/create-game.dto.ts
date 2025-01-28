import { IsString } from "class-validator";

export class CreateGameDTO {
  @IsString()
  public host_name!: string;
}
