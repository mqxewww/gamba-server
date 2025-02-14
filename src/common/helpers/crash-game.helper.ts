import { createHash, randomBytes } from "crypto";
import { Server } from "socket.io";
import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";
import { CrashGameStateEnum } from "~modules/crash-games/enums/crash-game-state.enum";

export class CrashGameHelper {
  public static MIN_CLIENT = 3;

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

  /**
   * Determines if a new crash game should be created.
   *
   * @param server
   * @param currentCrashGame - The current crash game, typically the result of the `getCurrentCrashGame` method from CrashGamesService.
   * @param minClients - The minimum number of clients required to start a new crash game (default is 3).
   *
   * @returns Returns true if a new Crash game should be created, otherwise returns false.
   */
  public static shouldCreateNewCrashGame(
    server: Server,
    currentCrashGame: CrashGame | null,
    minClients = this.MIN_CLIENT
  ): boolean {
    if (!currentCrashGame) {
      if (server.sockets.sockets.size >= minClients) return true;

      return false;
    }

    return currentCrashGame.state === CrashGameStateEnum.FINISHED;
  }
}
