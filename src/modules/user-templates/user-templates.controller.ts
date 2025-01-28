import { Controller } from "@nestjs/common";
import { UserTemplatesService } from "~modules/user-templates/user-templates.service";

@Controller("user-templates")
export class UserTemplatesController {
  public constructor(private readonly userTemplatesService: UserTemplatesService) {}
}
