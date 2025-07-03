import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Role } from './Role.entity';
import { Permission } from './Permission.entity';

@Entity('role_permissions')
export class RolePermission {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'role_id', type: 'int' })
    roleId!: number;

    @Column({ name: 'permission_id', type: 'int' })
    permissionId!: number;

    @ManyToOne(() => Role)
    @JoinColumn({ name: 'role_id' })
    role!: Role;

    @ManyToOne(() => Permission)
    @JoinColumn({ name: 'permission_id' })
    permission!: Permission;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
} 