import {
  WebSocketGateway,
  WebSocketServer,
  type OnGatewayConnection,
  type OnGatewayDisconnect
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WsMessageEnum } from "~common/enums/ws-message.enum";
import { WsNamespaceEnum } from "~common/enums/ws-namespace.enum";
import { UsersService } from "~modules/users/users.service";

@WebSocketGateway({ namespace: WsNamespaceEnum.USERS })
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  public constructor(private readonly usersService: UsersService) {}

  @WebSocketServer()
  private readonly server!: Server;

  public async handleConnection(client: Socket, ..._args: unknown[]) {
    const user = await this.usersService.handleConnection(client);

    if (user) client.emit(WsMessageEnum.USER_DATA, user);

    this.server.emit(WsMessageEnum.USERS_LIST, this.usersService.getUsersList());
  }

  public handleDisconnect(client: Socket) {
    this.usersService.handleDisconnect(client);

    this.server.emit(WsMessageEnum.USERS_LIST, this.usersService.getUsersList());
  }
}
