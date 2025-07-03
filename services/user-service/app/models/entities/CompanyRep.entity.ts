import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User.entity";
import { Expose } from "class-transformer";
import { IsString, IsNotEmpty, IsOptional, IsNumber } from "class-validator";

@Entity("company_reps")
export class CompanyRep {
    @PrimaryGeneratedColumn()
    @Expose()
    id!: number;

    @Column({ type: "int", nullable: false })
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    exhibitor_id!: number;

    @Column({ type: "varchar", nullable: false })
    @Expose()
    @IsString()
    @IsNotEmpty()
    company_name!: string;

    @Column({ type: "varchar", nullable: false })
    @Expose()
    @IsString()
    @IsNotEmpty()
    name!: string;

    @Column({ type: "varchar", nullable: true })
    @Expose()
    @IsOptional()
    @IsString()
    phone!: string;

    @Column({ type: "varchar", nullable: true })
    @Expose()
    @IsOptional()
    @IsString()
    email!: string;

    @Column({ type: "varchar", nullable: true })
    @Expose()
    @IsOptional()
    @IsString()
    photo!: string;

    @Column({ type: "varchar", nullable: true })
    @Expose()
    @IsOptional()
    @IsString()
    qrcode!: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    @Expose()
    created_at!: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    @Expose()
    updated_at!: Date;

    // Relationship with the parent exhibitor
    @ManyToOne(() => User, user => user.user_id, { nullable: false })
    @JoinColumn({ name: "exhibitor_id" })
    @Expose()
    exhibitor!: User;
}
