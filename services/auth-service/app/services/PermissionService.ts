import { autoInjectable } from "tsyringe";
import { endpointPermissions } from "../config/permissions";

@autoInjectable()
export class PermissionService {
    private serviceEndpointPermissions: Map<string, typeof endpointPermissions> = new Map();

    constructor() {
        this.initializeEndpointPermissions();
    }

    private initializeEndpointPermissions() {
        try {
            // Group permissions by service
            const userPermissions = endpointPermissions.filter(ep => ep.service === 'user-service');
            const authPermissions = endpointPermissions.filter(ep => ep.service === 'auth-service');

            this.serviceEndpointPermissions.set('user-service', userPermissions);
            this.serviceEndpointPermissions.set('auth-service', authPermissions);
        } catch (error) {
            console.error('Error initializing endpoint permissions:', error);
        }
    }

    async getRequiredPermission(service: string, method: string, path: string): Promise<string | undefined> {
        const servicePermissions = this.serviceEndpointPermissions.get(service);
        if (!servicePermissions) {
            return undefined;
        }

        const endpoint = servicePermissions.find(ep => 
            ep.method === method && 
            (typeof ep.path === 'string' ? ep.path === path : ep.path.test(path))
        );

        return endpoint?.permission;
    }

    refreshPermissions() {
        this.initializeEndpointPermissions();
    }
} 