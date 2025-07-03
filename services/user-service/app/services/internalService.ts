import { injectable, inject } from "tsyringe";
import { UserRepository } from "../repository/userRepository";

@injectable()
export class InternalService {
    constructor(@inject("UserRepository") private repository: UserRepository) {}

    async updateVerificationCode(user_id: number, code: number, expiry: Date) {
        try {
            const user = await this.repository.updateVerificationCode(user_id, code, expiry);
            return {
                success: true,
                data: {
                    message: `verification code ${code} is sent to your registered mobile number!`,
                    user_id: user.user_id
                }
            };
        } catch (error) {
            console.log(error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            };
        }
    }

    async verifyCode(email: string, code: string) {
        try {
            const user = await this.repository.findAccount(email);
            if (!user) {
                return {
                    success: false,
                    error: "user not found"
                };
            }

            if (user.verification_code !== parseInt(code)) {
                return {
                    success: false,
                    error: "invalid verification code"
                };
            }

            const currentTime = new Date();
            const diff = (new Date(user.expiry).getTime() - currentTime.getTime()) / (1000 * 60); // diff in minutes

            if (diff <= 0) {
                return {
                    success: false,
                    error: "verification code is expired"
                };
            }

            await this.repository.updateVerifyUser(user.user_id);
            return {
                success: true,
                data: {
                    message: "user verified successfully",
                    user_id: user.user_id
                }
            };
        } catch (error) {
            console.log(error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
} 