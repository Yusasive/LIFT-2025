import { MigrationInterface, QueryRunner } from "typeorm";

export class Makereferencenullable1750123774796 implements MigrationInterface {
    name = 'Makereferencenullable1750123774796'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "reference" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "reference" SET NOT NULL`);
    }

}
