declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_PORT: number;
      DATABASE_HOST: string;
      DATABASE_PORT: number;
      DATABASE_USERNAME: string;
      DATABASE_PASSWORD: string;
      DATABASE_NAME: string;
    }
  }
}

export {};
