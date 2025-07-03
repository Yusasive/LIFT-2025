import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsprimaryColumnToAddressTable1749808684018 implements MigrationInterface {
    name = 'AddIsprimaryColumnToAddressTable1749808684018'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "address" ADD "is_primary" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "is_primary"`);
    }

}
