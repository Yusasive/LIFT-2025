import { APIGatewayProxyEventV2 } from "aws-lambda";
import { BoothService } from "../services/BoothService";
import { autoInjectable, inject } from "tsyringe";

@autoInjectable()
export class BoothController {
    constructor(@inject("BoothService") private boothService: BoothService) {}

    async handleBooth(event: APIGatewayProxyEventV2) {
        const httpMethod = event.requestContext.http.method;
        const path = event.requestContext.http.path;

        switch(true) {
            case httpMethod === 'POST' && path === '/booth/reserve':
                return await this.boothService.CreateBoothReservation(event);

            case httpMethod === 'PATCH' && path === '/booth/reservations':
                return await this.boothService.updatePaymentStatus(event);
            
            case httpMethod === 'GET' && path === '/booth/reservations':
                return await this.boothService.GetUserReservations(event);
            
            case httpMethod === 'GET' && path === '/booth/reserved':
                return await this.boothService.GetReservedBooths(event);
            
            case httpMethod === 'DELETE' && path.startsWith('/booth/reservations/'):
                return await this.boothService.CancelBoothReservation(event);
            
            case httpMethod === 'GET' && path === '/booth/stats':
                return await this.boothService.GetBoothStats(event);
            
            case httpMethod === 'GET' && path === '/booth/all':
                return await this.boothService.GetBooths(event);
            
            case httpMethod === 'GET' && path === '/booth/sector':
                if (event.queryStringParameters?.sector) {
                    return await this.boothService.GetBoothsBySector(event);
                } else {
                    return await this.boothService.GetBoothSectors(event);
                }
            
            default:
                return await this.boothService.ResponseWithError(event);
        }
    }
}