import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Psychiatrists table with JSONB columns
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "psychiatrists" (
        "id" VARCHAR PRIMARY KEY,
        "name" VARCHAR NOT NULL,
        "title" VARCHAR NOT NULL,
        "slmc_reg_no" VARCHAR NOT NULL,
        "status" VARCHAR NOT NULL DEFAULT 'pending',
        "is_boosted" BOOLEAN NOT NULL DEFAULT false,
        "boost_tier" VARCHAR NOT NULL DEFAULT 'none',
        "boost_expiry" VARCHAR,
        "photo" TEXT NOT NULL,
        "bio" TEXT NOT NULL,
        "district" VARCHAR NOT NULL,
        "fee_lkr" INTEGER NOT NULL,
        "rating" FLOAT NOT NULL DEFAULT 0,
        "review_count" INTEGER NOT NULL DEFAULT 0,
        "specialties_and_languages" JSONB NOT NULL,
        "rating_distribution" JSONB NOT NULL,
        "upcoming_slots" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "documents" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // GIN Index for fast JSONB querying (e.g., WHERE specialties_and_languages @> '{"languages": ["Tamil"]}')
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_psychiatrists_jsonb_spec_lang"
      ON "psychiatrists" USING gin ("specialties_and_languages");
    `);

    // 2. Bookings table with JSONB status_history and gateway_response
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "bookings" (
        "id" VARCHAR PRIMARY KEY,
        "doctor_id" VARCHAR NOT NULL,
        "doctor_name" VARCHAR NOT NULL,
        "patient_id" VARCHAR,
        "patient_name" VARCHAR NOT NULL,
        "patient_email" VARCHAR NOT NULL,
        "patient_contact" VARCHAR NOT NULL,
        "slot_id" VARCHAR NOT NULL,
        "slot_datetime" VARCHAR NOT NULL,
        "status" VARCHAR NOT NULL,
        "payment_status" VARCHAR NOT NULL,
        "fee_lkr" INTEGER NOT NULL,
        "platform_commission_lkr" INTEGER NOT NULL,
        "net_doctor_earning_lkr" INTEGER NOT NULL,
        "payhere_ref" VARCHAR,
        "video_link" VARCHAR,
        "status_history" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "gateway_response" JSONB,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // 3. Patients table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "patients" (
        "id" VARCHAR PRIMARY KEY,
        "client_id" VARCHAR UNIQUE NOT NULL,
        "name" VARCHAR NOT NULL,
        "email" VARCHAR UNIQUE NOT NULL,
        "phone" VARCHAR NOT NULL,
        "district" VARCHAR NOT NULL DEFAULT 'Colombo',
        "status" VARCHAR NOT NULL DEFAULT 'Active',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // 4. Reviews table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reviews" (
        "id" VARCHAR PRIMARY KEY,
        "doctor_id" VARCHAR NOT NULL,
        "patient_name" VARCHAR NOT NULL,
        "rating" INTEGER NOT NULL,
        "comment" TEXT NOT NULL,
        "status" VARCHAR NOT NULL DEFAULT 'Published',
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // 5. Complaints table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "complaints" (
        "id" VARCHAR PRIMARY KEY,
        "booking_id" VARCHAR NOT NULL,
        "complainant_type" VARCHAR NOT NULL,
        "complainant_name" VARCHAR NOT NULL,
        "subject" VARCHAR NOT NULL,
        "description" TEXT NOT NULL,
        "status" VARCHAR NOT NULL DEFAULT 'Pending Review',
        "resolution_notes" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // 6. Platform Settings table with JSONB commission_rules
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "platform_settings" (
        "id" INTEGER PRIMARY KEY,
        "commission_rate" FLOAT NOT NULL,
        "max_boosted_doctors" INTEGER NOT NULL,
        "boost_1_day_fee_lkr" INTEGER NOT NULL,
        "boost_3_day_fee_lkr" INTEGER NOT NULL,
        "commission_rules" JSONB NOT NULL,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "platform_settings";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "complaints";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reviews";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "patients";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bookings";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "psychiatrists";`);
  }
}
