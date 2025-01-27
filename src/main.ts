import { NestFactory } from "@nestjs/core";
import { AppModule } from "src/app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.enableCors({
    credentials: true,
    origin: ["localhost:3000"]
  });

  await app.listen(+process.env.API_PORT);
}

bootstrap();
