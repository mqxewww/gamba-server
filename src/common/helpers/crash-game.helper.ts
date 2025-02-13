import { createHash, randomBytes } from "crypto";
import { Server } from "socket.io";
import { CrashGame } from "~modules/crash-games/entities/crash-game.entity";
import { CrashGameStateEnum } from "~modules/crash-games/enums/crash-game-state.enum";

export class CrashGameHelper {
  public static generateRandomSeed(): string {
    const timestamp = Date.now().toString();
    const randomUUID = randomBytes(16).toString("hex");

    return createHash("sha256")
      .update(timestamp + randomUUID)
      .digest("hex");
  }

  public static shouldCreateNewCrashGame(
    server: Server,
    currentCrashGame: CrashGame | null,
    minClients: number
  ): boolean {
    if (!currentCrashGame) {
      if (server.sockets.sockets.size >= minClients) return true;

      return false;
    }

    return currentCrashGame.state === CrashGameStateEnum.FINISHED;
  }
}
