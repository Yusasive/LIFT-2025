import { MigrationInterface, QueryRunner } from "typeorm";

export class Updateboothtable1750541045774 implements MigrationInterface {
    name = 'Updateboothtable1750541045774'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booth_transactions" ALTER COLUMN "created_by" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "booth_transactions" ALTER COLUMN "updated_by" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "booth_transactions" ALTER COLUMN "user_id" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booth_transactions" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "booth_transactions" ALTER COLUMN "updated_by" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "booth_transactions" ALTER COLUMN "created_by" SET NOT NULL`);
    }

}
