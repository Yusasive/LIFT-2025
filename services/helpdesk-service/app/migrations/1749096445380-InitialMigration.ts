import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1749096445380 implements MigrationInterface {
    name = 'InitialMigration1749096445380'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "faqs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question" text NOT NULL, "answer" text NOT NULL, "category" character varying(100), "category_id" uuid, "keywords" jsonb NOT NULL DEFAULT '[]', "is_published" boolean NOT NULL DEFAULT false, "display_order" integer NOT NULL DEFAULT '0', "helpful_count" integer NOT NULL DEFAULT '0', "view_count" integer NOT NULL DEFAULT '0', "created_by" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2ddf4f2c910f8e8fa2663a67bf0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "user_type" character varying NOT NULL, "user_email" character varying, "topic" character varying, "status" character varying NOT NULL DEFAULT 'active', "assigned_to" character varying, "priority" character varying NOT NULL DEFAULT 'normal', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_efc151a4aafa9a28b73dedc485f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "session_id" uuid NOT NULL, "sender_id" character varying NOT NULL, "sender_type" character varying NOT NULL, "message" text NOT NULL, "message_type" character varying NOT NULL DEFAULT 'text', "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_40c55ee0e571e268b0d3cd37d10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "content_sections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "section_name" character varying NOT NULL, "section_type" character varying NOT NULL, "title" character varying, "content" text, "media_urls" jsonb, "settings" jsonb, "page_location" character varying, "display_order" integer NOT NULL DEFAULT '1', "is_active" boolean NOT NULL DEFAULT true, "created_by" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_49043253b3061793ad132998b1c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "hero_sections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "subtitle" character varying, "description" text, "background_image" character varying, "cta_text" character varying, "cta_link" character varying, "is_active" boolean NOT NULL DEFAULT true, "display_order" integer NOT NULL DEFAULT '1', "created_by" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_452d119271f3b1d7701c4da9c56" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "media_library" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "file_name" character varying NOT NULL, "original_name" character varying NOT NULL, "file_path" character varying NOT NULL, "file_type" character varying NOT NULL, "file_size" integer, "alt_text" character varying, "caption" text, "tags" character varying, "uploaded_by" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9c023f8b633f4c4d6ea61bc4950" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "site_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "setting_key" character varying NOT NULL, "setting_value" text, "setting_type" character varying NOT NULL DEFAULT 'text', "description" text, "category" character varying, "updated_by" character varying, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1934695e327dbd254a6d0319947" UNIQUE ("setting_key"), CONSTRAINT "PK_e4290e8371a166d7e066d131f6e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "survey_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "survey_id" uuid NOT NULL, "question_text" text NOT NULL, "question_type" character varying NOT NULL, "options" jsonb, "is_required" boolean NOT NULL DEFAULT false, "display_order" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_131815624efb0f0e15a220102de" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "survey_responses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "survey_id" uuid NOT NULL, "user_id" character varying, "user_email" character varying, "responses" jsonb NOT NULL, "submitted_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_349995c51959d139d8e485a58ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "surveys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "is_active" boolean NOT NULL DEFAULT true, "start_date" TIMESTAMP, "end_date" TIMESTAMP, "target_audience" character varying, "max_responses" integer, "created_by" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1b5e3d4aaeb2321ffa98498c971" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_0672782561e44d43febcfba2984" FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "survey_questions" ADD CONSTRAINT "FK_895ad6ec351b200c52c8d1ec099" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "survey_responses" ADD CONSTRAINT "FK_2b4e3f83ce0b4a0d7617ac0cd44" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "survey_responses" DROP CONSTRAINT "FK_2b4e3f83ce0b4a0d7617ac0cd44"`);
        await queryRunner.query(`ALTER TABLE "survey_questions" DROP CONSTRAINT "FK_895ad6ec351b200c52c8d1ec099"`);
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_0672782561e44d43febcfba2984"`);
        await queryRunner.query(`DROP TABLE "surveys"`);
        await queryRunner.query(`DROP TABLE "survey_responses"`);
        await queryRunner.query(`DROP TABLE "survey_questions"`);
        await queryRunner.query(`DROP TABLE "site_settings"`);
        await queryRunner.query(`DROP TABLE "media_library"`);
        await queryRunner.query(`DROP TABLE "hero_sections"`);
        await queryRunner.query(`DROP TABLE "content_sections"`);
        await queryRunner.query(`DROP TABLE "chat_messages"`);
        await queryRunner.query(`DROP TABLE "chat_sessions"`);
        await queryRunner.query(`DROP TABLE "faqs"`);
    }

}
