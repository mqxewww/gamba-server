import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "~modules/auth/auth.service";
import type { SendLinkDTO } from "~modules/auth/dto/inbound/send-link.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("send-link")
  public async sendLick(@Body() body: SendLinkDTO): Promise<void> {
    return await this.authService.sendLink(body);
  }
}
