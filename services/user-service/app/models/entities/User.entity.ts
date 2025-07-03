import { Entity, PrimaryGeneratedColumn, Column, OneToMany, TableInheritance, ChildEntity, JoinColumn, ManyToOne } from "typeorm";
import { Address } from "./Address.entity";
import { UserType } from "../UserType";
import { Exclude, Expose } from "class-transformer";

@Entity("users")
@TableInheritance({ column: { type: "varchar", name: "user_type" } })
export class User {
    @PrimaryGeneratedColumn()
    @Expose()
    user_id!: number;

    @Column({ type: "varchar", unique: true })
    @Expose()
    email!: string;

    @Column({ type: "varchar" })
    @Exclude()
    password!: string;

    @Column({ type: "varchar" })
    @Exclude()
    salt!: string;

    @Column({ type: "varchar" })
    @Expose()
    phone!: string;

    @Column({ type: "varchar", nullable: true })
    @Expose()
    first_name!: string;

    @Column({ type: "varchar", nullable: true })
    @Expose()
    last_name!: string;

    @Column({ 
        type: "varchar", 
        enum: UserType
    })
    @Expose()
    user_type!: UserType;

    @Column({ type: "boolean", default: false })
    @Expose()
    verified!: boolean;

    @Column({ type: "boolean", default: true })
    @Expose()
    is_active!: boolean;

    @Column({ type: "varchar", nullable: true })
    @Expose()
    profile_pic!: string;

    @Column({ type: "int", nullable: true })
    verification_code!: number;

    @Column({ type: "timestamp", nullable: true })
    expiry!: Date;

    @Column({ type: "varchar", nullable: true })
    gender!: string;

    @Column({ type: "varchar", nullable: true })
    stripe_id!: string;

    @Column({ type: "varchar", nullable: true })
    payment_id!: string;

    @Column({ type: "int", nullable: true })
    parent_exhibitor_id?: number;

    @OneToMany(() => Address, address => address.user, { nullable: true })
    @Expose()
    address!: Address[];

    // Parent Exhibitor
    @ManyToOne(() => User, user => user.managedStaff, { nullable: true })
    @JoinColumn({ name: "parent_exhibitor_id" })
    @Expose()
    parentExhibitor?: User;

    // Staff managed by Exhibitor
    @OneToMany(() => User, user => user.parentExhibitor, { nullable: true })
    @Expose()
    managedStaff?: User[];
}

@ChildEntity(UserType.Attendee)
export class Attendee extends User {
}

@ChildEntity(UserType.Exhibitor)
export class Exhibitor extends User {
    @Column({ type: "varchar", nullable: true })
    @Expose()
    company!: string;

    @Column({ type: "varchar", nullable: true })
    @Expose()
    local!: string;

    @Column({ type: "varchar", nullable: true })
    @Expose()
    rating!: number;

    @Column({ type: "varchar", nullable: true })
    @Expose()
    status!: string;

    @Column({ type: "varchar", nullable: true })
    pin_code!: string;

    @Column({ type: "float", nullable: true })
    @Expose()
    lat!: number;

    @Column({ type: "float", nullable: true })
    @Expose()
    lng!: number;
}

@ChildEntity(UserType.Super_Admin)
export class SuperAdmin extends User {
    @Column({ type: "varchar", nullable: true })
    ticket_number!: string;

    @Column({ type: "varchar", nullable: true })
    qr_code!: string;

    @Column({ type: "varchar", nullable: true })
    download!: string;

    @Column({ type: "varchar", nullable: true })
    staff_id!: string;
}

@ChildEntity(UserType.Organizer)
export class Organizer extends User {
    @Column({ type: "varchar", nullable: true })
    ticket_number!: string;

    @Column({ type: "varchar", nullable: true })
    qr_code!: string;

    @Column({ type: "varchar", nullable: true })
    download!: string;

    @Column({ type: "varchar", nullable: true })
    staff_id!: string;
}

@ChildEntity(UserType.Organizer_Staff)
export class OrganizerStaff extends User {
    @Column({ type: "varchar", nullable: true })
    ticket_number!: string;

    @Column({ type: "varchar", nullable: true })
    qr_code!: string;

    @Column({ type: "varchar", nullable: true })
    download!: string;

    @Column({ type: "varchar", nullable: true })
    staff_id!: string;
}