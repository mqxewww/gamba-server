import { EntityManager } from "@mikro-orm/mysql";
import { Injectable, Logger } from "@nestjs/common";
import { WsError } from "~common/constants/ws-errors.constant";
import { UserHelper } from "~common/helpers/user.helper";
import type { SendLinkDTO } from "~modules/auth/dto/inbound/send-link.dto";
import { Token } from "~modules/auth/entities/token.entity";
import { UserDTO } from "~modules/users/dto/outbound/user.dto";
import { User } from "~modules/users/entities/user.entity";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  public constructor(private readonly em: EntityManager) {}

  public async sendLink(body: SendLinkDTO): Promise<void> {
    let user = await this.em.findOne(User, { email: body.email }, { populate: ["token"] });

    if (!user) {
      const name = await UserHelper.formatUserName(body.email, async (name) => {
        return !(await this.em.findOne(User, { name }));
      });

      user = this.em.create(User, {
        name,
        email: body.email,
        coins: 200
      });
    }

    const token = this.em.create(Token, {
      user
    });

    await this.em.flush();

    // add nodemailer logic
  }

  public async validateToken(email: string, _token: string): Promise<UserDTO | null> {
    const token = await this.em.findOne(Token, { token: _token }, { populate: ["user"] });

    if (!token) {
      this.logger.log(WsError.TOKEN_DOESNT_EXISTS);

      return null;
    }

    if (token.user.email !== email) {
      this.logger.log(WsError.INVALID_TOKEN_EMAIL);

      return null;
    }

    if (token.expires_at < new Date()) {
      this.em.removeAndFlush(token);

      this.logger.log(WsError.TOKEN_HAS_EXPIRED);

      return null;
    }

    return UserDTO.build(token.user);
  }
}
