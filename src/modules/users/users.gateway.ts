import {
  WebSocketGateway,
  WebSocketServer,
  type OnGatewayConnection,
  type OnGatewayDisconnect
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WsNamespaceEnum } from "~common/enums/ws-namespace.enum";
import { UsersService } from "~modules/users/users.service";

@WebSocketGateway({ namespace: WsNamespaceEnum.USERS })
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  public constructor(private readonly usersService: UsersService) {}

  @WebSocketServer()
  private readonly server!: Server;

  public handleConnection(client: Socket, ..._args: unknown[]) {
    this.usersService.handleConnection(client);
  }

  public handleDisconnect(client: Socket) {
    this.usersService.handleDisconnect(client);
  }
}
