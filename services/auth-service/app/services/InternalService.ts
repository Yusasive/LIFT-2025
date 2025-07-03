import { injectable, inject } from "tsyringe";
import { RoleRepository } from "../repository/roleRepository";
import { PermissionService } from "./PermissionService";

@injectable()
export class InternalService {
    constructor(
        @inject("RoleRepository") private roleRepository: RoleRepository,
        private permissionService: PermissionService
    ) {}

    async getRoleByName(name: string) {
        const role = await this.roleRepository.findByName(name);
        return {
            success: true,
            data: role ? { id: role.id } : null
        };
    }

    async checkPermission(roleId: number, permission: string, service: string): Promise<boolean> {
        try {
            const role = await this.roleRepository.findById(roleId);
            if (!role) {
                return false;
            }

            // Check if the role has the required permission
            const hasPermission = role.rolePermissions?.some(
                rp => rp.permission.name === permission
            );

            return !!hasPermission;
        } catch (error) {
            console.error('Error checking permission:', error);
            return false;
        }
    }
} 