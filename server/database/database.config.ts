import { DataSourceOptions } from 'typeorm';

export interface DatabaseConfigEnv {
  DB_HOST?: string;
  DB_PORT?: string;
  DB_USERNAME?: string;
  DB_PASSWORD?: string;
  DB_NAME?: string;
  DB_SSL?: string;
  DB_SYNCHRONIZE?: string;
}

export function getDatabaseOptions(env: Record<string, string | undefined> = process.env): DataSourceOptions {
  const host = env.DB_HOST;
  const portStr = env.DB_PORT;
  const username = env.DB_USERNAME;
  const password = env.DB_PASSWORD;
  const database = env.DB_NAME;
  const sslStr = env.DB_SSL;
  const synchronizeStr = env.DB_SYNCHRONIZE;

  const missing: string[] = [];
  if (!host) missing.push('DB_HOST');
  if (!portStr) missing.push('DB_PORT');
  if (!username) missing.push('DB_USERNAME');
  if (password === undefined || password === null) missing.push('DB_PASSWORD');
  if (!database) missing.push('DB_NAME');

  if (missing.length > 0) {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return {
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: '',
        database: 'psynova',
        synchronize: false,
      };
    }
    throw new Error(
      `[DatabaseConfigError] Cannot initialize PostgreSQL connection. Missing required environment variables: ${missing.join(
        ', '
      )}. Please configure these variables in your environment or .env file.`
    );
  }

  const port = parseInt(portStr!, 10);
  if (isNaN(port)) {
    throw new Error(`[DatabaseConfigError] Invalid DB_PORT value "${portStr}". Must be a valid integer.`);
  }

  const isSSL = sslStr?.toLowerCase() === 'true' || sslStr === '1';
  const synchronize = synchronizeStr !== undefined ? (synchronizeStr.toLowerCase() === 'true' || synchronizeStr === '1') : true;

  return {
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
    ssl: isSSL ? { rejectUnauthorized: false } : false,
    synchronize,
    logging: process.env.NODE_ENV === 'development',
  };
}
