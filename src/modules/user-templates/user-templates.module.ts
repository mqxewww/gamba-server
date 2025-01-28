import { Module } from "@nestjs/common";
import { UserTemplatesController } from "~modules/user-templates/user-templates.controller";
import { UserTemplatesService } from "~modules/user-templates/user-templates.service";

@Module({
  controllers: [UserTemplatesController],
  providers: [UserTemplatesService]
})
export class UserTemplatesModule {}
