import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('hero_sections')
export class HeroSection {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    subtitle: string;

    @Column('text', { nullable: true })
    description: string;

    @Column({ nullable: true, name: 'background_image' })
    background_image: string;

    @Column({ nullable: true, name: 'cta_text' })
    cta_text: string;

    @Column({ nullable: true, name: 'cta_link' })
    cta_link: string;

    @Column({ default: true, name: 'is_active' })
    is_active: boolean;

    @Column({ default: 1, name: 'display_order' })
    display_order: number;

    @Column({ nullable: true, name: 'created_by' })
    created_by: string;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}
