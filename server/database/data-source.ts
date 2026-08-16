import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { getDatabaseOptions } from './database.config';
import { PsychiatristEntity } from './entities/psychiatrist.entity';
import { BookingEntity } from './entities/booking.entity';
import { PatientEntity } from './entities/patient.entity';
import { ReviewEntity } from './entities/review.entity';
import { ComplaintEntity } from './entities/complaint.entity';
import { SettingsEntity } from './entities/settings.entity';
import { InitialSchema1700000000000 } from './migrations/1700000000000-InitialSchema';

let dataSourceInstance: DataSource | null = null;

export function getAppDataSource(): DataSource {
  if (!dataSourceInstance) {
    const options = getDatabaseOptions();
    dataSourceInstance = new DataSource({
      ...options,
      entities: [
        PsychiatristEntity,
        BookingEntity,
        PatientEntity,
        ReviewEntity,
        ComplaintEntity,
        SettingsEntity,
      ],
      migrations: [InitialSchema1700000000000],
    });
  }
  return dataSourceInstance;
}

export const AppDataSource = new Proxy({} as DataSource, {
  get(target, prop, receiver) {
    const instance = getAppDataSource();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
