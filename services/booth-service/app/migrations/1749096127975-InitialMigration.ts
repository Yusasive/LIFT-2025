import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1749096127975 implements MigrationInterface {
    name = 'InitialMigration1749096127975'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "booth_transactions" ("id" SERIAL NOT NULL, "remark" text DEFAULT '', "booth_trans_status" character varying(50) NOT NULL DEFAULT 'active', "payment_status" character varying(50) NOT NULL DEFAULT 'pending', "validity_period_days" integer NOT NULL DEFAULT '7', "reservation_date" TIMESTAMP NOT NULL DEFAULT now(), "expiration_date" TIMESTAMP NOT NULL, "validity_status" character varying(50) NOT NULL DEFAULT 'active', "created_by" integer NOT NULL, "updated_by" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, CONSTRAINT "PK_1bbccbadf1a609efd8178ce1c17" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "booth_items" ("id" SERIAL NOT NULL, "booth_transaction_id" integer NOT NULL, "sector" character varying(100) NOT NULL, "booth_num" character varying(50) NOT NULL, "booth_price" numeric(10,2) NOT NULL, "booth_type" character varying(100) NOT NULL, "booth_status" character varying(50) NOT NULL DEFAULT 'active', CONSTRAINT "PK_b5121e6d7b40928840412581fab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "booth_items" ADD CONSTRAINT "FK_e1872d40b22cda50caf52827544" FOREIGN KEY ("booth_transaction_id") REFERENCES "booth_transactions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booth_items" DROP CONSTRAINT "FK_e1872d40b22cda50caf52827544"`);
        await queryRunner.query(`DROP TABLE "booth_items"`);
        await queryRunner.query(`DROP TABLE "booth_transactions"`);
    }

}
