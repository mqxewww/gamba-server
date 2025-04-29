import { Transform } from "class-transformer";
import { IsNumber } from "class-validator";

export class HandleAddBetDTO {
  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value))
  public amount!: number;
}
