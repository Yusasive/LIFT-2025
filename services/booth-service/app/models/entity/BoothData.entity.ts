import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { BoothType } from "./BoothType.entity";


@Entity("booth_data")
export class BoothData {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => BoothType)
    @JoinColumn({ name: "booth_type" })
    booth_type: BoothType;

    @Column({ type: "varchar", length: 100 })
    booth_name: string;

    @Column({ type: "varchar", length: 100 })
    status: string;

    @Column({ type: "varchar", length: 100 })
    size: string;

    @Column({ type: "varchar", length: 100 })
    category: string;

    @Column({ type: "varchar", length: 100 })
    price: number;

    @Column({ type: "varchar", length: 100 })
    sqm: number;

    @Column({ type: "varchar", length: 100, nullable: true })
    booked_by: number;

    @Column({ type: "varchar", length: 100 })
    booth_id: string;

    @Column({ type: "json" })
    grid_position: object;

    @Column({ type: "json" })
    coords: number[][];

    @Column({ type: "timestamp", nullable: true })
    bookdate: Date | null;
}
