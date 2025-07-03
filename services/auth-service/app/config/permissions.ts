interface EndpointPermission {
    method: string;
    path: string | RegExp;
    permission: string;
    service: string;
}

export const endpointPermissions: EndpointPermission[] = [
    // Auth service - Role management permissions
    { method: 'POST', path: '/roles', permission: 'create:roles', service: 'auth-service' },
    { method: 'GET', path: '/roles', permission: 'read:roles', service: 'auth-service' },
    { method: 'GET', path: /^\/roles\/\d+$/, permission: 'read:roles', service: 'auth-service' },
    { method: 'PUT', path: /^\/roles\/\d+$/, permission: 'update:roles', service: 'auth-service' },
    { method: 'DELETE', path: /^\/roles\/\d+$/, permission: 'delete:roles', service: 'auth-service' },

    // Auth service - Permission management permissions
    { method: 'GET', path: '/permissions', permission: 'read:permissions', service: 'auth-service' },

    // User service - User management permissions (admin only)
    { method: 'GET', path: '/users', permission: 'read:users', service: 'user-service' },
    { method: 'PATCH', path: '/edit', permission: 'update:user', service: 'user-service' },

    // User service - Profile management (for individual users)
    { method: 'POST', path: '/profile', permission: 'create:user', service: 'user-service' },
    { method: 'GET', path: '/profile', permission: 'read:user', service: 'user-service' },
    { method: 'PUT', path: '/profile', permission: 'update:user', service: 'user-service' },
]; 