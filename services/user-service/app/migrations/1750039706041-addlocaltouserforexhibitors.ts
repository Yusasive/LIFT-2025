import { MigrationInterface, QueryRunner } from "typeorm";

export class Addlocaltouserforexhibitors1750039706041 implements MigrationInterface {
    name = 'Addlocaltouserforexhibitors1750039706041'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "local" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "local"`);
    }

}
