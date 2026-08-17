import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('patients')
export class PatientEntity {
  @PrimaryColumn('varchar')
  id!: string;

  @Column('varchar', { name: 'client_id', unique: true })
  clientId!: string;

  @Column('varchar')
  name!: string;

  @Column('varchar', { unique: true })
  email!: string;

  @Column('varchar')
  phone!: string;

  @Column('varchar', { default: 'Colombo' })
  district!: string;

  @Column('varchar', { nullable: true })
  password?: string;

  @Column('varchar', { default: 'Active' })
  status!: 'Active' | 'Deactivated' | 'Suspended';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
