import { IsUUID } from "class-validator";

export class HandleCashoutDTO {
  @IsUUID()
  public user_uuid!: string;
}
