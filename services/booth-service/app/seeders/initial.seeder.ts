import { DataSource } from 'typeorm';
import { BoothType } from '../models/entity/BoothType.entity';
import { BoothData } from '../models/entity/BoothData.entity';
import { africaHallBooths } from './africaHallBooths';
import { internationalHallBooths } from './internationalHallBooth';
import { hallABooths } from './hallABooth';
import { hallBBooths } from './hallBBooth';
import { fdaSectorBooths } from './fdaSectorBooth';
import { eeiSectorBooths } from './eeiSectorBooth';
import { rbfSectorBooths } from './rbfSectorBooth';


const boothTypes = [
    {
        name: "AFRICAHALL",
        description: "Africa Hall",
    },
    {
        name: "HALLB",
        description: "International Hall",
    },
    {
        name: "HALLA",
        description: "Hall A",
    },
    {
        name: "HALLB",
        description: "Hall B",
    },
    {
        name: "FDA",
        description: "Food, Drinks, Agriculture & Allied Products",
    },
    {
        name: "RBF",
        description: "Real Estate, Building Furniture & Fittings",
    },
    {
        name: "EEI",
        description: "ICT & Electronics Products",
    },
    {
        name: "HCT",
        description: "Household Cosmetics & Textile Products",
    },
]

export class InitialSeeder {
    constructor(private dataSource: DataSource) {}

    async run() {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Insert booth types
            for (const bt of boothTypes) {
                const boothType = await queryRunner.manager.save(BoothType, {
                    name: bt.name,
                    description: bt.description,
                });

                switch (bt.name) {
                    case "AFRICAHALL":
                        for (const booth of africaHallBooths) {
                            await queryRunner.manager.save(BoothData, {
                                booth_type: boothType,
                                booth_name: booth.booth_name,
                                coords: booth.coords,
                                status: booth.status,
                                size: booth.size,
                                category: booth.category,
                                price: booth.price,
                                sqm: booth.sqm,
                                booth_id: booth.booth_id,
                                grid_position: booth.grid_position,
                            });
                        }
                        break;
                    case "INTERNATIONAL":
                        for (const booth of internationalHallBooths) {
                            await queryRunner.manager.save(BoothData, {
                                booth_type: boothType,
                                booth_name: booth.booth_name,
                                coords: booth.coords,
                                status: booth.status,
                                size: booth.size,
                                category: booth.category,
                                price: booth.price,
                                sqm: booth.sqm,
                                booth_id: booth.booth_id,
                                grid_position: booth.grid_position,
                            });
                        }
                        break;
                    case "HALLA":
                        for (const booth of hallABooths) {
                            await queryRunner.manager.save(BoothData, {
                                booth_type: boothType,
                                booth_name: booth.booth_name,
                                coords: booth.coords,
                                status: booth.status,
                                size: booth.size,
                                category: booth.category,
                                price: booth.price,
                                sqm: booth.sqm,
                                booth_id: booth.booth_id,
                                grid_position: booth.grid_position,
                            });
                        }
                        break;
                    case "HALLB":
                        for (const booth of hallBBooths) {
                            await queryRunner.manager.save(BoothData, {
                                booth_type: boothType,
                                booth_name: booth.booth_name,
                                coords: booth.coords,
                                status: booth.status,
                                size: booth.size,
                                category: booth.category,
                                price: booth.price,
                                sqm: booth.sqm,
                                booth_id: booth.booth_id,
                                grid_position: booth.grid_position,
                            });
                        }
                        break;
                    case "FDA":
                        for (const booth of fdaSectorBooths) {
                            await queryRunner.manager.save(BoothData, {
                                booth_type: boothType,
                                booth_name: booth.booth_name,
                                coords: booth.coords,
                                status: booth.status,
                                size: booth.size,
                                category: booth.category,
                                price: booth.price,
                                sqm: booth.sqm,
                                booth_id: booth.booth_id,
                                grid_position: booth.grid_position,
                            });
                        }
                        break;
                    case "RBF":
                        for (const booth of rbfSectorBooths) {
                            await queryRunner.manager.save(BoothData, {
                                booth_type: boothType,
                                booth_name: booth.booth_name,
                                coords: booth.coords,
                                status: booth.status,
                                size: booth.size,
                                category: booth.category,
                                price: booth.price,
                                sqm: booth.sqm,
                                booth_id: booth.booth_id,
                                grid_position: booth.grid_position,
                            });
                        }
                        break;
                    case "EEI":
                        for (const booth of eeiSectorBooths) {
                            await queryRunner.manager.save(BoothData, {
                                booth_type: boothType,
                                booth_name: booth.booth_name,
                                coords: booth.coords,
                                status: booth.status,
                                size: booth.size,
                                category: booth.category,
                                price: booth.price,
                                sqm: booth.sqm,
                                booth_id: booth.booth_id,
                                grid_position: booth.grid_position,
                            });
                        }
                        break;
                }
            }

            await queryRunner.commitTransaction();
            console.log('Database seeded successfully!');
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error seeding database:', error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
} 