import { IsEmail } from "class-validator";

export class MagicLinkDTO {
  @IsEmail()
  public email!: string;
}
