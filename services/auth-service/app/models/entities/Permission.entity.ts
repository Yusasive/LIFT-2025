import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PermissionType } from './PermissionType.entity';

@Entity('permissions')
export class Permission {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar' })
    name!: string;

    @Column({ type: 'varchar' })
    action!: string;

    @Column({ type: 'varchar', nullable: true })
    description!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @ManyToOne(() => PermissionType)
    @JoinColumn({ name: 'permission_type_id' })
    permissionType!: PermissionType;
}