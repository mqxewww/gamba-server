import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class AppService {
  private logger = new Logger(AppService.name);
  private connections = new Map<string, string>();

  public registerClient(clientId: string, namespace: string): void {
    this.connections.set(clientId, namespace);

    this.logger.log(`Register client ${clientId} inside ${namespace} namespace`);
    this.logger.log(`Total connections: ${this.connections.size}`);
  }

  public removeClient(clientId: string): void {
    const ns = this.connections.get(clientId);

    this.connections.delete(clientId);

    this.logger.log(`Removed client ${clientId} from ${ns} namespace`);
    this.logger.log(`Total connections: ${this.connections.size}`);
  }

  public getTotalConnections(): number {
    return this.connections.size;
  }
}
