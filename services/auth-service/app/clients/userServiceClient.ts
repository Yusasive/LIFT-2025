import axios from 'axios';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3000';
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY;

interface EndpointPermission {
    method: string;
    path: string | RegExp;
    permission: string;
}

export class UserServiceClient {
    private static async callInternalEndpoint(action: string, data: any = {}) {
        try {
            const response = await axios.post(
                `${USER_SERVICE_URL}/internal`,
                { action, data },
                {
                    headers: {
                        'x-internal-service-key': INTERNAL_SERVICE_KEY
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('User service internal call error:', error);
            throw error;
        }
    }

    static async updateVerificationCode(user_id: number, code: number, expiry: Date) {
        return await this.callInternalEndpoint('updateVerificationCode', {
            user_id,
            code,
            expiry
        });
    }

    static async verifyCode(email: string, code: string) {
        return await this.callInternalEndpoint('verifyCode', {
            email,
            code
        });
    }

    static async getEndpointPermissions(): Promise<EndpointPermission[]> {
        try {
            const response = await this.callInternalEndpoint('getEndpointPermissions');
            if (!response.success) {
                throw new Error(response.error || 'Failed to get endpoint permissions');
            }
            return response.data;
        } catch (error) {
            console.error('Error getting endpoint permissions:', error);
            throw error;
        }
    }
} 