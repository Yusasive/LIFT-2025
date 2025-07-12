import "reflect-metadata";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { container } from "tsyringe";
import { BoothCleanupService } from "../services/BoothCleanupService";
import { initializeDb } from "../config/database";

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        console.log("Starting booth cleanup cron job...");
        
        // Initialize database connection
        await initializeDb();

        // Get the cleanup service
        const cleanupService = container.resolve(BoothCleanupService);

        // Execute the cleanup
        const result = await cleanupService.cleanupExpiredBookings();

        if (result.error) {
            console.error("Booth cleanup failed:", result.error);
            return {
                statusCode: 500,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    success: false,
                    message: "Booth cleanup failed",
                    error: result.error,
                    updatedCount: result.updatedCount
                })
            };
        }

        console.log(`Booth cleanup completed successfully. Updated ${result.updatedCount} booths.`);
        
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                success: true,
                message: "Booth cleanup completed successfully",
                updatedCount: result.updatedCount,
                timestamp: new Date().toISOString()
            })
        };

    } catch (error) {
        console.error("Unexpected error in booth cleanup handler:", error);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                success: false,
                message: "Unexpected error occurred",
                error: error instanceof Error ? error.message : "Unknown error"
            })
        };
    }
}; 