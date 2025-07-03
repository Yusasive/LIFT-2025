import 'reflect-metadata';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Increase timeout for all tests
jest.setTimeout(30000); 