import { MigrationInterface, QueryRunner } from "typeorm";

export class Updatepaymentwithtransactionidandstatus1750119402801 implements MigrationInterface {
    name = 'Updatepaymentwithtransactionidandstatus1750119402801'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "payStackstatus" character varying`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "paymentMethod" character varying`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "transactionId" character varying`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "transactionStatus" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "transactionStatus"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "transactionId"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "paymentMethod"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "payStackstatus"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "status" character varying NOT NULL`);
    }

}
