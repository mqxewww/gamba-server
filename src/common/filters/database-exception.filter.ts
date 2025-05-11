import {
  NotNullConstraintViolationException,
  UniqueConstraintViolationException
} from "@mikro-orm/core";
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { FastifyReply } from "fastify";
import { AppError } from "~common/constants/app-error.constant";

@Catch(UniqueConstraintViolationException, NotNullConstraintViolationException)
export class DatabaseExceptionFilter implements ExceptionFilter {
  public catch(
    exception: UniqueConstraintViolationException | NotNullConstraintViolationException,
    host: ArgumentsHost
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(AppError.UNHANDLED_DATABASE_ERROR);
  }
}
