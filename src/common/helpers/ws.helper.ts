import { ValidationError } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";

type JSONValidationResponse<T> = {
  instance?: T;
  error?: { property: string; message: string | undefined }[];
};

export class WsHelper {
  /**
   * Parses a JSON string received from a WebSocket message, validates the resulting object
   * against the provided class type, and returns the validated instance.
   *
   * @param value - The JSON string received from a WebSocket message.
   * @param classType - The class type to which the parsed object should be converted.
   *
   * @returns
   *
   * @throws
   */
  public static async parseAndValidateJSON<T extends object>(
    value: string,
    classType: new () => T
  ): Promise<JSONValidationResponse<T>> {
    const parsed = JSON.parse(value);

    try {
      await validateOrReject(plainToInstance(classType, parsed), {
        whitelist: true,
        stopAtFirstError: true
      });

      return { instance: parsed };
    } catch (e) {
      const errors = e as ValidationError[];

      const result = errors.map(({ property, constraints }) => ({
        property,
        message: constraints?.[Object.keys(constraints)[0]]
      }));

      return { error: result };
    }
  }
}
