import { IsEmail, IsOptional, IsUUID } from "class-validator";

export class HandleClientConnectedDTO {
  @IsOptional()
  @IsUUID()
  public token?: string;

  @IsOptional()
  @IsEmail()
  public email?: string;
}
