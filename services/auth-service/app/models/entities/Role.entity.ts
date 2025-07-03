import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { RolePermission } from './RolePermission.entity';
import { Permission } from './Permission.entity';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar' })
    name!: string;

    @Column({ type: 'varchar', nullable: true })
    description!: string;

    @Column({ type: 'varchar'})
    created_by!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive!: boolean;

    @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
    rolePermissions?: RolePermission[];

    permissions?: Permission[];
} 