import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('content_sections')
export class ContentSection {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'section_name' })
    section_name: string;

    @Column({ name: 'section_type' })
    section_type: string;

    @Column({ nullable: true })
    title: string;

    @Column('text', { nullable: true })
    content: string;

    @Column('jsonb', { nullable: true, name: 'media_urls' })
    media_urls: any;

    @Column('jsonb', { nullable: true })
    settings: any;

    @Column({ nullable: true, name: 'page_location' })
    page_location: string;

    @Column({ default: 1, name: 'display_order' })
    display_order: number;

    @Column({ default: true, name: 'is_active' })
    is_active: boolean;

    @Column({ nullable: true, name: 'created_by' })
    created_by: string;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}
