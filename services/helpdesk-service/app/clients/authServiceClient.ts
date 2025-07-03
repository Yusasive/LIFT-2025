import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4000';
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY;


export class AuthServiceClient {
    private static async callInternalEndpoint(action: string, data: any, additionalHeaders: Record<string, string> = {}) {
        try {
            const response = await axios.post(`${AUTH_SERVICE_URL}/internal`, {
                action,
                data
            }, {
                headers: {
                    'x-internal-service-key': INTERNAL_SERVICE_KEY,
                    'x-service-name': 'helpdesk-service',
                    'x-internal-call': 'true',
                    ...additionalHeaders
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error calling internal endpoint ${action}:`, error);
            throw error;
        }
    }

    static async verifyToken(token: string) {
        try {
            const response = await this.callInternalEndpoint('verifyToken', { token });
            if (!response.success) {
                return null;
            }
            return response.data.payload;
        } catch (error) {
            console.error('Token verification error:', error);
            return null;
        }
    }

    static async checkPermission(permission: string, service: string = 'user', payload: any): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await this.callInternalEndpoint('checkPermission', { permission, payload });
            return response;
        } catch (error) {
            console.error('Permission check error:', error);
            return { success: false };
        }
    }
}


