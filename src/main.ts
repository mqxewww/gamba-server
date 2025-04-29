import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "src/app.module";
import { AppService } from "src/app.service";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    bufferLogs: true
  });

  app.enableCors({
    credentials: true,
    origin: ["localhost:3000"]
  });

  await app.listen(+process.env.API_PORT);
  await app.get(AppService).onStartup();
}

bootstrap();
