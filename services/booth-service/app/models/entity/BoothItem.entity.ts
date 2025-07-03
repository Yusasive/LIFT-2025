import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { BoothTransaction } from "./BoothTransaction.entity";

@Entity("booth_items")
export class BoothItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "integer" })
    booth_transaction_id: number;

    @Column({ type: "varchar", length: 100 })
    sector: string;

    @Column({ type: "varchar", length: 50 })
    booth_num: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    booth_price: number;

    @Column({ type: "varchar", length: 100 })
    booth_type: string;

    @Column({ type: "varchar", length: 50, default: "active" })
    booth_status: string;

    // Relationships
    @ManyToOne(() => BoothTransaction, transaction => transaction.booth_items, { onDelete: "CASCADE" })
    @JoinColumn({ name: "booth_transaction_id" })
    booth_transaction: BoothTransaction;
}