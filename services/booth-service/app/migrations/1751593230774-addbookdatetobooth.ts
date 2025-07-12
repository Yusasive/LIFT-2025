import { MigrationInterface, QueryRunner } from "typeorm";

export class Addbookdatetobooth1751593230774 implements MigrationInterface {
    name = 'Addbookdatetobooth1751593230774'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booth_data" ADD "bookdate" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booth_data" DROP COLUMN "bookdate"`);
    }

}
