import { DataSource } from 'typeorm';
import { InitialSeeder } from './initial.seeder';
import { dbConfig } from '../config/database';

async function runSeeders() {
    const dataSource = new DataSource(dbConfig);
    
    try {
        await dataSource.initialize();
        console.log('Connected to database.');

        const initialSeeder = new InitialSeeder(dataSource);
        await initialSeeder.run();

        console.log('All seeders completed successfully!');
    } catch (error) {
        console.error('Error running seeders:', error);
        throw error;
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}

runSeeders().catch(error => {
    console.error('Seeding failed:', error);
    process.exit(1);
}); 