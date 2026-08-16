import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseOptions } from './database.config';
import { PsychiatristEntity } from './entities/psychiatrist.entity';
import { BookingEntity } from './entities/booking.entity';
import { PatientEntity } from './entities/patient.entity';
import { ReviewEntity } from './entities/review.entity';
import { ComplaintEntity } from './entities/complaint.entity';
import { SettingsEntity } from './entities/settings.entity';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Build environment dictionary from ConfigService
        const env = {
          DB_HOST: configService.get<string>('DB_HOST'),
          DB_PORT: configService.get<string>('DB_PORT'),
          DB_USERNAME: configService.get<string>('DB_USERNAME'),
          DB_PASSWORD: configService.get<string>('DB_PASSWORD'),
          DB_NAME: configService.get<string>('DB_NAME'),
          DB_SSL: configService.get<string>('DB_SSL'),
        };

        const dbOptions = getDatabaseOptions(env);

        return {
          ...dbOptions,
          entities: [
            PsychiatristEntity,
            BookingEntity,
            PatientEntity,
            ReviewEntity,
            ComplaintEntity,
            SettingsEntity,
          ],
          migrationsRun: false,
          autoLoadEntities: true,
        };
      },
    }),
    TypeOrmModule.forFeature([
      PsychiatristEntity,
      BookingEntity,
      PatientEntity,
      ReviewEntity,
      ComplaintEntity,
      SettingsEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
