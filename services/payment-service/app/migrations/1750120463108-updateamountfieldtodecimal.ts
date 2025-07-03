import { MigrationInterface, QueryRunner } from "typeorm";

export class Updateamountfieldtodecimal1750120463108 implements MigrationInterface {
    name = 'Updateamountfieldtodecimal1750120463108'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "amount" numeric(10,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "amount" character varying NOT NULL`);
    }

}
