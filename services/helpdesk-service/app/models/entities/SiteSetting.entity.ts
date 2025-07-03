import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('site_settings')
export class SiteSetting {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, name: 'setting_key' })
    setting_key: string;

    @Column('text', { nullable: true, name: 'setting_value' })
    setting_value: string;

    @Column({ default: 'text', name: 'setting_type' })
    setting_type: string;

    @Column('text', { nullable: true })
    description: string;

    @Column({ nullable: true })
    category: string;

    @Column({ nullable: true, name: 'updated_by' })
    updated_by: string;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}