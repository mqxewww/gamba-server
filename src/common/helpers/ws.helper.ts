import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export class WebSocketHelper {
  /**
   * Parses a JSON string received from a WebSocket message, validates the resulting object
   * against the provided class type, and returns the validated instance.
   *
   * @param value - The JSON string received from a WebSocket message.
   * @param classType - The class type to which the parsed object should be converted.
   *
   * @returns An instance of the provided class type.
   *
   * @throws An error if the parsed object fails validation.
   */
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
