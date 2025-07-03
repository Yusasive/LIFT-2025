import { DataSource, DataSourceOptions } from "typeorm";
import { container } from "tsyringe";
import * as dotenv from 'dotenv';
import { BoothItem } from '../models/entity/BoothItem.entity';
import { BoothTransaction } from '../models/entity/BoothTransaction.entity';
// Load environment variables
dotenv.config();

const dbConfig: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.NODE_ENV === "prod" || process.env.NODE_ENV === "dev" ? {
        rejectUnauthorized: false
    } : false,
    entities: [BoothItem, BoothTransaction],
    synchronize: false,
    logging: process.env.NODE_ENV !== "prod"
};

// Create a new datasource for each lambda invocation
const dataSource = new DataSource(dbConfig);

// Initialize database connection
const initializeDb = async () => {
    try {
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
            console.log('Database connection initialized');
        }
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

// Register the DataSource with tsyringe
container.register("DataSource", {
    useValue: dataSource
});

export { dataSource, dbConfig, initializeDb };