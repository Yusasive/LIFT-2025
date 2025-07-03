import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Survey } from './Survey.entity';

@Entity('survey_responses')
export class SurveyResponse {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'survey_id' })
    survey_id: string;

    @Column({ nullable: true, name: 'user_id' })
    user_id: string;

    @Column({ nullable: true, name: 'user_email' })
    user_email: string;

    @Column('jsonb')
    responses: any;

    @CreateDateColumn({ name: 'submitted_at' })
    submitted_at: Date;

    @ManyToOne(() => Survey, survey => survey.responses, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'survey_id' })
    survey: Survey;
}
