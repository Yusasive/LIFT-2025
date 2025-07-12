import { MigrationInterface, QueryRunner } from "typeorm";

export class Adddescriptiontoboothtype1751910631407 implements MigrationInterface {
    name = 'Adddescriptiontoboothtype1751910631407'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booth_types" ADD "description" character varying(100) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booth_types" DROP COLUMN "description"`);
    }

}
