import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostalCodeToAddressTable1749811771259 implements MigrationInterface {
    name = 'AddPostalCodeToAddressTable1749811771259'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "address" ADD "post_code" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "post_code"`);
    }

}
