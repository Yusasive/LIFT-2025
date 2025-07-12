import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, BeforeInsert } from "typeorm";
import { BoothItem } from "./BoothItem.entity";

// Transformer to handle decimal values as numbers
const decimalTransformer = {
    to: (value: number) => value,
    from: (value: string | number) => typeof value === "string" ? parseFloat(value) : value
};

@Entity("booth_transactions")
export class BoothTransaction {
    @PrimaryGeneratedColumn()
    id: number;


      @Column({ 
        type: "decimal", 
        precision: 10, 
        scale: 2,
        transformer: decimalTransformer
    })
    booth_amount: number;
    

    @Column({ type: "text", nullable: true, default: "" })
    remark: string;

    @Column({ type: "varchar", length: 50, default: "active" })
    booth_trans_status: string;

    @Column({ type: "varchar", length: 50, default: "pending" })
    payment_status: string;

    @Column({ type: "integer", default: 7 })
    validity_period_days: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    reservation_date: Date;

    @Column({ type: "timestamp" })
    expiration_date: Date;

    @Column({ type: "varchar", length: 50, default: "active" })
    validity_status: string;

    @Column({ type: "integer", nullable: true })
    created_by: number;

    @Column({ type: "integer", nullable: true })
    updated_by: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @Column({ type: "integer", nullable: true })
    user_id: number;

    @OneToMany(() => BoothItem, boothItem => boothItem.booth_transaction)
    booth_items: BoothItem[];

    @BeforeInsert()
    calculateExpirationDate() {
        if (!this.reservation_date) {
            this.reservation_date = new Date();
        }
        this.expiration_date = new Date(this.reservation_date.getTime() + (this.validity_period_days * 24 * 60 * 60 * 1000));
    }
}