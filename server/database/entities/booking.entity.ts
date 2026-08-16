import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import type { BookingStatus, PaymentStatus } from '../../../lib/types';

export interface StatusHistoryEntryJson {
  status: string;
  timestamp: string;
  updatedBy: string;
  reason?: string;
}

export interface GatewayResponseJson {
  merchantId?: string;
  orderId?: string;
  payhereAmount?: number;
  payhereCurrency?: string;
  statusCode?: number;
  statusMessage?: string;
  method?: string;
  raw?: Record<string, any>;
}

@Entity('bookings')
export class BookingEntity {
  @PrimaryColumn('varchar')
  id!: string;

  @Column('varchar', { name: 'doctor_id' })
  doctorId!: string;

  @Column('varchar', { name: 'doctor_name' })
  doctorName!: string;

  @Column('varchar', { name: 'patient_id', nullable: true })
  patientId!: string | null;

  @Column('varchar', { name: 'patient_name' })
  patientName!: string;

  @Column('varchar', { name: 'patient_email' })
  patientEmail!: string;

  @Column('varchar', { name: 'patient_contact' })
  patientContact!: string;

  @Column('varchar', { name: 'slot_id' })
  slotId!: string;

  @Column('varchar', { name: 'slot_datetime' })
  slotDatetime!: string;

  @Column('varchar')
  status!: BookingStatus;

  @Column('varchar', { name: 'payment_status' })
  paymentStatus!: PaymentStatus;

  @Column('integer', { name: 'fee_lkr' })
  feeLkr!: number;

  @Column('integer', { name: 'platform_commission_lkr' })
  platformCommissionLkr!: number;

  @Column('integer', { name: 'net_doctor_earning_lkr' })
  netDoctorEarningLkr!: number;

  @Column('varchar', { name: 'payhere_ref', nullable: true })
  payhereRef!: string | null;

  @Column('varchar', { name: 'video_link', nullable: true })
  videoLink!: string | null;

  // JSONB column for status transition audit trail
  @Column('jsonb', { name: 'status_history', default: '[]' })
  statusHistory!: StatusHistoryEntryJson[];

  // JSONB column for payment gateway payload audit
  @Column('jsonb', { name: 'gateway_response', nullable: true })
  gatewayResponse!: GatewayResponseJson | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
