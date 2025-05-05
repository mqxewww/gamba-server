import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "~modules/auth/auth.service";
import type { MagicLinkDTO } from "~modules/auth/dto/inbound/magic-link.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("magic-link")
  public async magicLink(@Body() body: MagicLinkDTO): Promise<void> {
    return await this.authService.magicLink(body);
  }
}
