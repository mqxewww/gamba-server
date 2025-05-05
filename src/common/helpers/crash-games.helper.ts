import { createHash, randomBytes } from "crypto";

export class CrashGamesHelper {
  private static K = 0.0578;
  private static houseEdgePercent = 5;

  /**
   * Generates a random seed used to determine the crash tick.
   *
   * @returns The generated seed, which can be used to define the crash tick.
   */
  public static generateRandomSeed(): string {
    const timestamp = Date.now().toString();
    const randomUUID = randomBytes(16).toString("hex");

    return createHash("sha256")
      .update(timestamp + randomUUID)
      .digest("hex");
  }

  /**
   * Gets the crash tick based on the provided seed.
   *
   * @param seed - The seed used to generate the crash tick, typically the result of the `generateRandomSeed` method.
   * @param houseEdgePercent - The percentage of the house edge (default is 5).
   *
   * @returns The crash tick value * 100 (e.g., 150 for a 1.50 crash tick).
   */
  public static getCrashTickFromSeed(seed: string, houseEdgePercent = this.houseEdgePercent) {
    const hash = createHash("sha256").update(seed).digest("hex");

    const h = Number.parseInt(hash.slice(0, 52 / 4), 16);
    const e = Math.pow(2, 52);
    const result = (100 * e - h) / (e - h);

    const houseEdgeModifier = 1 - houseEdgePercent / 100;
    const endResult = Math.max(100, result * houseEdgeModifier);

    return Math.floor(endResult);
  }

  /**
   * Calculates the crash tick value based on the given time.
   *
   * @param time - The time in milliseconds.
   *
   * @returns The calculated crash tick * 100 (e.g., 150 for a 1.50 crash tick).
   */
  public static getCrashTickFromTime(time: number) {
    return Math.floor(Math.exp(this.K * (time / 1000)) * 100);
  }

  /**
   * Calculates the time in milliseconds based on the given crash tick value.
   *
   * @param crashTick - The crash tick value.
   *
   * @returns The calculated time in milliseconds.
   */
  public static getTimeFromCrashTick(crashTick: number) {
    return Math.floor((Math.log(crashTick / 100) * 1000) / this.K);
  }
}
