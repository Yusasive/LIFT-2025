import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { FAQ } from "../models/entities/FAQ.entity";
import { HeroSection } from "../models/entities/HeroSection.entity";
import { MediaLibrary } from "../models/entities/MediaLibrary.entity";
import { Survey } from "../models/entities/Survey.entity";
import { SurveyQuestion } from "../models/entities/SurveyQuestion.entity";
import { SurveyResponse } from "../models/entities/SurveyResponse.entity";
import { ContentSection } from "../models/entities/ContentSection.entity";
import { ChatSession } from "../models/entities/ChatSession.entity";
import { ChatMessage } from "../models/entities/ChatMessage.entity";
import { SiteSetting } from "../models/entities/SiteSetting.entity";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const dbConfig: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5433"),
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "litf-db",
    ssl: process.env.NODE_ENV === "prod" || process.env.NODE_ENV === "dev" ? {
        rejectUnauthorized: false
    } : false,
    entities: [
        FAQ,
        HeroSection,
        MediaLibrary,
        Survey,
        SurveyQuestion,
        SurveyResponse,
        ContentSection,
        ChatSession,
        ChatMessage,
        SiteSetting
    ],
    synchronize: false, // We use migrations instead
    logging: process.env.NODE_ENV !== "prod"
};

// Create a singleton DataSource
let dataSource: DataSource | null = null;

export const getDataSource = async (): Promise<DataSource> => {
    if (!dataSource) {
        dataSource = new DataSource(dbConfig);
        await dataSource.initialize();
        console.log('Database connection initialized with CMS entities');
    }
    return dataSource;
};

export { dbConfig };