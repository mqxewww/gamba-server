import { Transform } from "class-transformer";
import { IsNumber, IsUUID } from "class-validator";

export class HandleAddBetDTO {
  @IsUUID()
  public user_uuid!: string;

  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value))
  public amount!: number;

  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value))
  public auto_cashout!: number;
}
