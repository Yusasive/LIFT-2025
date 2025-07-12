import { APIGatewayProxyEventV2 } from "aws-lambda";
import { SuccessResponse, ErrorResponse } from "../utility/response";
import { BoothRepository } from "../repository/BoothRepository";
import { autoInjectable, inject } from "tsyringe";
import { plainToClass } from "class-transformer";
import { AppValidationError } from "../utility/errors";
import { BoothReservationInput } from "../models/dto/BoothReservationInput";

import { 
    BoothTransactionResponse, 
    ReservedBoothsResponse,
    ReservedBoothItem,
    EnhancedReservedBoothItem,
    BoothStatsResponse
} from "../models/dto/BoothResponse";

@autoInjectable()
export class BoothService {
    constructor(@inject("BoothRepository") private boothRepository: BoothRepository) {}

    async ResponseWithError(event: APIGatewayProxyEventV2) {
        return ErrorResponse(404, "requested method is not supported!");
    }

    async CreateBoothReservation(event: APIGatewayProxyEventV2) {
        try {
            const payload = event.requestContext.authorizer?.jwt?.claims;
            if (!payload) return ErrorResponse(403, "authentication failed!");
           // console.log("User payload 2025:", JSON.stringify(payload, null, 2));
            // Check permission
            // const permissionResult = await AuthServiceClient.checkPermission(
            //     'create:booth_reservation',
            //     'user-service',
            //     payload
            // );

            // if (!permissionResult.success) {
            //     return ErrorResponse(401, "You are not authorized to create booth reservations!");
            // }

            const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
            const input = plainToClass(BoothReservationInput, body);
           // console.log("User payload 2026:", JSON.stringify(payload));
           // const validationError = await validate(input);

            // if (validationError.length > 0) {
            //     throw new AppValidationError(validationError);
            // }

            // Validate pricing
            const pricingValidation = this.validatePricing(input.booths);
            // if (!pricingValidation.isValid) {
            //     return ErrorResponse(400, `Pricing validation failed: ${pricingValidation.errors.join(', ')}`);
            // }

            // // Check booth availability
            // const availabilityCheck = await this.boothRepository.checkBoothAvailability(input.booths);
            // if (!availabilityCheck.available) {
            //     return ErrorResponse(409, `The following booths are already reserved: ${
            //         availabilityCheck.conflicts.map(c => `${c.sector}-${c.boothNum}`).join(', ')
            //     }`);
            // }

            // Create reservation
            const reservation = await this.boothRepository.createBoothReservation(
                payload.data.payload.user_id,
                input.boothAmount,
                input.booths,
                input.remark || '',
                input.validityPeriodDays || 7
            );

            const response: BoothTransactionResponse = {
                transactionId: reservation.id,
                reservationDetails: {
                    id: reservation.id,
                    remark: reservation.remark,
                    boothTransStatus: reservation.booth_trans_status,
                    paymentStatus: reservation.payment_status,
                    validityPeriodDays: reservation.validity_period_days,
                    reservationDate: reservation.reservation_date.toISOString(),
                    expirationDate: reservation.expiration_date.toISOString(),
                    validityStatus: reservation.validity_status,
                    totalAmount: pricingValidation.totalAmount,
                    boothCount: input.booths.length,
                    booths: reservation.booth_items.map(item => ({
                        id: item.id,
                        sector: item.sector,
                        boothNum: item.booth_num,
                        boothPrice: parseFloat(item.booth_price.toString()),
                        boothType: item.booth_type,
                        boothStatus: item.booth_status
                    }))
                }
            };

            return SuccessResponse(response);
        } catch (error) {
            console.log(error);
            if (error instanceof AppValidationError) {
                return ErrorResponse(400, error.validationErrors);
            }
            return ErrorResponse(500, error);
        }
    }

    async GetUserReservations(event: APIGatewayProxyEventV2) {
        try {
            const payload = event.requestContext.authorizer?.jwt?.claims;
            if (!payload) return ErrorResponse(403, "authentication failed!");
            console.log("User payload 2029:", JSON.stringify(payload, null, 2));
            // Check permission
            // const permissionResult = await AuthServiceClient.checkPermission(
            //     'read:booth_reservation',
            //     'user-service',
            //     payload
            // );

            // if (!permissionResult.success) {
            //     return ErrorResponse(401, "You are not authorized to view booth reservations!");
            // }

            const reservations = await this.boothRepository.getUserBoothReservations(payload.data.payload.user_id,);

            const transformedReservations = reservations.map(reservation => ({
                transactionId: reservation.id,
                remark: reservation.remark,
                boothTransStatus: reservation.booth_trans_status,
                paymentStatus: reservation.payment_status,
                validityPeriodDays: reservation.validity_period_days,
                reservationDate: reservation.reservation_date.toISOString(),
                expirationDate: reservation.expiration_date.toISOString(),
                validityStatus: reservation.validity_status,
                createdAt: reservation.created_at.toISOString(),
                updatedAt: reservation.updated_at.toISOString(),
                totalAmount: reservation.booth_items.reduce((sum, item) => sum + parseFloat(item.booth_price.toString()), 0),
                boothCount: reservation.booth_items.length,
                booths: reservation.booth_items.map(item => ({
                    id: item.id,
                    sector: item.sector,
                    boothNum: item.booth_num,
                    boothPrice: parseFloat(item.booth_price.toString()),
                    boothType: item.booth_type,
                    boothStatus: item.booth_status
                }))
            }));

            return SuccessResponse({
                success: true,
                data: transformedReservations
            });
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }

    async GetReservedBooths(event: APIGatewayProxyEventV2) {
        try {
            const payload = event.requestContext.authorizer?.jwt?.claims;
            if (!payload) return ErrorResponse(403, "authentication failed!");

            // Check permission
            // const permissionResult = await AuthServiceClient.checkPermission(
            //     'read:booth_reservation',
            //     'user-service',
            //     payload
            // );

            // if (!permissionResult.success) {
            //     return ErrorResponse(401, "You are not authorized to view reserved booths!");
            // }

            // Parse query parameters
            const queryParams = event.queryStringParameters || {};
            const sector = queryParams.sector;
            const boothType = queryParams.boothType;
            const paymentStatus = queryParams.paymentStatus;
            const validityStatus = queryParams.validityStatus;
            const includeExpired = queryParams.includeExpired === 'true';
            const enhanced = queryParams.enhanced === 'true';

            const reservedBooths = await this.boothRepository.getAllReservedBooths(
                sector,
                boothType,
                paymentStatus,
                validityStatus,
                includeExpired
            );

            let responseData: ReservedBoothItem[] | EnhancedReservedBoothItem[];

            if (enhanced) {
                responseData = reservedBooths.map(booth => ({
                    sector: booth.sector,
                    boothNum: booth.booth_num,
                    transactionId: booth.booth_transaction_id,
                    boothPrice: parseFloat(booth.booth_price.toString()),
                    boothType: booth.booth_type,
                    reservationDate: booth.booth_transaction.reservation_date.toISOString(),
                    expirationDate: booth.booth_transaction.expiration_date.toISOString(),
                    paymentStatus: booth.booth_transaction.payment_status,
                    validityStatus: booth.booth_transaction.validity_status
                }));
            } else {
                responseData = reservedBooths.map(booth => ({
                    sector: booth.sector,
                    boothNum: booth.booth_num,
                    transactionId: booth.booth_transaction_id
                }));
            }

            const response: ReservedBoothsResponse = {
                success: true,
                count: responseData.length,
                data: responseData
            };

            return SuccessResponse(response);
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }

    async CancelBoothReservation(event: APIGatewayProxyEventV2) {
        try {
            const payload = event.requestContext.authorizer?.jwt?.claims;
            if (!payload) return ErrorResponse(403, "authentication failed!");

            // Check permission
            // const permissionResult = await AuthServiceClient.checkPermission(
            //     'delete:booth_reservation',
            //     'user-service',
            //     payload
            // );

            // if (!permissionResult.success) {
            //     return ErrorResponse(401, "You are not authorized to cancel booth reservations!");
            // }

            // Extract transaction ID from path parameters
            const pathParts = event.rawPath.split('/');
            const transactionId = pathParts[pathParts.length - 1];

            if (!transactionId || isNaN(parseInt(transactionId))) {
                return ErrorResponse(400, "Invalid transaction ID");
            }

            await this.boothRepository.cancelBoothReservation(parseInt(transactionId), payload.user_id);

            return SuccessResponse({
                success: true,
                message: "Reservation cancelled successfully"
            });
        } catch (error) {
            console.log(error);
            if (error instanceof Error && error.message === "Reservation not found or you don't have permission to cancel it") {
                return ErrorResponse(404, error.message);
            }
            if (error instanceof Error && error.message === "Cannot cancel paid reservation") {
                return ErrorResponse(400, error.message);
            }
            return ErrorResponse(500, error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    async GetBoothStats(event: APIGatewayProxyEventV2) {
        try {
            const payload = event.requestContext.authorizer?.jwt?.claims;
            if (!payload) return ErrorResponse(403, "authentication failed!");

            // Check permission
            // const permissionResult = await AuthServiceClient.checkPermission(
            //     'read:booth_stats',
            //     'user-service',
            //     payload
            // );

            // if (!permissionResult.success) {
            //     return ErrorResponse(401, "You are not authorized to view booth statistics!");
            // }

            const stats = await this.boothRepository.getBoothStatistics();

            const response: BoothStatsResponse = {
                totalReserved: stats.totalReserved,
                bySector: stats.bySector,
                byPaymentStatus: stats.byPaymentStatus,
                byValidityStatus: stats.byValidityStatus
            };

            return SuccessResponse({
                success: true,
                data: response
            });
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }

    async GetBooths(event: APIGatewayProxyEventV2) {
        try {
            const payload = event.requestContext.authorizer?.jwt?.claims;
            if (!payload) return ErrorResponse(403, "authentication failed!");

            const booths = await this.boothRepository.getAllBooths();

            return SuccessResponse({
                success: true,
                data: booths
            });
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }

    async GetBoothsBySector(event: APIGatewayProxyEventV2) {
        try {
            const payload = event.requestContext.authorizer?.jwt?.claims;
            if (!payload) return ErrorResponse(403, "authentication failed!");

            const sector = event.queryStringParameters?.sector;
            if (!sector) return ErrorResponse(400, "Sector is required");
            
            const booths = await this.boothRepository.getBoothsBySector(sector);

            return SuccessResponse({
                success: true,
                data: booths
            });
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }

    async GetBoothSectors(event: APIGatewayProxyEventV2) {
        try {
            const payload = event.requestContext.authorizer?.jwt?.claims;
            if (!payload) return ErrorResponse(403, "authentication failed!");

            const boothTypes = await this.boothRepository.getAllBoothTypes();

            return SuccessResponse({
                success: true,
                data: boothTypes
            });
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }

    private validatePricing(booths: any[]): {
        isValid: boolean;
        totalAmount: number;
        errors: string[];
    } {
        const errors: string[] = [];
        let totalAmount = 0;

        for (const booth of booths) {
            // Validate minimum price
            if (booth.boothPrice < 100) {
                errors.push(`Booth ${booth.sector}-${booth.boothNum}: Price too low (minimum $100)`);
            }
            
            // Validate maximum price
            if (booth.boothPrice > 10000) {
                errors.push(`Booth ${booth.sector}-${booth.boothNum}: Price too high (maximum $10,000)`);
            }

            totalAmount += booth.boothPrice;
        }

        return {
            isValid: errors.length === 0,
            totalAmount,
            errors
        };
    }
  async  updatePaymentStatus(event: APIGatewayProxyEventV2) {
        try {
            const payload = event.requestContext.authorizer?.jwt?.claims;
            if (!payload) return ErrorResponse(403, "authentication failed!");

            // Check permission
            // const permissionResult = await AuthServiceClient.checkPermission(
            //     'update:booth_payment_status',
            //     'user-service',
            //     payload
            // );

            // if (!permissionResult.success) {
            //     return ErrorResponse(401, "You are not authorized to update payment status!");
            // }

            const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
            const { transactionId, status } = body;

            if (!transactionId || !status) {
                return ErrorResponse(400, "Transaction ID and status are required");
            }

            const updatedStatus = await this.boothRepository.updateBoothsStatus(transactionId, status);

            return SuccessResponse({
                success: true,
                data: updatedStatus
            });
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }   
    }

}