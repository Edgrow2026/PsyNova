import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import type { BoostTier, DoctorStatus } from '../../../lib/types';

export interface SpecialtiesAndLanguagesJson {
  specialties: string[];
  languages: string[];
}

export interface UpcomingSlotJson {
  id: string;
  datetime: string;
  status: 'available' | 'booked';
}

export interface QualificationDocJson {
  id: string;
  name: string;
  url: string;
  uploadDate: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

@Entity('psychiatrists')
export class PsychiatristEntity {
  @PrimaryColumn('varchar')
  id!: string;

  @Column('varchar')
  name!: string;

  @Column('varchar')
  title!: string;

  @Column('varchar', { name: 'slmc_reg_no' })
  slmcRegNo!: string;

  @Column('varchar', { default: 'pending' })
  status!: DoctorStatus;

  @Column('boolean', { name: 'is_boosted', default: false })
  isBoosted!: boolean;

  @Column('varchar', { name: 'boost_tier', default: 'none' })
  boostTier!: BoostTier;

  @Column('varchar', { name: 'boost_expiry', nullable: true })
  boostExpiry!: string | null;

  @Column('text')
  photo!: string;

  @Column('text')
  bio!: string;

  @Column('varchar')
  district!: string;

  @Column('integer', { name: 'fee_lkr' })
  feeLkr!: number;

  @Column('float', { default: 0 })
  rating!: number;

  @Column('integer', { name: 'review_count', default: 0 })
  reviewCount!: number;

  // JSONB Column for Specialties and Languages (supports @> containment queries)
  @Column('jsonb', { name: 'specialties_and_languages' })
  specialtiesAndLanguages!: SpecialtiesAndLanguagesJson;

  // JSONB Column for Rating Distribution
  @Column('jsonb', { name: 'rating_distribution' })
  ratingDistribution!: Record<string, number>;

  // JSONB Column for Upcoming Telehealth Slots
  @Column('jsonb', { name: 'upcoming_slots', default: '[]' })
  upcomingSlots!: UpcomingSlotJson[];

  // JSONB Column for Verification Documents
  @Column('jsonb', { name: 'documents', default: '[]' })
  documents!: QualificationDocJson[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
