import { MigrationInterface, QueryRunner } from "typeorm";

export class Createcompanyreptable1750362006651 implements MigrationInterface {
    name = 'Createcompanyreptable1750362006651'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "company_reps" ("id" SERIAL NOT NULL, "exhibitor_id" integer NOT NULL, "company_name" character varying NOT NULL, "name" character varying NOT NULL, "phone" character varying, "email" character varying, "photo" character varying, "qrcode" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fb6a125292f79bcf278d6025b4e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "company_reps" ADD CONSTRAINT "FK_80d138eb5e646c65858c86b555b" FOREIGN KEY ("exhibitor_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company_reps" DROP CONSTRAINT "FK_80d138eb5e646c65858c86b555b"`);
        await queryRunner.query(`DROP TABLE "company_reps"`);
    }

}
