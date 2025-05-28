import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { HandleClientConnectedDTO } from "~common/dto/inbound/handle-client-connected.dto";
import { TokenValidationData } from "~common/types/token-validation-data.type";
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

  public handleConnection(): void {
    this.spectatorsCount++;
  }

  public handleDisconnect(client: Socket): void {
    const user = this.usersConnected.get(client.id);

    if (user) {
      this.usersConnected.delete(client.id);
    } else {
      this.spectatorsCount--;
    }
  }

  public async handleUserClientConnected(
    client: Socket,
    message: HandleClientConnectedDTO
  ): Promise<TokenValidationData | undefined> {
    const response = await this.validateClient(client, message);

    if (response?.userData) {
      this.usersConnected.set(client.id, response.userData);
      this.spectatorsCount--;
    }

    return response;
  }

  public async validateClient(
    client: Socket,
    message: HandleClientConnectedDTO
  ): Promise<TokenValidationData | undefined> {
    if (message.token && message.email) {
      const response = await this.authService.validateToken(message.email, message.token);

      if (response.userData) client.data.user = response.userData;

      return response;
    }
  }
}
