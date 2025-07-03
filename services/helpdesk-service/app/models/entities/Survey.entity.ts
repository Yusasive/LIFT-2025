import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { SurveyQuestion } from './SurveyQuestion.entity';
import { SurveyResponse } from './SurveyResponse.entity';

@Entity('surveys')
export class Survey {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text', { nullable: true })
    description: string;

    @Column({ default: true, name: 'is_active' })
    is_active: boolean;

    @Column({ nullable: true, name: 'start_date' })
    start_date: Date;

    @Column({ nullable: true, name: 'end_date' })
    end_date: Date;

    @Column({ nullable: true, name: 'target_audience' })
    target_audience: string;

    @Column({ nullable: true, name: 'max_responses' })
    max_responses: number;

    @Column({ nullable: true, name: 'created_by' })
    created_by: string;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    @OneToMany(() => SurveyQuestion, question => question.survey)
    questions: SurveyQuestion[];

    @OneToMany(() => SurveyResponse, response => response.survey)
    responses: SurveyResponse[];
}
