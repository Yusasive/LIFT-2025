import { DataSource } from 'typeorm';
import { BoothItem } from '../models/entity/BoothItem.entity';
import { BoothTransaction } from '../models/entity/BoothTransaction.entity';
import { BoothType } from '../models/entity/BoothType.entity';
import { BoothData } from '../models/entity/BoothData.entity';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.NODE_ENV === "prod" || process.env.NODE_ENV === "dev" ? {
        rejectUnauthorized: false
    } : false,
    entities: [BoothItem, BoothTransaction, BoothType, BoothData],
    synchronize: true, // For Production, this should be false
    logging: true,
    migrations: [__dirname + '/../migrations/*.ts'],
    subscribers: [],
});