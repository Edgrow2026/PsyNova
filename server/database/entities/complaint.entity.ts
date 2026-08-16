import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('complaints')
export class ComplaintEntity {
  @PrimaryColumn('varchar')
  id!: string;

  @Column('varchar', { name: 'booking_id' })
  bookingId!: string;

  @Column('varchar', { name: 'complainant_type' })
  complainantType!: 'patient' | 'psychiatrist';

  @Column('varchar', { name: 'complainant_name' })
  complainantName!: string;

  @Column('varchar')
  subject!: string;

  @Column('text')
  description!: string;

  @Column('varchar', { default: 'Pending Review' })
  status!: 'Pending Review' | 'Investigating' | 'Resolved' | 'Dismissed';

  @Column('text', { name: 'resolution_notes', nullable: true })
  resolutionNotes!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
