import { EntityManager } from "@mikro-orm/mysql";
import { Injectable, Logger } from "@nestjs/common";
import { Socket } from "socket.io";
import { AppService } from "src/app.service";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  public constructor(
    private readonly em: EntityManager,
    private readonly appService: AppService
  ) {}

  public handleConnection(client: Socket): void {
    this.appService.registerClient(client.id, "users");
  }

  public handleDisconnect(client: Socket): void {
    this.appService.removeClient(client.id);
  }
}
