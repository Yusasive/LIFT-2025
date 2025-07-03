import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Permission } from './Permission.entity';

@Entity('permission_types')
export class PermissionType {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar' })
    name!: string;

    @Column({ type: 'varchar', nullable: true })
    description!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @OneToMany(() => Permission, permission => permission.permissionType)
    permissions?: Permission[];

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive!: boolean;
} 