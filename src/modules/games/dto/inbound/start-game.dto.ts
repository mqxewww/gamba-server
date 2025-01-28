import { Transform } from "class-transformer";
import { IsNumber, IsUUID } from "class-validator";

export class StartGameDTO {
  @IsUUID()
  public game_uuid!: string;

  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value))
  public robots_count!: number;
}
