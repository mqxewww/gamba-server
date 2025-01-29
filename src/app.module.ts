import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CrashGamesModule } from "~modules/crash-games/crash-games.module";
import { UserTemplatesModule } from "~modules/user-templates/user-templates.module";
import { UsersModule } from "~modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "./config/.env",
      isGlobal: true
    }),
    MikroOrmModule.forRoot(),
    CrashGamesModule,
    UserTemplatesModule,
    UsersModule
  ],
  providers: []
})
export class AppModule {}
