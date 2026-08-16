import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('reviews')
export class ReviewEntity {
  @PrimaryColumn('varchar')
  id!: string;

  @Column('varchar', { name: 'doctor_id' })
  doctorId!: string;

  @Column('varchar', { name: 'patient_name' })
  patientName!: string;

  @Column('integer')
  rating!: number;

  @Column('text')
  comment!: string;

  @Column('varchar', { default: 'Published' })
  status!: 'Published' | 'Hidden' | 'Flagged';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
