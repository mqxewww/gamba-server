import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { CrashGamesModule } from "~modules/crash-games/crash-games.module";
import { UsersModule } from "~modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "./config/.env",
      isGlobal: true
    }),
    MikroOrmModule.forRoot(),
    EventEmitterModule.forRoot(),
    CrashGamesModule,
    UsersModule
  ]
})
export class AppModule {}
