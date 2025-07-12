import { injectable, inject } from "tsyringe";
import { DataSource, Repository } from "typeorm";
import { BoothData } from "../models/entity/BoothData.entity";

@injectable()
export class BoothCleanupService {
    private boothDataRepository: Repository<BoothData>;

    constructor(@inject("DataSource") private dataSource: DataSource) {}

    private async initializeRepository() {
        if (!this.dataSource.isInitialized) {
            await this.dataSource.initialize();
        }
        this.boothDataRepository = this.dataSource.getRepository(BoothData);
    }

    async cleanupExpiredBookings(): Promise<{ updatedCount: number; error?: string }> {
        try {
            await this.initializeRepository();

            // Calculate the date 3 days ago
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

            // Find booths that have been booked for more than 3 days
            const expiredBookings = await this.boothDataRepository
                .createQueryBuilder("booth")
                .where("booth.bookdate IS NOT NULL")
                .andWhere("booth.bookdate < :threeDaysAgo", { threeDaysAgo })
                .andWhere("booth.status != :availableStatus", { availableStatus: "available" })
                .getMany();

            if (expiredBookings.length === 0) {
                console.log("No expired bookings found");
                return { updatedCount: 0 };
            }

            // Update the expired booths using bulk update
            const boothIds = expiredBookings.map(booth => booth.id);
            
            await this.boothDataRepository
                .createQueryBuilder()
                .update(BoothData)
                .set({ 
                    status: "available", 
                    bookdate: null 
                })
                .whereInIds(boothIds)
                .execute();

            console.log(`Successfully updated ${expiredBookings.length} expired booth bookings`);
            return { updatedCount: expiredBookings.length };

        } catch (error) {
            console.error("Error cleaning up expired bookings:", error);
            return { 
                updatedCount: 0, 
                error: error instanceof Error ? error.message : "Unknown error occurred" 
            };
        }
    }
} 