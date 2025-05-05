import {
  WebSocketGateway,
  WebSocketServer,
  type OnGatewayConnection,
  type OnGatewayDisconnect
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WsMessages } from "~common/enums/ws-messages.enum";
import { WsNamespaces } from "~common/enums/ws-namespaces.enum";
import { UsersService } from "~modules/users/users.service";

@WebSocketGateway({ namespace: WsNamespaces.USERS })
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  public constructor(private readonly usersService: UsersService) {}

  @WebSocketServer()
  private readonly server!: Server;

  public async handleConnection(client: Socket) {
    const user = await this.usersService.handleConnection(client);

    if (user) client.emit(WsMessages.USER_DATA, user);

    this.server.emit(WsMessages.USERS_LIST, this.usersService.getUsersList());
  }

  public handleDisconnect(client: Socket) {
    this.usersService.handleDisconnect(client);

    this.server.emit(WsMessages.USERS_LIST, this.usersService.getUsersList());
  }
}
