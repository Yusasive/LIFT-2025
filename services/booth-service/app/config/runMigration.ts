import "reflect-metadata";
import { AppDataSource } from "./typeorm.config";

export const handler = async () => {
  try {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    const pendingMigrations = await AppDataSource.showMigrations();
    console.log("📌 Any migrations pending?", pendingMigrations);   

    await AppDataSource.runMigrations();
    await AppDataSource.destroy();
    console.log("✅ Migrations ran successfully.");
    return { statusCode: 200, body: "Migrations completed" };
  } catch (error) {
    console.error("❌ Migration failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { statusCode: 500, body: "Migration failed: " + errorMessage };
  }
};
