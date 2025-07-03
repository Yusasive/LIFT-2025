import { MigrationInterface, QueryRunner } from "typeorm";

export class Makeemailnullable1750123612445 implements MigrationInterface {
    name = 'Makeemailnullable1750123612445'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "email" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "email" SET NOT NULL`);
    }

}
