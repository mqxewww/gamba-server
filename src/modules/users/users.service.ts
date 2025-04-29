import { Injectable, Logger } from "@nestjs/common";
import { Socket } from "socket.io";
import { AuthService } from "~modules/auth/auth.service";
import { UserDTO } from "~modules/users/dto/outbound/user.dto";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly usersConnected = new Map<string, UserDTO>();
  private spectatorsCount = 0;

  public constructor(private readonly authService: AuthService) {}

  public async handleConnection(client: Socket): Promise<UserDTO | null> {
    const user = await this.validateClient(client);

    if (user) {
      this.usersConnected.set(client.id, user);
      this.logger.log(`[+] ${user.name} joined.`);

      return user;
    }

    this.spectatorsCount++;
    this.logger.log(`[+] spectator joined.`);

    return null;
  }

  public handleDisconnect(client: Socket): void {
    const user = this.usersConnected.get(client.id);

    if (user) {
      this.usersConnected.delete(client.id);
      this.logger.log(`[-] ${user.name} left.`);
    } else {
      this.spectatorsCount--;
      this.logger.log(`[-] spectator left.`);
    }
  }

  public async validateClient(client: Socket): Promise<UserDTO | null> {
    const { token, email } = client.handshake.query;

    if (token && !Array.isArray(token) && email && !Array.isArray(email)) {
      const user = await this.authService.validateToken(email, token);

      if (user) client.data.user = user;

      return user;
    }

    return null;
  }
}
