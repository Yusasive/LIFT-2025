import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1749096890217 implements MigrationInterface {
    name = 'InitialMigration1749096890217'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "payment" ("id" SERIAL NOT NULL, "amount" character varying NOT NULL, "currency" character varying NOT NULL, "email" character varying NOT NULL, "status" character varying NOT NULL, "reference" character varying NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "UQ_4bf2af7227a0562a1fa747298aa" UNIQUE ("reference"), CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "payment"`);
    }

}
