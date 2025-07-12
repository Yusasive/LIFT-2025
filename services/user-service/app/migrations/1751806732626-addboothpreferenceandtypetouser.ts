import { MigrationInterface, QueryRunner } from "typeorm";

export class Addboothpreferenceandtypetouser1751806732626 implements MigrationInterface {
    name = 'Addboothpreferenceandtypetouser1751806732626'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "booth_preference" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "booth_type" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "booth_type"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "booth_preference"`);
    }

}
