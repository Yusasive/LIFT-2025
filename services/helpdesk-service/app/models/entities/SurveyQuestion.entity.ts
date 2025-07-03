import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Survey } from './Survey.entity';

@Entity('survey_questions')
export class SurveyQuestion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'survey_id' })
    survey_id: string;

    @Column('text', { name: 'question_text' })
    question_text: string;

    @Column({ name: 'question_type' })
    question_type: string;

    @Column('jsonb', { nullable: true })
    options: any;

    @Column({ default: false, name: 'is_required' })
    is_required: boolean;

    @Column({ default: 1, name: 'display_order' })
    display_order: number;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @ManyToOne(() => Survey, survey => survey.questions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'survey_id' })
    survey: Survey;
}
