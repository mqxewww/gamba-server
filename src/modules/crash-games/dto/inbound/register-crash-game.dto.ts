import { Transform, Type } from "class-transformer";
import { IsArray, IsNumber, IsUUID } from "class-validator";

export class RegisterCrashGameBet {
  @IsUUID()
  public uuid!: string;

  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value))
  public amount!: number;

  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value))
  public auto_cashout!: number;
}

export class RegisterCrashGameDTO {
  @IsArray({ each: true })
  @Type(() => RegisterCrashGameBet)
  public bets!: RegisterCrashGameBet[];
}
