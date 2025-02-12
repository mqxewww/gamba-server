import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CrashGamesService } from "~modules/crash-games/crash-games.service";

@WebSocketGateway()
export class CrashGamesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  public constructor(private readonly crashGamesService: CrashGamesService) {}

  @WebSocketServer()
  private readonly server!: Server;

  public async handleConnection(client: Socket) {
    const message = await this.crashGamesService.handleConnection(this.server, client);

    client.emit("crash-game/data", message);
  }

  public handleDisconnect(client: Socket) {
    this.crashGamesService.handleDisconnect(client, this.server);
  }

  @SubscribeMessage("crash-game/add-bet")
  public async handleAddBet(client: Socket, data: string) {
    const message = await this.crashGamesService.handleAddBet(client, data);

    client.emit("crash-game/add-bet-reply", true);

    this.server.emit("crash-game/data", message);
  }
}
