import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChatSession } from './ChatSession.entity';

@Entity('chat_messages')
export class ChatMessage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'session_id' })
    session_id: string;

    @Column({ name: 'sender_id' })
    sender_id: string;

    @Column({ name: 'sender_type' })
    sender_type: string;

    @Column('text')
    message: string;

    @Column({ default: 'text', name: 'message_type' })
    message_type: string;

    @Column({ default: false, name: 'is_read' })
    is_read: boolean;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @ManyToOne(() => ChatSession, session => session.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'session_id' })
    session: ChatSession;
}
