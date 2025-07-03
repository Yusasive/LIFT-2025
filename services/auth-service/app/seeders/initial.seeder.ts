import { DataSource } from 'typeorm';
import { PermissionType } from '../models/entities/PermissionType.entity';
import { Permission } from '../models/entities/Permission.entity';
import { Role } from '../models/entities/Role.entity';
import { RolePermission } from '../models/entities/RolePermission.entity';

const permissionTypes = [
    {
        name: 'USER_MANAGEMENT',
        description: 'User management related permissions',
        permissions: [
            { name: 'create:users', action: 'CREATE', description: 'Can create users' },
            { name: 'read:users', action: 'READ', description: 'Can read user information' },
            { name: 'update:users', action: 'UPDATE', description: 'Can update users' },
            { name: 'delete:users', action: 'DELETE', description: 'Can delete/deactivate users' },
            { name: 'create:user', action: 'CREATE', description: 'Can create a user'},
            { name: 'read:user', action: 'READ', description: 'Can read a user profile'},
            { name: 'update:user', action: 'UPDATE', description: 'Can update a user profile'},
            { name: 'delete:user', action: 'DELETE', description: 'Can delete a user profile'},

        ]
    },
    {
        name: 'ROLE_MANAGEMENT',
        description: 'Role management related permissions',
        permissions: [
            { name: 'create:roles', action: 'CREATE', description: 'Can create roles' },
            { name: 'read:roles', action: 'READ', description: 'Can read role information' },
            { name: 'update:roles', action: 'UPDATE', description: 'Can update roles' },
            { name: 'delete:roles', action: 'DELETE', description: 'Can delete roles' }
        ]
    },
    {
        name: 'PERMISSION_MANAGEMENT',
        description: 'Permission management related permissions',
        permissions: [
            { name: 'create:permissions', action: 'CREATE', description: 'Can create permissions' },
            { name: 'read:permissions', action: 'READ', description: 'Can read permissions' },
            { name: 'update:permissions', action: 'UPDATE', description: 'Can assign/remove permissions' },
            { name: 'delete:permissions', action: 'DELETE', description: 'Can delete permissions' }
        ]
    },
    {
        name: 'EVENT_MANAGEMENT',
        description: 'Event management related permissions',
        permissions: [
            { name: 'create:events', action: 'CREATE', description: 'Can create events' },
            { name: 'read:events', action: 'READ', description: 'Can read event information' },
            { name: 'update:events', action: 'UPDATE', description: 'Can update events' },
            { name: 'delete:events', action: 'DELETE', description: 'Can delete events' }
        ]
    },
    {
        name: 'STAFF_MANAGEMENT',
        description: 'Staff management related permissions',
        permissions: [
            { name: 'create:staff', action: 'CREATE', description: 'Can create staff accounts' },
            { name: 'read:staff', action: 'READ', description: 'Can read staff information' },
            { name: 'update:staff', action: 'UPDATE', description: 'Can update staff accounts' },
            { name: 'delete:staff', action: 'DELETE', description: 'Can delete staff accounts' }
        ]
    },
    {
        name: 'BOOTH_MANAGEMENT',
        description: 'Booth management related permissions',
        permissions: [
            { name: 'create:booths', action: 'CREATE', description: 'Can create booths' },
            { name: 'read:booths', action: 'READ', description: 'Can read booth information' },
            { name: 'update:booths', action: 'UPDATE', description: 'Can update booths' },
            { name: 'delete:booths', action: 'DELETE', description: 'Can delete booths' },
            { name: 'approve:booths', action: 'UPDATE', description: 'Can approve booth applications' }
        ]
    },
    {
        name: 'EXHIBITOR_MANAGEMENT',
        description: 'EXHIBITOR management related permissions',
        permissions: [
            { name: 'create:exhibitors', action: 'CREATE', description: 'Can create exhibitors' },
            { name: 'read:exhibitors', action: 'READ', description: 'Can read exhibitors information' },
            { name: 'approve:exhibitors', action: 'UPDATE', description: 'Can approve exhibitors applications' },
            { name: 'delete:exhibitors', action: 'DELETE', description: 'Can delete exhibitors' },
            { name: 'suspend:exhibitors', action: 'UPDATE', description: 'Can suspend exhibitors' }
        ]
    },
    {
        name: 'ATTENDEE_MANAGEMENT',
        description: 'Attendee management related permissions',
        permissions: [
            { name: 'read:attendees', action: 'READ', description: 'Can read attendee information' },
            { name: 'update:attendees', action: 'UPDATE', description: 'Can update attendees' },
            { name: 'delete:attendees', action: 'DELETE', description: 'Can delete attendees' }
        ]
    },
    {
        name: 'ACTIVITY_LOGS',
        description: 'Activity logs related permissions',
        permissions: [
            { name: 'read:logs', action: 'READ', description: 'Can read activity logs' },
        ]
    },
    {
        name: 'SYSTEM_SETTINGS',
        description: 'System settings related permissions',
        permissions: [
            { name: 'read:settings', action: 'READ', description: 'Can read system settings' },
            { name: 'update:settings', action: 'UPDATE', description: 'Can update system settings' }
        ]
    }
];

const roles = [
    {
        name: 'SUPER_ADMIN',
        description: 'Super admin role with all permissions',
        created_by: 'SYSTEM',
        permissions: permissionTypes.flatMap(pt => pt.permissions.map(p => p.name))
    },
    {
        name: 'ORGANIZER',
        description: 'Event organizer with event management capabilities',
        created_by: 'SYSTEM',
        permissions: [
            'create:events', 'read:events', 'update:events', 'delete:events',
            'create:staff', 'read:staff', 'update:staff', 'delete:staff',
            'create:booths', 'read:booths', 'update:booths', 'delete:booths', 'approve:booths'
        ]
    },
    {
        name: 'ORGANIZER_STAFF',
        description: 'Staff member with limited event management permissions',
        created_by: 'SYSTEM',
        permissions: [
            'read:events', 'update:events',
            'read:booths', 'update:booths'
        ]
    },
    {
        name: 'EXHIBITOR',
        description: 'EXHIBITOR with product management permissions',
        created_by: 'SYSTEM',
        permissions: [
            'create:products', 'read:products', 'update:products', 'delete:products',
            'read:booths', 'read:user', 'create:user', 'update:user', 'delete:user'
        ]
    },
    {
        name: 'ATTENDEE',
        description: 'Regular attendee with basic permissions',
        created_by: 'SYSTEM',
        permissions: [
            'read:events',
            'read:products',
            'create:orders', 'read:orders', 'read:user', 'create:user', 'update:user', 'delete:user'
        ]
    }
];

export class InitialSeeder {
    constructor(private dataSource: DataSource) {}

    async run() {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Insert permission types and their permissions
            for (const pt of permissionTypes) {
                const permissionType = await queryRunner.manager.save(PermissionType, {
                    name: pt.name,
                    description: pt.description,
                    isActive: true
                });

                // Insert permissions for this type
                await queryRunner.manager.save(
                    Permission,
                    pt.permissions.map(p => ({
                        name: p.name,
                        action: p.action,
                        description: p.description,
                        permissionType
                    }))
                );
            }

            // Insert roles
            for (const r of roles) {
                const role = await queryRunner.manager.save(Role, {
                    name: r.name,
                    created_by: r.created_by,
                    description: r.description,
                    isActive: true
                });

                // Find permissions for this role
                const permissions = await queryRunner.manager.find(Permission, {
                    where: r.permissions.map(name => ({ name }))
                });

                // Create role-permission associations
                await queryRunner.manager.save(
                    RolePermission,
                    permissions.map(permission => ({
                        role,
                        permission
                    }))
                );
            }

            await queryRunner.commitTransaction();
            console.log('Database seeded successfully!');
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error seeding database:', error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
} 