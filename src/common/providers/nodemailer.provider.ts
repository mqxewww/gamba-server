import {
  DynamicModule,
  Injectable,
  InternalServerErrorException,
  Logger,
  Module,
  OnApplicationShutdown
} from "@nestjs/common";
import { createTransport, Transporter } from "nodemailer";
import { AppError } from "~common/constants/app-error.constant";
import { MailBody, MailSubject } from "~common/constants/mail-body.constant";

type NodemailerResponse = {
  accepted: string[];
  rejected: string[];
  ehlo: string[];
  envelopeTime: number;
  messageTime: number;
  messageSize: number;
  response: string;
  envelope: { from: string; to: string[] };
  messageId: string;
};

@Injectable()
export class NodemailerProvider implements OnApplicationShutdown {
  private readonly logger = new Logger(NodemailerProvider.name);
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = createTransport({
        pool: true,
        maxConnections: 3,
        maxMessages: 50,
        rateDelta: 1000,
        rateLimit: 10,

        service: "gmail",
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASS
        },

        connectionTimeout: 10000,
        greetingTimeout: 10000
      });
    }

    return this.transporter;
  }

  public async sendMail(
    to: string | string[],
    subject: MailSubject,
    params: Record<string, unknown>
  ): Promise<NodemailerResponse> {
    let html = MailBody[subject];

    for (const key in params) html = html.replace(`{{${key}}}`, `${params[key]}`);

    try {
      const response: NodemailerResponse = await this.getTransporter().sendMail({
        to,
        subject,
        html,
        priority: "high"
      });

      const subjectKey = Object.keys(MailSubject).find(
        (key) => MailSubject[key as keyof typeof MailSubject] === subject
      );

      switch (true) {
        case response.accepted.length === 1:
          this.logger.log(
            `An email was sent to ${response.accepted[0]} for ${subjectKey} with the following parameters: ${JSON.stringify(params)}`
          );
          break;
        case response.accepted.length > 1:
          this.logger.log(
            `An email was sent to ${response.accepted.length} addresses for ${subjectKey} with the following parameters: ${JSON.stringify(params)}`
          );
          break;
      }

      return response;
    } catch (error) {
      this.logger.warn(error);

      throw new InternalServerErrorException(AppError.EMAIL_ERROR);
    }
  }

  onApplicationShutdown() {
    if (this.transporter) this.transporter.close();
  }
}

@Module({
  providers: [
    {
      provide: "nodemailer",
      useClass: NodemailerProvider
    }
  ],
  exports: ["nodemailer"]
})
export class NodemailerModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: NodemailerModule
    };
  }
}
