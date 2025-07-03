import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User.entity";
import { Expose } from "class-transformer";

@Entity("address")
export class Address {
    @PrimaryGeneratedColumn()
    @Expose()
    id!: number;

    @Column({ type: "varchar", nullable: false })
    @Expose()
    address_line1!: string;

    @Column({ type: "varchar", nullable: true })
    @Expose()
    address_line2!: string;

    @Column({ type: "varchar", nullable: false })
    @Expose()
    city!: string;

    @Column({ type: "varchar", nullable: false })
    @Expose()
    state!: string;

    @Column({ type: "varchar", nullable: false })
    @Expose()
    country!: string;

    @Column({ type: "boolean", nullable: false, default: false })
    @Expose()
    is_primary!: boolean;

    @Column({ type: "varchar", nullable: true })
    @Expose()
    post_code!: string;

    @ManyToOne(() => User, user => user.address, { nullable: true })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ type: "int", nullable: true })
    user_id!: number;
} 