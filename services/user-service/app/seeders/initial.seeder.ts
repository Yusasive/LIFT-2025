import { DataSource } from 'typeorm';
import { User } from '../models/entities/User.entity';
import { UserType } from '../models/UserType';
import * as bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);
const adminUser = {
    email: "admin@example.com",
    password: bcrypt.hashSync("adminpassword", salt),
    salt: salt,
    phone: "1234567890",
    user_type: UserType.Super_Admin,
    first_name: "Super",
    last_name: "Admin"
}

export class InitialSeeder {
    constructor(private dataSource: DataSource) {}

    async run() {
        const queryRunner = this.dataSource.createQueryRunner();
        
        try {
            await queryRunner.connect();
            
            await queryRunner.startTransaction();

            const userRepository = queryRunner.manager.getRepository(User);
            
            const user = await userRepository.create(adminUser);
            
            await userRepository.save(user);

            await queryRunner.commitTransaction();
            
        } catch (error) {   
            console.error('Error in seeder:', error);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
} 