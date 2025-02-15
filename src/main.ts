import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "src/app.module";
import pJson from "../package.json";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  app.enableCors({
    credentials: true,
    origin: ["localhost:3000"]
  });

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(`Documentation for ${pJson.name}`)
      .setVersion(pJson.version)
      .setDescription(pJson.description)
      .build()
  );

  SwaggerModule.setup("/", app, swaggerDocument);

  await app.listen(+process.env.API_PORT);
}

bootstrap();
