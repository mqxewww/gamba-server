import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { BadRequestException, HttpException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "src/app.module";
import { AppService } from "src/app.service";
import { DatabaseExceptionFilter } from "~common/filters/database-exception.filter";
import { HttpExceptionFilter } from "~common/filters/http-exception.filter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  await app.register(helmet);

  await app.register(cors, {
    origin: process.env.FRONTEND_URL,
    credentials: true
  });

  await app.register(rateLimit, {
    max: 2,
    timeWindow: "10 minutes"
  });

  app.useGlobalFilters(new DatabaseExceptionFilter(), new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors): HttpException => {
        const result = errors.map(({ property, constraints }) => ({
          property,
          message: constraints?.[Object.keys(constraints)[0]]
        }));

        return new BadRequestException({ name: "ERROR_IN_PARAMETERS", message: result });
      },
      whitelist: true,
      stopAtFirstError: true
    })
  );

  await app.listen(+process.env.API_PORT);
  await app.get(AppService).onStartup();
}

bootstrap();
