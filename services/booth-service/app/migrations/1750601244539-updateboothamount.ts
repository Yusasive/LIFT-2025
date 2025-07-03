import { MigrationInterface, QueryRunner } from "typeorm";

export class Updateboothamount1750601244539 implements MigrationInterface {
    name = 'Updateboothamount1750601244539'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booth_transactions" ADD "booth_amount" numeric(10,2) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booth_transactions" DROP COLUMN "booth_amount"`);
    }

}
