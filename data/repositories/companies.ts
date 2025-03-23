import db from "../config/database";
import { Company } from "../models/IGDBGameResponse";

export const getAllCompanies = async () => {
    try {
        return await db.getAllAsync<Company>(
            "SELECT id, name FROM companies ORDER BY name ASC"
        );
    } catch (error) {
        console.error("Error getting companies:", error);
        throw error;
    }
};

export const getCompanyById = async (id: number) => {
    try {
        const query = "SELECT id, name FROM companies WHERE id = " + id;
        const [company] = await db.getAllAsync<Company>(query);
        return company;
    } catch (error) {
        console.error("Error getting company by id:", error);
        throw error;
    }
};

export const createCompany = async (company: Omit<Company, "id">) => {
    try {
        const query = `INSERT OR IGNORE INTO companies (name) VALUES ('${company.name}')`;
        await db.execAsync(query);
        // Get the last inserted ID using a separate query
        const [result] = await db.getAllAsync<{ id: number }>(
            "SELECT last_insert_rowid() as id"
        );
        return result.id;
    } catch (error) {
        console.error("Error creating company:", error);
        throw error;
    }
};

export const updateCompany = async (company: Company) => {
    try {
        const query = `UPDATE companies SET name = '${company.name}' WHERE id = ${company.id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error updating company:", error);
        throw error;
    }
};

export const deleteCompany = async (id: number) => {
    try {
        const query = `DELETE FROM companies WHERE id = ${id}`;
        await db.execAsync(query);
    } catch (error) {
        console.error("Error deleting company:", error);
        throw error;
    }
};

export const getOrCreateCompany = async (company: Company) => {
    try {
        let existingCompany = await getCompanyById(company.id);
        if (!existingCompany) {
            const query = `INSERT OR IGNORE INTO companies (id, name) VALUES (${company.id}, '${company.name}')`;
            await db.execAsync(query);
            existingCompany = company;
        }
        return existingCompany;
    } catch (error) {
        console.error("Error getting or creating company:", error);
        throw error;
    }
};
