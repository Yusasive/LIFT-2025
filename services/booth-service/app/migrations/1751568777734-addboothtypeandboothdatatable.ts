import { MigrationInterface, QueryRunner } from "typeorm";

export class Addboothtypeandboothdatatable1751568777734 implements MigrationInterface {
    name = 'Addboothtypeandboothdatatable1751568777734'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "booth_types" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, CONSTRAINT "PK_87ba4e813529b9a1a3da63c5739" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "booth_data" ("id" SERIAL NOT NULL, "booth_name" character varying(100) NOT NULL, "status" character varying(100) NOT NULL, "size" character varying(100) NOT NULL, "category" character varying(100) NOT NULL, "price" character varying(100) NOT NULL, "sqm" character varying(100) NOT NULL, "booth_id" character varying(100) NOT NULL, "grid_position" json NOT NULL, "coords" json NOT NULL, "booth_type" integer, CONSTRAINT "PK_a22b168f9e43ce27b37757194b3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "booth_data" ADD CONSTRAINT "FK_e26612892b7a1e7cbba6852224b" FOREIGN KEY ("booth_type") REFERENCES "booth_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booth_data" DROP CONSTRAINT "FK_e26612892b7a1e7cbba6852224b"`);
        await queryRunner.query(`DROP TABLE "booth_data"`);
        await queryRunner.query(`DROP TABLE "booth_types"`);
    }

}
