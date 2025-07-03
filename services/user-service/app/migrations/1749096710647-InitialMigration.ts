import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1749096710647 implements MigrationInterface {
    name = 'InitialMigration1749096710647'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "address" ("id" SERIAL NOT NULL, "address_line1" character varying NOT NULL, "address_line2" character varying, "city" character varying NOT NULL, "state" character varying NOT NULL, "country" character varying NOT NULL, "user_id" integer, CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("user_id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "salt" character varying NOT NULL, "phone" character varying NOT NULL, "first_name" character varying, "last_name" character varying, "user_type" character varying NOT NULL, "verified" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, "profile_pic" character varying, "verification_code" integer, "expiry" TIMESTAMP, "gender" character varying, "stripe_id" character varying, "payment_id" character varying, "parent_exhibitor_id" integer, "company" character varying, "rating" character varying, "status" character varying, "pin_code" character varying, "lat" double precision, "lng" double precision, "ticket_number" character varying, "qr_code" character varying, "download" character varying, "staff_id" character varying, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c6778957fcf0cd97c7e27f080e" ON "users" ("user_type") `);
        await queryRunner.query(`ALTER TABLE "address" ADD CONSTRAINT "FK_35cd6c3fafec0bb5d072e24ea20" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_59ce9cdf904e68e577075673d92" FOREIGN KEY ("parent_exhibitor_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_59ce9cdf904e68e577075673d92"`);
        await queryRunner.query(`ALTER TABLE "address" DROP CONSTRAINT "FK_35cd6c3fafec0bb5d072e24ea20"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c6778957fcf0cd97c7e27f080e"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "address"`);
    }

}
