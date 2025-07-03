import "reflect-metadata";
import { DataSource, Repository } from "typeorm";
import { inject, autoInjectable } from "tsyringe";
import { Role } from "../models/entities/Role.entity";
import { RolePermission } from "../models/entities/RolePermission.entity";
import { CreateRoleDto, UpdateRoleDto } from "../models/dto/role.dto";
import { PermissionType } from "../models/entities/PermissionType.entity";

@autoInjectable()
export class RoleRepository {
    private roleRepo: Repository<Role>;
    private permissionTypeRepo: Repository<PermissionType>;

    constructor(@inject("DataSource") private dataSource: DataSource) {}

    private async initializeRepositories() {
        if (!this.dataSource.isInitialized) {
            await this.dataSource.initialize();
        }
        this.roleRepo = this.dataSource.getRepository(Role);
        this.permissionTypeRepo = this.dataSource.getRepository(PermissionType);
    }

    async findByName(name: string): Promise<Role | null> {
        await this.initializeRepositories();
        return this.roleRepo.findOne({
            where: { name },
            relations: ['rolePermissions', 'rolePermissions.permission']
        });
    }

    async create(createRoleDto: CreateRoleDto): Promise<Role> {
        await this.initializeRepositories();
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const role = await queryRunner.manager.save(Role, {
                name: createRoleDto.name,
                description: createRoleDto.description,
                created_by: createRoleDto.created_by,
                isActive: createRoleDto.isActive
            });

            if (createRoleDto.permissions?.length) {
                await queryRunner.manager.save(
                    RolePermission,
                    createRoleDto.permissions.map(permissionId => ({
                        role,
                        permissionId
                    }))
                );
            }

            await queryRunner.commitTransaction();
            return role;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async findAll(): Promise<Role[]> {
        await this.initializeRepositories();
        return this.roleRepo.find({
            relations: ['rolePermissions', 'rolePermissions.permission']
        });
    }

    async findById(id: number): Promise<Role | null> {
        await this.initializeRepositories();
        return this.roleRepo.findOne({
            where: { id },
            relations: ['rolePermissions', 'rolePermissions.permission']
        });
    }

    async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role | null> {
        await this.initializeRepositories();
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const role = await queryRunner.manager.findOne(Role, {
                where: { id },
                relations: ['rolePermissions']
            });

            if (!role) {
                return null;
            }

            // Update basic role properties
            if (updateRoleDto.name) role.name = updateRoleDto.name;
            if (updateRoleDto.description !== undefined) role.description = updateRoleDto.description;
            if (updateRoleDto.isActive !== undefined) role.isActive = updateRoleDto.isActive;

            await queryRunner.manager.save(role);

            // Update permissions if provided
            if (updateRoleDto.permissions !== undefined) {
                // Remove existing role-permission associations
                await queryRunner.manager.delete(RolePermission, { roleId: id });

                // Create new role-permission associations
                if (updateRoleDto.permissions.length > 0) {
                    await queryRunner.manager.save(
                        RolePermission,
                        updateRoleDto.permissions.map(permissionId => ({
                            role,
                            permissionId
                        }))
                    );
                }
            }

            await queryRunner.commitTransaction();
            return role;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async delete(id: number): Promise<boolean> {
        await this.initializeRepositories();
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // First delete all role-permission associations
            await queryRunner.manager.delete(RolePermission, { roleId: id });
            
            // Then delete the role
            const result = await queryRunner.manager.delete(Role, id);
            
            await queryRunner.commitTransaction();
            return result.affected ? result.affected > 0 : false;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
    
    async getPermissionTypesWithPermissions(): Promise<PermissionType[]> {
        await this.initializeRepositories();
        return this.permissionTypeRepo.find({
            relations: ['permissions'],
            where: { isActive: true },
            order: {
                name: 'ASC',
                permissions: {
                    name: 'ASC'
                }
            }
        });
    }
} 