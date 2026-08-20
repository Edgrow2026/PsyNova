import { NextRequest, NextResponse } from 'next/server';
import { getNestServices } from '../../../server/nest-app';
import { getDatabaseOptions } from '../../../server/database/database.config';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action') || 'status';
    const lang = searchParams.get('language') || 'Tamil';

    // 1. Verify Environment Variables Config (No hardcoded values)
    let envCheck: Record<string, any> = {
      DB_HOST: process.env.DB_HOST ? `${process.env.DB_HOST}` : 'MISSING',
      DB_PORT: process.env.DB_PORT || 'MISSING',
      DB_USERNAME: process.env.DB_USERNAME || 'MISSING',
      DB_NAME: process.env.DB_NAME || 'MISSING',
      DB_SSL: process.env.DB_SSL || 'false',
      DB_PASSWORD_SET: Boolean(process.env.DB_PASSWORD),
    };

    // Validates that required environment variables are set without hardcoded fallbacks
    const dbOptions = getDatabaseOptions() as any;

    const { databaseService } = await getNestServices();

    if (action === 'migrate') {
      const migrationsRan = await databaseService.runMigrations();
      return NextResponse.json({
        success: true,
        action: 'migrate',
        executedMigrations: migrationsRan,
      });
    }

    if (action === 'jsonb-query') {
      const filterResult = await databaseService.queryByLanguageJsonb(lang);
      return NextResponse.json({
        success: true,
        action: 'jsonb-query',
        jsonbFilterResult: filterResult,
      });
    }

    if (action === 'jsonb-test') {
      const testResult = await databaseService.testJsonbReadWrite();
      return NextResponse.json({
        success: true,
        action: 'jsonb-test',
        testResult,
      });
    }

    if (action === 'seed') {
      await databaseService.seedInitialData();
      return NextResponse.json({
        success: true,
        action: 'seed',
        message: 'Initial data seeded into PostgreSQL successfully.',
      });
    }

    // Default status action: Verify connection
    const connInfo = await databaseService.verifyConnection();

    return NextResponse.json({
      success: true,
      environmentConfig: envCheck,
      typeOrmConfig: {
        type: dbOptions.type,
        host: dbOptions.host,
        port: dbOptions.port,
        username: dbOptions.username,
        database: dbOptions.database,
        ssl: Boolean(dbOptions.ssl),
        synchronize: dbOptions.synchronize,
      },
      connectionInfo: connInfo,
      message: 'PostgreSQL connection and TypeORM configuration verified successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        errorName: error.name || 'PostgresConfigError',
        errorMessage: error.message || 'Database connection or configuration failed',
        details: 'Failed fast as required. Missing or incorrect database environment variables or unreachable database host.',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { databaseService } = await getNestServices();
    const body = await req.json();

    if (body.action === 'run_migrations') {
      const migrations = await databaseService.runMigrations();
      return NextResponse.json({ success: true, migrations });
    }

    if (body.action === 'test_jsonb') {
      const result = await databaseService.testJsonbReadWrite();
      return NextResponse.json({ success: true, result });
    }

    if (body.action === 'query_jsonb') {
      const result = await databaseService.queryByLanguageJsonb(body.language || 'Tamil');
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
