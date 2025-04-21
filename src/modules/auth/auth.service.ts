import { EntityManager } from "@mikro-orm/mysql";
import { Injectable, Logger } from "@nestjs/common";
import { UserHelper } from "~common/helpers/user.helper";
import type { SendLinkDTO } from "~modules/auth/dto/inbound/send-link.dto";
import { Token } from "~modules/auth/entities/token.entity";
import { User } from "~modules/users/entities/user.entity";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  public constructor(private readonly em: EntityManager) {}

  public async sendLink(body: SendLinkDTO): Promise<void> {
    let user = await this.em.findOne(User, { email: body.email }, { populate: ["token"] });

    if (!user) {
      this.logger.log(`User not found for email : ${body.email}`);

      const name = await UserHelper.formatUserName(body.email, async (name) => {
        // Name is valid if it's not already taken
        return !(await this.em.findOne(User, { name }));
      });

      user = this.em.create(User, {
        name,
        email: body.email,
        coins: 200
      });
    } else {
      this.logger.log(`User found : ${user.email}`);
    }

    const token = this.em.create(Token, {
      user
    });

    await this.em.flush();

    // add nodemailer logic
  }
}
