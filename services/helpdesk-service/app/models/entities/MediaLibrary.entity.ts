import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('media_library')
export class MediaLibrary {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'file_name' })
    file_name: string;

    @Column({ name: 'original_name' })
    original_name: string;

    @Column({ name: 'file_path' })
    file_path: string;

    @Column({ name: 'file_type' })
    file_type: string;

    @Column({ nullable: true, name: 'file_size' })
    file_size: number;

    @Column({ nullable: true, name: 'alt_text' })
    alt_text: string;

    @Column('text', { nullable: true })
    caption: string;

    @Column({ nullable: true })
    tags: string;

    @Column({ nullable: true, name: 'uploaded_by' })
    uploaded_by: string;

    @Column({ default: true, name: 'is_active' })
    is_active: boolean;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}