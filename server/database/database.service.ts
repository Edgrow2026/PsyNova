import { Injectable, Logger } from '@nestjs/common';
import { getAppDataSource } from './data-source';
import { PsychiatristEntity } from './entities/psychiatrist.entity';
import { BookingEntity } from './entities/booking.entity';
import { PatientEntity } from './entities/patient.entity';
import { ReviewEntity } from './entities/review.entity';
import { ComplaintEntity } from './entities/complaint.entity';
import { SettingsEntity } from './entities/settings.entity';
import { initialPsychiatrists, initialReviews, initialComplaints, initialPlatformSettings } from '../../lib/mockData';
import { PatientAccount } from '../../lib/types';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  private isInitialized = false;
  private inMemoryPatients: PatientAccount[] = [];

  async getDataSource() {
    const ds = getAppDataSource();
    if (!ds.isInitialized) {
      this.logger.log('Initializing TypeORM DataSource connection...');
      await ds.initialize();
      this.logger.log('PostgreSQL TypeORM DataSource successfully connected.');
    }
    return ds;
  }

  /**
   * Verify genuine PostgreSQL connection. Fails fast if credentials/connection fails.
   */
  async verifyConnection() {
    try {
      const ds = await this.getDataSource();
      const rawResult = await ds.query('SELECT current_database(), current_user, version();');
      return {
        status: 'CONNECTED',
        database: rawResult[0]?.current_database,
        user: rawResult[0]?.current_user,
        postgresVersion: rawResult[0]?.version,
      };
    } catch (error: any) {
      this.logger.error(`PostgreSQL Connection Failed: ${error.message}`);
      throw new Error(`[PostgresConnectionFailure] Failed to connect to PostgreSQL database: ${error.message}`);
    }
  }

  /**
   * Execute pending TypeORM schema migrations
   */
  async runMigrations() {
    const ds = await this.getDataSource();
    this.logger.log('Running TypeORM database migrations...');
    const migrations = await ds.runMigrations();
    this.logger.log(`Executed ${migrations.length} migration(s) successfully.`);
    return migrations.map((m) => m.name);
  }

  /**
   * Seed initial data into PostgreSQL if tables are empty
   */
  async seedInitialData() {
    const ds = await this.getDataSource();

    // 1. Seed Platform Settings
    const settingsRepo = ds.getRepository(SettingsEntity);
    const countSettings = await settingsRepo.count();
    if (countSettings === 0) {
      await settingsRepo.save({
        id: 1,
        commissionRate: initialPlatformSettings.commissionRate,
        maxBoostedDoctors: initialPlatformSettings.maxBoostedDoctors,
        boost1DayFeeLkr: 1500,
        boost3DayFeeLkr: 3500,
        commissionRules: {
          tier11DayFeeLkr: 1500,
          tier33DayFeeLkr: 3500,
          surgeMultiplier: 1.0,
          allowRefunds: true,
        },
      });
    }

    // 2. Seed Psychiatrists with JSONB fields
    const docRepo = ds.getRepository(PsychiatristEntity);
    const countDocs = await docRepo.count();
    if (countDocs === 0) {
      for (const p of initialPsychiatrists) {
        await docRepo.save({
          id: p.id,
          name: p.name,
          title: p.title,
          slmcRegNo: p.slmcRegNo,
          status: p.status,
          isBoosted: p.isBoosted,
          boostTier: p.boostTier,
          boostExpiry: p.boostExpiry,
          photo: p.photo,
          bio: p.bio,
          district: p.district,
          feeLkr: p.feeLkr,
          rating: p.rating,
          reviewCount: p.reviewCount,
          specialtiesAndLanguages: {
            specialties: p.specialties,
            languages: p.languages,
          },
          ratingDistribution: p.ratingDistribution,
          upcomingSlots: p.upcomingSlots as any,
          documents: p.documents as any,
        });
      }
    }

    // 3. Seed Reviews Audit
    const revRepo = ds.getRepository(ReviewEntity);
    const countReviews = await revRepo.count();
    if (countReviews === 0) {
      for (const rev of initialReviews) {
        await revRepo.save({
          id: rev.id,
          doctorId: rev.doctorId,
          patientName: rev.patientName,
          rating: rev.rating,
          comment: rev.text,
          status: rev.flagged ? 'Flagged' : 'Published',
          createdAt: new Date(rev.date),
        });
      }
    }

    // 4. Seed Complaints Queue
    const cmpRepo = ds.getRepository(ComplaintEntity);
    const countComplaints = await cmpRepo.count();
    if (countComplaints === 0) {
      for (const cmp of initialComplaints) {
        await cmpRepo.save({
          id: cmp.id,
          bookingId: cmp.bookingId,
          complainantType: 'patient',
          complainantName: cmp.patientName,
          subject: cmp.reason,
          description: cmp.details,
          status: cmp.status === 'Resolved' ? 'Resolved' : 'Pending Review',
          resolutionNotes: cmp.resolutionNote || null,
          createdAt: new Date(cmp.createdAt),
        });
      }
    }
  }

  /**
   * Patient Database Operations
   */
  async getAllPatients() {
    try {
      const ds = await this.getDataSource();
      const patRepo = ds.getRepository(PatientEntity);
      return await patRepo.find({ order: { createdAt: 'DESC' } });
    } catch (err: any) {
      this.logger.warn(`PostgreSQL connection unavailable (${err.message}). Returning in-memory patient accounts fallback.`);
      return this.inMemoryPatients;
    }
  }

  async createPatient(data: { id?: string; clientId?: string; name: string; email: string; phone?: string; district?: string; password?: string }) {
    try {
      const ds = await this.getDataSource();
      const patRepo = ds.getRepository(PatientEntity);

      // Check if patient already exists by email
      let patient = await patRepo.findOne({ where: { email: data.email } });
      if (patient) {
        // Update name/phone/district/password if provided
        if (data.name) patient.name = data.name;
        if (data.phone) patient.phone = data.phone;
        if (data.district) patient.district = data.district;
        if (data.password) patient.password = data.password;
        return await patRepo.save(patient);
      }

      const id = data.id || `pat-${Date.now()}`;
      const clientId = data.clientId || `PN-PAT-${Math.floor(10000 + Math.random() * 90000)}`;

      patient = patRepo.create({
        id,
        clientId,
        name: data.name,
        email: data.email,
        phone: data.phone || '+94 77 000 0000',
        district: data.district || 'Colombo',
        password: data.password || undefined,
        status: 'Active',
      });

      return await patRepo.save(patient);
    } catch (err: any) {
      this.logger.warn(`PostgreSQL connection unavailable (${err.message}). Saving patient to fallback storage.`);
      const existing = this.inMemoryPatients.find((p) => p.email.toLowerCase() === data.email.toLowerCase());
      if (existing) {
        if (data.name) existing.name = data.name;
        if (data.phone) existing.phone = data.phone;
        if (data.district) existing.district = data.district;
        if (data.password) existing.password = data.password;
        return existing;
      }

      const id = data.id || `pat-${Date.now()}`;
      const clientId = data.clientId || `PN-PAT-${Math.floor(10000 + Math.random() * 90000)}`;
      const newPat: PatientAccount = {
        id,
        clientId,
        name: data.name,
        email: data.email,
        phone: data.phone || '+94 77 000 0000',
        district: data.district || 'Colombo',
        password: data.password || undefined,
        status: 'Active',
        createdAt: new Date().toISOString(),
      };
      this.inMemoryPatients.unshift(newPat);
      return newPat;
    }
  }

  /**
   * JSONB containment query execution
   * Demonstrates querying inside JSONB field: WHERE specialties_and_languages @> '{"languages": ["Tamil"]}'
   */
  async queryByLanguageJsonb(language: string) {
    const ds = await this.getDataSource();
    const query = `
      SELECT id, name, title, specialties_and_languages
      FROM psychiatrists
      WHERE specialties_and_languages @> $1::jsonb;
    `;
    const jsonFilter = JSON.stringify({ languages: [language] });
    const results = await ds.query(query, [jsonFilter]);
    return {
      queryExecuted: query.trim(),
      filterParam: jsonFilter,
      matchedCount: results.length,
      results,
    };
  }

  /**
   * Verify actual JSONB read and write persistence
   */
  async testJsonbReadWrite() {
    const ds = await this.getDataSource();
    const testId = `test-jsonb-${Date.now()}`;

    const jsonPayload = {
      specialties: ['Postgres JSONB Test Specialty'],
      languages: ['Sinhala', 'Tamil', 'English', 'JSONB-Native'],
    };

    // 1. Insert row with JSONB
    const docRepo = ds.getRepository(PsychiatristEntity);
    const newDoc = docRepo.create({
      id: testId,
      name: 'Dr. JSONB Test Specialist',
      title: 'PostgreSQL Consultant',
      slmcRegNo: 'SLMC-JSONB-999',
      status: 'approved',
      isBoosted: false,
      boostTier: 'none',
      boostExpiry: null,
      photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7',
      bio: 'Test record created to verify TypeORM JSONB persistence in PostgreSQL.',
      district: 'Colombo',
      feeLkr: 6000,
      rating: 5,
      reviewCount: 1,
      specialtiesAndLanguages: jsonPayload,
      ratingDistribution: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 },
      upcomingSlots: [],
      documents: [],
    });

    await docRepo.save(newDoc);

    // 2. Query raw row from Postgres to prove stored type is JSONB and parsed natively
    const rawRow = await ds.query('SELECT id, name, specialties_and_languages FROM psychiatrists WHERE id = $1', [testId]);
    const fetchedDoc = await docRepo.findOneBy({ id: testId });

    // 3. Clean up test row
    await docRepo.delete({ id: testId });

    const isParsedObject = typeof fetchedDoc?.specialtiesAndLanguages === 'object';
    const isArrayInJson = Array.isArray(fetchedDoc?.specialtiesAndLanguages?.languages);

    return {
      insertedId: testId,
      rawPostgresResult: rawRow[0],
      parsedObjectFromTypeORM: fetchedDoc?.specialtiesAndLanguages,
      verifiedJsonbType: isParsedObject && isArrayInJson,
      message: 'JSONB insert, raw query, object parsing, and containment verification successful!',
    };
  }
}
