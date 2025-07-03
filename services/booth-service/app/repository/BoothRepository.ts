import { Repository, DataSource, QueryRunner } from "typeorm";
import { BoothTransaction } from "../models/entity/BoothTransaction.entity";
import { BoothItem } from "../models/entity/BoothItem.entity";
import { BoothItemInput } from "../models/dto/BoothItemInput";
import { injectable, inject } from "tsyringe";
import { PaymentServiceClient } from "../clients/paymentServiceClient";
import { Currency } from "../models/dto/CreatePaymentInput";

@injectable()
export class BoothRepository {
    private boothTransactionRepository: Repository<BoothTransaction>;
    private boothItemRepository: Repository<BoothItem>;

    constructor(@inject("DataSource") private dataSource: DataSource) {}

    private async initializeRepositories() {
        if (!this.dataSource.isInitialized) {
            await this.dataSource.initialize();
        }
        this.boothTransactionRepository = this.dataSource.getRepository(BoothTransaction);
        this.boothItemRepository = this.dataSource.getRepository(BoothItem);
    }

    async checkBoothAvailability(booths: BoothItemInput[]): Promise<{
        available: boolean;
        conflicts: Array<{ sector: string; boothNum: string }>;
    }> {
        await this.initializeRepositories();
        
        try {
            const conflicts: Array<{ sector: string; boothNum: string }> = [];
            
            for (const booth of booths) {
                const existingBooth = await this.boothItemRepository
                    .createQueryBuilder("bi")
                    .innerJoin("bi.booth_transaction", "bt")
                    .where("bi.sector = :sector", { sector: booth.sector })
                    .andWhere("bi.booth_num = :boothNum", { boothNum: booth.boothNum })
                    .andWhere("bt.validity_status = :validityStatus", { validityStatus: "active" })
                    .andWhere("bt.expiration_date > NOW()")
                    .andWhere("bt.payment_status != :paymentStatus", { paymentStatus: "failed" })
                    .andWhere("bi.booth_status = :boothStatus", { boothStatus: "active" })
                    .getOne();

                if (existingBooth) {
                    conflicts.push({
                        sector: booth.sector,
                        boothNum: booth.boothNum
                    });
                }
            }

            return {
                available: conflicts.length === 0,
                conflicts
            };
        } catch (error) {
            console.error('Error checking booth availability:', error);
            throw new Error('Failed to check booth availability');
        }
    }

    async createBoothReservation(
        userId: number,
        amount: number,
        booths: BoothItemInput[],
        remark: string = '',
        validityPeriodDays: number = 7
    ): Promise<BoothTransaction> {
        await this.initializeRepositories();

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Create booth transaction with explicit field assignments
            const boothTransaction = new BoothTransaction();
            boothTransaction.remark = remark;
            boothTransaction.booth_amount = amount;
            boothTransaction.booth_trans_status = "active";
            boothTransaction.payment_status = "pending";
            boothTransaction.validity_period_days = validityPeriodDays;
            boothTransaction.validity_status = "active";
            boothTransaction.created_by = userId; // Explicitly set this
            boothTransaction.updated_by = userId; // Explicitly set this
            boothTransaction.user_id = userId; // Set the user_id field as well
            

            // Explicitly set reservation_date to trigger the BeforeInsert hook
            boothTransaction.reservation_date = new Date();

            const savedTransaction = await queryRunner.manager.save(BoothTransaction, boothTransaction);

            // Create booth items
            const boothItems: BoothItem[] = [];
            const totalAmount = booths.reduce((acc, booth) => acc + booth.boothPrice, 0);
            for (const boothInput of booths) {
                const boothItem = new BoothItem();
                boothItem.booth_transaction_id = savedTransaction.id;
                boothItem.sector = boothInput.sector;
                boothItem.booth_num = boothInput.boothNum;
                boothItem.booth_price = boothInput.boothPrice;
                boothItem.booth_type = boothInput.boothType;
                boothItem.booth_status = "active";

                boothItems.push(boothItem);
            }

            await queryRunner.manager.save(BoothItem, boothItems);

            await queryRunner.commitTransaction();

            console.log('totalAmount', totalAmount);
            console.log('userId', userId);
            console.log('savedTransaction.id', savedTransaction.id);
            console.log('Currency', Currency.NGN);

            //TODO: Create a Payment with the booth transaction id
            const payment = await PaymentServiceClient.createPayment({
                amount: Number(totalAmount),
                currency: Currency.NGN,
                user_id: userId,
                transaction_id: savedTransaction.id,
                transactionStatus: "pending"
            });

            //TODO: Send Invoice to the user

            // Return with relations loaded
            return await this.getBoothTransactionById(savedTransaction.id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error creating booth reservation:', error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getBoothTransactionById(transactionId: number): Promise<BoothTransaction> {
        await this.initializeRepositories();

        const transaction = await this.boothTransactionRepository.findOne({
            where: { id: transactionId },
            relations: ["booth_items"]
        });

        if (!transaction) {
            throw new Error("Booth transaction not found");
        }

        return transaction;
    }

    async getUserBoothReservations(userId: number): Promise<BoothTransaction[]> {
        await this.initializeRepositories();

        return await this.boothTransactionRepository.find({
            where: { created_by: userId },
            relations: ["booth_items"],
            order: { created_at: "DESC" }
        });
    }

    async getAllReservedBooths(
        sector?: string,
        boothType?: string,
        paymentStatus?: string,
        validityStatus?: string,
        includeExpired: boolean = false
    ): Promise<BoothItem[]> {
        await this.initializeRepositories();

        let query = this.boothItemRepository
            .createQueryBuilder("bi")
            .innerJoinAndSelect("bi.booth_transaction", "bt")
            .where("bt.booth_trans_status = :boothTransStatus", { boothTransStatus: "active" })
            .andWhere("bi.booth_status = :boothStatus", { boothStatus: "active" });

        if (!includeExpired) {
            query = query
                .andWhere("bt.validity_status = :validityStatus", { validityStatus: "active" })
                .andWhere("bt.expiration_date > NOW()");
        }

        if (sector) {
            query = query.andWhere("bi.sector = :sector", { sector });
        }

        if (boothType) {
            query = query.andWhere("bi.booth_type = :boothType", { boothType });
        }

        if (paymentStatus) {
            query = query.andWhere("bt.payment_status = :paymentStatus", { paymentStatus });
        }

        if (validityStatus) {
            query = query.andWhere("bt.validity_status = :validityStatus", { validityStatus });
        }

        return await query
            .orderBy("bt.reservation_date", "DESC")
            .addOrderBy("bi.sector", "ASC")
            .addOrderBy("bi.booth_num", "ASC")
            .getMany();
    }

    async cancelBoothReservation(transactionId: number, userId: number): Promise<boolean> {
        await this.initializeRepositories();

        const transaction = await this.boothTransactionRepository.findOne({
            where: { 
                id: transactionId, 
                created_by: userId 
            }
        });

        if (!transaction) {
            throw new Error("Reservation not found or you don't have permission to cancel it");
        }

        if (transaction.payment_status === 'paid') {
            throw new Error("Cannot cancel paid reservation");
        }

        transaction.validity_status = 'expired';
        transaction.booth_trans_status = 'inactive';
        transaction.updated_by = userId;

        await this.boothTransactionRepository.save(transaction);
        return true;
    }

    async getBoothStatistics(): Promise<{
        totalReserved: number;
        bySector: Array<{ sector: string; count: number }>;
        byPaymentStatus: Array<{ paymentStatus: string; count: number }>;
        byValidityStatus: Array<{ validityStatus: string; count: number }>;
    }> {
        await this.initializeRepositories();

        // Total reserved booths
        const totalReserved = await this.boothItemRepository
            .createQueryBuilder("bi")
            .innerJoin("bi.booth_transaction", "bt")
            .where("bt.booth_trans_status = :status", { status: "active" })
            .andWhere("bi.booth_status = :status", { status: "active" })
            .getCount();

        // By sector
        const bySectorRaw = await this.boothItemRepository
            .createQueryBuilder("bi")
            .innerJoin("bi.booth_transaction", "bt")
            .select("bi.sector", "sector")
            .addSelect("COUNT(bi.id)", "count")
            .where("bt.booth_trans_status = :status", { status: "active" })
            .andWhere("bi.booth_status = :status", { status: "active" })
            .groupBy("bi.sector")
            .orderBy("count", "DESC")
            .getRawMany();

        // By payment status
        const byPaymentStatusRaw = await this.boothItemRepository
            .createQueryBuilder("bi")
            .innerJoin("bi.booth_transaction", "bt")
            .select("bt.payment_status", "paymentStatus")
            .addSelect("COUNT(bi.id)", "count")
            .where("bt.booth_trans_status = :status", { status: "active" })
            .andWhere("bi.booth_status = :status", { status: "active" })
            .groupBy("bt.payment_status")
            .orderBy("count", "DESC")
            .getRawMany();

        // By validity status
        const byValidityStatusRaw = await this.boothItemRepository
            .createQueryBuilder("bi")
            .innerJoin("bi.booth_transaction", "bt")
            .select("bt.validity_status", "validityStatus")
            .addSelect("COUNT(bi.id)", "count")
            .where("bt.booth_trans_status = :status", { status: "active" })
            .andWhere("bi.booth_status = :status", { status: "active" })
            .groupBy("bt.validity_status")
            .orderBy("count", "DESC")
            .getRawMany();

        return {
            totalReserved,
            bySector: bySectorRaw.map(item => ({
                sector: item.sector,
                count: parseInt(item.count)
            })),
            byPaymentStatus: byPaymentStatusRaw.map(item => ({
                paymentStatus: item.paymentStatus,
                count: parseInt(item.count)
            })),
            byValidityStatus: byValidityStatusRaw.map(item => ({
                validityStatus: item.validityStatus,
                count: parseInt(item.count)
            }))
        };
    }

    async updateBoothTransactionStatus(
        transactionId: number,
        status: string,
        paymentStatus?: string,
        updatedBy?: number
    ): Promise<BoothTransaction> {
        await this.initializeRepositories();

        const transaction = await this.boothTransactionRepository.findOne({
            where: { id: transactionId }
        });

        if (!transaction) {
            throw new Error("Transaction not found");
        }

        transaction.booth_trans_status = status;
        if (paymentStatus) {
            transaction.payment_status = paymentStatus;
        }
        if (updatedBy) {
            transaction.updated_by = updatedBy;
        }

        return await this.boothTransactionRepository.save(transaction);
    }
}