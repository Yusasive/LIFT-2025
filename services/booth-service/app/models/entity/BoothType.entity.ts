import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("booth_types")
export class BoothType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 100 })
    name: string;

    @Column({ type: "varchar", length: 100 })
    description: string;
}