import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { AuthService } from "~modules/auth/auth.service";
import { UserDTO } from "~modules/users/dto/outbound/user.dto";

@Injectable()
export class UsersService {
  private readonly usersConnected = new Map<string, UserDTO>();
  private spectatorsCount = 0;

  public constructor(private readonly authService: AuthService) {}

  public getUsersList(): { users: number; spectators: number } {
    return {
      users: this.usersConnected.size,
      spectators: this.spectatorsCount
    };
  }

  public async handleConnection(client: Socket): Promise<UserDTO | null> {
    const user = await this.validateClient(client);

    if (user) {
      this.usersConnected.set(client.id, user);

      return user;
    }

    this.spectatorsCount++;

    return null;
  }

  public handleDisconnect(client: Socket): void {
    const user = this.usersConnected.get(client.id);

    if (user) {
      this.usersConnected.delete(client.id);
    } else {
      this.spectatorsCount--;
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
