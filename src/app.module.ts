import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GamesModule } from "~modules/games/games.module";
import { UserTemplatesModule } from "~modules/user-templates/user-templates.module";
import { UsersModule } from "~modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "./config/.env",
      isGlobal: true
    }),
    MikroOrmModule.forRoot(),
    GamesModule,
    UserTemplatesModule,
    UsersModule
  ],
  providers: []
})
export class AppModule {}
