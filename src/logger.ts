export interface LogStream {
  info(...args: string[]): void;
}

export class Logger {
  constructor(private readonly stream: LogStream) {}

  public info(message: string, ...args: any[]) {
    this.stream.info(`[%s][%s] ${message}`, 'INFO', new Date().toISOString(), ...args);
  }
}
