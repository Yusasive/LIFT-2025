import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('faqs')
export class FAQ {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    question: string;

    @Column({ type: 'text' })
    answer: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    category: string;

    @Column({ type: 'uuid', nullable: true })
    category_id: string;

    @Column({ type: 'jsonb', default: '[]' })
    keywords: string[];

    @Column({ type: 'boolean', default: false })
    is_published: boolean;

    @Column({ type: 'integer', default: 0 })
    display_order: number;

    @Column({ type: 'integer', default: 0 })
    helpful_count: number;

    @Column({ type: 'integer', default: 0 })
    view_count: number;

    @Column({ type: 'uuid', nullable: true })
    created_by: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}