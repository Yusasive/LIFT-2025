import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ChatMessage } from './ChatMessage.entity';

@Entity('chat_sessions')
export class ChatSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    user_id: string;

    @Column({ name: 'user_type' })
    user_type: string;

    @Column({ nullable: true, name: 'user_email' })
    user_email: string;

    @Column({ nullable: true })
    topic: string;

    @Column({ default: 'active' })
    status: string;

    @Column({ nullable: true, name: 'assigned_to' })
    assigned_to: string;

    @Column({ default: 'normal' })
    priority: string;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    @OneToMany(() => ChatMessage, message => message.session)
    messages: ChatMessage[];
}
