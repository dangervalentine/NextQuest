import * as SQLite from "expo-sqlite";
import { SQLiteBindParams, SQLiteRunResult } from "expo-sqlite";

class DatabaseConnection {
    private static instance: DatabaseConnection;
    private db: ReturnType<typeof SQLite.openDatabaseSync>;

    private constructor() {
        this.db = SQLite.openDatabaseSync("NextQuest.db");
    }

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    private ensureConnection() {
        if (!this.db) {
            this.db = SQLite.openDatabaseSync("NextQuest.db");
        }
    }

    public async execAsync(sql: string): Promise<void> {
        this.ensureConnection();
        return this.db.execAsync(sql);
    }

    public async getAllAsync<T>(sql: string): Promise<T[]> {
        this.ensureConnection();
        return this.db.getAllAsync(sql);
    }

    public async getFirstAsync<T>(sql: string): Promise<T | undefined> {
        this.ensureConnection();
        const results = await this.db.getAllAsync<T>(sql);
        return results[0];
    }

    public async runAsync(
        sql: string,
        params?: SQLiteBindParams
    ): Promise<SQLiteRunResult> {
        this.ensureConnection();
        return this.db.runAsync(sql, params || []);
    }
}

export const db = DatabaseConnection.getInstance();
export default db;








