import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export class WebSocketHelper {
  public static async parseAndValidateJSON<T extends object>(
    value: string,
    classType: new () => T
  ): Promise<T> {
    const parsed = JSON.parse(value);
    const instance = plainToInstance(classType, parsed);
    const errors = await validate(instance);

    if (errors.length > 0) throw errors;

    return instance;
  }
}
