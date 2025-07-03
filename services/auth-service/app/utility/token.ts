import jwt from "jsonwebtoken";

const APP_SERVICE_SECRET = process.env.APP_SERVICE_SECRET || "your_jwt_secret";
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'dev',
    path: '/',
    sameSite: 'none' as const,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    domain: process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'dev' ? process.env.COOKIE_DOMAIN : undefined
};

interface ServiceResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

interface TokenUserData {
    user_id: number;
    email: string;
    phone: string;
    user_type: string;
}

interface CookieConfig {
    name: string;
    value: string;
    options: typeof COOKIE_OPTIONS;
}

export async function generateToken(userData: TokenUserData, isInternalCall: boolean = false): Promise<ServiceResponse<{ token?: string; cookie?: CookieConfig }>> {
    try {
        const token = jwt.sign(
            userData,
            APP_SERVICE_SECRET,
            { expiresIn: "30d" }
        );

        if (isInternalCall) {
            return {
                success: true,
                data: { token }
            };
        }

        return {
            success: true,
            data: {
                cookie: {
                    name: 'auth_token',
                    value: token,
                    options: COOKIE_OPTIONS
                }
            }
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export async function validateToken(token: string): Promise<ServiceResponse<{ valid: boolean; payload: string | jwt.JwtPayload }>> {
    try {
        const payload = await jwt.verify(token, APP_SERVICE_SECRET);
        return {
            success: true,
            data: { valid: true, payload }
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
} 