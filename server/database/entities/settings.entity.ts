import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

export interface CommissionRulesJson {
  tier11DayFeeLkr: number;
  tier33DayFeeLkr: number;
  surgeMultiplier: number;
  allowRefunds: boolean;
}

@Entity('platform_settings')
export class SettingsEntity {
  @PrimaryColumn('integer')
  id!: number;

  @Column('float', { name: 'commission_rate' })
  commissionRate!: number;

  @Column('integer', { name: 'max_boosted_doctors' })
  maxBoostedDoctors!: number;

  @Column('integer', { name: 'boost_1_day_fee_lkr' })
  boost1DayFeeLkr!: number;

  @Column('integer', { name: 'boost_3_day_fee_lkr' })
  boost3DayFeeLkr!: number;

  @Column('jsonb', { name: 'commission_rules' })
  commissionRules!: CommissionRulesJson;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
