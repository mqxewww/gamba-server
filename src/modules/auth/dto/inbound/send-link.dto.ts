import { IsEmail } from "class-validator";

export class SendLinkDTO {
  @IsEmail()
  public email!: string;
}
