import { Expose } from "class-transformer";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("payment")
export class Payment {
    @PrimaryGeneratedColumn()
    @Expose()
    id!: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    @Expose()
    amount!: number;

    @Column({ type: "varchar", nullable: false })
    @Expose()
    currency!: string;

    @Column({ type: "varchar", nullable: true })
    @Expose()
    email!: string;

    @Column({ type: "varchar", nullable: true })
    @Expose()
    payStackstatus!: string;

    @Column({ type: "varchar", nullable: true })
    @Expose()
    paymentMethod!: string;

    @Column({ type: "varchar", nullable: true })
    @Expose()
    transactionId!: number;

    @Column({ type: "varchar", nullable: true })
    @Expose()
    transactionStatus!: string;

    @Column({ type: "varchar", nullable: true, unique: true })
    @Expose()
    reference!: string;

 

    @Column({ type: "int", nullable: false })
    @Expose()
    user_id!: number;
} 