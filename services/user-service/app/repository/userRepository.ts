import { Repository, DataSource } from "typeorm";
import { Attendee, Exhibitor, Organizer, OrganizerStaff, SuperAdmin, User } from "../models/entities/User.entity";
import { Address } from "../models/entities/Address.entity";
import { AddressModel } from "../models/AddressModel";
import { UserModel } from "../models/UserModels";
import { UserType } from "../models/UserType";
import { inject, autoInjectable } from "tsyringe";
import { AddressInput } from "../models/dto/AddressInput";
import { CompanyRep } from "../models/entities/CompanyRep.entity";

interface CreateUserInput {
    email: string;
    password: string;
    salt: string;
    phone: string;
    user_type: UserType;
    company_name?: string;
    local?: string;
}

@autoInjectable()
export class UserRepository {
    private userRepository: Repository<User>;
    private addressRepository: Repository<Address>;
    private companyRepRepository: Repository<CompanyRep>;

    constructor(@inject("DataSource") private dataSource: DataSource) {}

    private async initializeRepositories() {
        if (!this.dataSource.isInitialized) {
            await this.dataSource.initialize();
        }
        this.userRepository = this.dataSource.getRepository(User);
        this.addressRepository = this.dataSource.getRepository(Address);
        this.companyRepRepository = this.dataSource.getRepository(CompanyRep);
    }

    async createUser(input: CreateUserInput): Promise<User> {
        let user: User;
        switch (input.user_type) {
            case UserType.Exhibitor:
                user = new Exhibitor();
                break;
            case UserType.Attendee:
                user = new Attendee();
                break;
            case UserType.Organizer:
                user = new Organizer();
                break;
            case UserType.Organizer_Staff:
                user = new OrganizerStaff();
                break;
            case UserType.Super_Admin:
                user = new SuperAdmin();
                break;
            default:
                throw new Error("Invalid user type");
        }
        user.email = input.email;
        user.password = input.password;
        user.salt = input.salt;
        user.phone = input.phone;
        if (input.user_type === UserType.Exhibitor) {
            (user as Exhibitor).company = input.company_name || '';
            (user as Exhibitor).local = input.local || '';
        }


        return this.dataSource.getRepository(user.constructor).save(user);
    }

    async createAccount({ phone, email, password, salt, user_type }: UserModel): Promise<User> {
        await this.initializeRepositories();
        const user = this.userRepository.create({
            phone,
            email,
            password,
            salt,
            user_type
        });
        return await this.userRepository.save(user);
    }

    async checkUserExists(email: string): Promise<boolean> {
        await this.initializeRepositories();
        const user = await this.userRepository.findOne({ where: { email } });
        return !!user;
    }

    async findAccount(email: string, userType?: UserType): Promise<User> {
        await this.initializeRepositories();
        
        const userExists = await this.userRepository.findOne({ where: { email } });
        if (!userExists) {
            throw new Error("No account found with this email address");
        }

        if (userType != UserType.Exhibitor && userType != UserType.Attendee) {
            const user = await this.userRepository
                .createQueryBuilder("User")
                .where("User.email = :email", { email })
                .andWhere("User.user_type IN (:...staffTypes)", {
                    staffTypes: [
                        UserType.Super_Admin,
                        UserType.Admin,
                        UserType.Organizer,
                        UserType.Organizer_Staff
                    ]
                })
                .getOne();

            if (!user) {
                throw new Error("This account is not authorized for staff access");
            }
            return user;
        }

        const whereClause: any = { email };
        if (userType === 'ATTENDEE') {
            whereClause.user_type = UserType.Attendee;
        } else if (userType === 'EXHIBITOR') {
            whereClause.user_type = UserType.Exhibitor;
        }
        
        const user = await this.userRepository.findOne({ 
            where: whereClause,
            relations: ['address']
        });
        if (!user) {
            throw new Error(`This account is not registered as ${userType}`);
        }
        return user;
    }

    async updateVerifyUser(userId: number): Promise<User> {
        await this.initializeRepositories();
        const user = await this.userRepository.findOne({ 
            where: { 
                user_id: userId,
                verified: false 
            } 
        });

        if (!user) {
            throw new Error("user already verified!");
        }

        user.verified = true;
        return await this.userRepository.save(user);
    }

    async updateUser(user_id: number, updates: Partial<UserModel>): Promise<User> {
        await this.initializeRepositories();
        const user = await this.userRepository.findOne({ where: { user_id } });
        if (!user) throw new Error("User not found");

        // Update common fields
        if (updates.first_name !== undefined) user.first_name = updates.first_name;
        if (updates.last_name !== undefined) user.last_name = updates.last_name;
        if (updates.company !== undefined) {
            if (user.user_type === UserType.Exhibitor) {
                (user as Exhibitor).company = updates.company;
            }
        }
        if (updates.status !== undefined) {
            if (user.user_type === UserType.Exhibitor) {
                (user as Exhibitor).status = updates.status;
            }
        }

        // Update staff-specific fields
        if (user.user_type === UserType.Super_Admin || 
            user.user_type === UserType.Organizer || 
            user.user_type === UserType.Organizer_Staff) {
            if (updates.ticket_number !== undefined) {
                (user as SuperAdmin | Organizer | OrganizerStaff).ticket_number = updates.ticket_number;
            }
            if (updates.qr_code !== undefined) {
                (user as SuperAdmin | Organizer | OrganizerStaff).qr_code = updates.qr_code;
            }
            if (updates.download !== undefined) {
                (user as SuperAdmin | Organizer | OrganizerStaff).download = updates.download;
            }
            if (updates.staff_id !== undefined) {
                (user as SuperAdmin | Organizer | OrganizerStaff).staff_id = updates.staff_id;
            }
        }

        return await this.userRepository.save(user);
    }

    async updateUserStatus(user_id: number, is_active: boolean): Promise<User> {
        await this.initializeRepositories();
        const user = await this.userRepository.findOne({ where: { user_id } });
        if (!user) {
            throw new Error("user not found!");
        }

        user.is_active = is_active;
        return await this.userRepository.save(user);
    }

    async createProfile(
        user_id: number,
        {
          first_name,
          last_name,
          user_type,
          email,
          phone,
          company,
          address: { address_line1, address_line2, city, state, country },
        }: {
          first_name: string;
          last_name: string;
          user_type: UserType;
          email: string;
          phone: string;
          company?: string;
          address: AddressModel;
        }
      ): Promise<User> {
        await this.initializeRepositories();
      
        // Update user with available fields
        await this.updateUser(user_id, {
          first_name,
          last_name,
          user_type,
          company
        });
      
        // Create and save address
        const address = this.addressRepository.create({
          user_id,
          address_line1,
          address_line2,
          city,
          state,
          country
        });
      
        await this.addressRepository.save(address);
      
        return this.getUserProfile(user_id);
    }
      

    async getUserProfile(user_id: number): Promise<User> {
        await this.initializeRepositories();
        const user = await this.userRepository.findOne({
            where: { user_id },
            relations: ["address"]
        });

        if (!user) {
            throw new Error("user profile does not exist!");
        }

        return user;
    }

    async editProfile(
        user_id: number,
        {
          first_name,
          last_name,
          user_type
        }: {
          first_name?: string;
          last_name?: string;
          user_type?: UserType;
        }
      ): Promise<boolean> {
        await this.initializeRepositories();
      
        // Only update if at least one field is provided
        if (first_name || last_name || user_type) {
          await this.updateUser(user_id, {
            first_name,
            last_name,
            user_type
          });
        }
      
        return true;
      }
      

    async updateUserPayment({
        userId,
        paymentId,
        customerId,
    }: {
        userId: number;
        paymentId: string;
        customerId: string;
    }): Promise<User> {
        await this.initializeRepositories();
        const user = await this.userRepository.findOne({ where: { user_id: userId } });
        if (!user) {
            throw new Error("error while updating user payment!");
        }

        user.stripe_id = customerId;
        user.payment_id = paymentId;
        return await this.userRepository.save(user);
    }

    async updateVerificationCode(userId: number, code: number, expiry: Date): Promise<User> {
        await this.initializeRepositories();
        const user = await this.userRepository.findOne({ where: { user_id: userId } });
        if (!user) {
            throw new Error("user not found!");
        }

        user.verification_code = code;
        user.expiry = expiry;
        return await this.userRepository.save(user);
    }

    async getUsers(userType?: UserType): Promise<User[]> {
        await this.initializeRepositories();
      
        const queryBuilder = this.userRepository.createQueryBuilder("user")
          .leftJoinAndSelect("user.address", "address")
          .leftJoinAndSelect("user.parentExhibitor", "parentExhibitor")
          .leftJoinAndSelect("user.managedStaff", "managedStaff")
          .orderBy("user.user_id", "DESC");
      
        if (userType) {
          queryBuilder.where("user.user_type = :userType", { userType });
        }
      
        return await queryBuilder.getMany();
    }

    async deleteUser(user_id: number): Promise<User> {
        await this.initializeRepositories();
        const user = await this.userRepository.findOne({ where: { user_id } });
        if (!user) {
            throw new Error("user not found!");
        }

        return await this.userRepository.remove(user);
    }

    async findOne(where: any): Promise<User | null> {
        await this.initializeRepositories();
        return await this.userRepository.findOne({ where });
    }

    async addAddress(user_id: number, input: AddressInput): Promise<Address> {
        await this.initializeRepositories();
        const user = await this.userRepository.findOne({ where: { user_id } });

        const address = this.addressRepository.create({
            user_id,
            address_line1: input.address_line1,
            address_line2: input.address_line2,
            city: input.city,
            state: input.state,
            country: input.country
        });
        if (!user) {
            throw new Error("user not found!");
        }
        return await this.addressRepository.save(address);
    }

    async updateAddress(user_id: number, input: AddressInput): Promise<Address> {
        await this.initializeRepositories();
        const user = await this.userRepository.findOne({ where: { user_id } });
        if (!user) {
            throw new Error("user not found!");
        }
        const address = await this.addressRepository.findOne({ where: { id: input.address_id } });
        if (!address) {
            throw new Error("address not found!");
        }
        address.address_line1 = input.address_line1;
        address.address_line2 = input.address_line2 || '';
        address.city = input.city;
        address.state = input.state;
        address.country = input.country;
        address.post_code = input.post_code;
        return await this.addressRepository.save(address);
    }

    async deleteAddress(user_id: number, address_id: number): Promise<Address> {
        await this.initializeRepositories();
        const user = await this.userRepository.findOne({ where: { user_id } });
        if (!user) {
            throw new Error("user not found!");
        }
        const address = await this.addressRepository.findOne({ where: { id: address_id } });
        if (!address) {
            throw new Error("address not found!");
        }

        const userAddresses = await this.addressRepository.find({ where: { user_id } });
        
        if (userAddresses.length === 1) {
            throw new Error("Cannot delete your only address!");
        }

        if (address.is_primary) {
            const otherAddress = userAddresses.find(addr => addr.id !== address_id);
            if (otherAddress) {
                otherAddress.is_primary = true;
                await this.addressRepository.save(otherAddress);
            }
        }

        return await this.addressRepository.remove(address);
    }

    async setPrimaryAddress(user_id: number, address_id: number): Promise<Address> {
        await this.initializeRepositories();
        const user = await this.userRepository.findOne({ where: { user_id } });
        if (!user) {
            throw new Error("user not found!");
        }

        const address = await this.addressRepository.findOne({ where: { id: address_id } });
        if (!address) {
            throw new Error("address not found!");
        }

        // Find and update the current primary address
        const currentPrimary = await this.addressRepository.findOne({ 
            where: { user_id, is_primary: true }
        });
        if (currentPrimary) {
            currentPrimary.is_primary = false;
            await this.addressRepository.save(currentPrimary);
        }

        // Set new primary address
        address.is_primary = true;
        return await this.addressRepository.save(address);
    }

    async addCompanyRep(user_id: number, input: CompanyRep): Promise<CompanyRep> {
        await this.initializeRepositories();
        const user = await this.userRepository.findOne({ where: { user_id } });
        if (!user) {
            throw new Error("user not found!");
        }

        if (user.user_type !== UserType.Exhibitor) {
            throw new Error("user is not an exhibitor!");
        }

        const companyRep = this.companyRepRepository.create({
            exhibitor_id: user_id,
            company_name: input.company_name,
            name: input.name,
            phone: input.phone,
            email: input.email,
            photo: input.photo,
            qrcode: input.qrcode,
        });

        return await this.companyRepRepository.save(companyRep);
    }

    async getCompanyReps(user_id: number): Promise<CompanyRep[]> {
        await this.initializeRepositories();
        return await this.companyRepRepository.find({ where: { exhibitor_id: user_id } });
    }

    async deleteCompanyRep(id: number): Promise<CompanyRep> {
        await this.initializeRepositories();
        const companyRep = await this.companyRepRepository.findOne({ where: { id } });
        if (!companyRep) {
            throw new Error("company rep not found!");
        }
        return await this.companyRepRepository.remove(companyRep);
    }

    async updateCompanyRep(id: number, input: CompanyRep): Promise<CompanyRep> {
        await this.initializeRepositories();
        const companyRep = await this.companyRepRepository.findOne({ where: { id } });
        if (!companyRep) {
            throw new Error("company rep not found!");
        }
        companyRep.company_name = input.company_name;
        companyRep.name = input.name;
        companyRep.phone = input.phone;
        companyRep.email = input.email;
        companyRep.photo = input.photo;
        companyRep.qrcode = input.qrcode;
        return await this.companyRepRepository.save(companyRep);
    }

    async getCompanyRepById(id: number): Promise<CompanyRep | null> {
        await this.initializeRepositories();
        return await this.companyRepRepository.findOne({ where: { id } });
    }
}
