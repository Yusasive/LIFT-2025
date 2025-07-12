import { MigrationInterface, QueryRunner } from "typeorm";

export class Addbookbycolomn1751925235555 implements MigrationInterface {
    name = 'Addbookbycolomn1751925235555'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booth_data" ADD "booked_by" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booth_data" DROP COLUMN "booked_by"`);
    }

}
