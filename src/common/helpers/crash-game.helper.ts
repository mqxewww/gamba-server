import { createHash, randomBytes } from "crypto";

export class CrashGameHelper {
  public static generateRandomSeed(): string {
    const timestamp = Date.now().toString();
    const randomUUID = randomBytes(16).toString("hex");

    return createHash("sha256")
      .update(timestamp + randomUUID)
      .digest("hex");
  }
}
