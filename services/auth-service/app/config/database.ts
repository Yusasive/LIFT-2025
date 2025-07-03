import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { container } from "tsyringe";
import { Permission } from "../models/entities/Permission.entity";
import { PermissionType } from "../models/entities/PermissionType.entity";
import { Role } from "../models/entities/Role.entity";
import { RolePermission } from "../models/entities/RolePermission.entity";
import * as dotenv from 'dotenv';

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
    entities: [Permission, PermissionType, Role, RolePermission],
    synchronize: false,
    logging: process.env.NODE_ENV !== "prod",
    extra: {
        max: 20,
        min: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    }
};

// Create a new datasource for each lambda invocation
let dataSource: DataSource | null = null;


// Initialize database connection
const initializeDb = async () => {
    try {
        if (!dataSource) {
            dataSource = new DataSource(dbConfig);
            await dataSource.initialize();
            // Register the DataSource with tsyringe after initialization
            container.register("DataSource", {
                useValue: dataSource
            });
            console.log('Database connection initialized');
        } else if (!dataSource.isInitialized) {
            await dataSource.initialize();
            console.log('Database connection re-initialized');
        }
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

export { dataSource, dbConfig, initializeDb }; 