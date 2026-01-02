import { 
  audits, auditResults, users,
  type Audit, type InsertAudit, type AuditResult, type User, type UpsertUser 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  // Audit operations
  createAudit(userId: string, audit: InsertAudit): Promise<Audit>;
  getAuditsByUser(userId: string): Promise<Audit[]>;
  getAudit(id: number): Promise<Audit & { results: AuditResult[] } | undefined>;
  updateAuditStatus(id: number, status: string, overallScore?: number): Promise<Audit>;
  addAuditResult(auditId: number, module: string, score: number, data: any, findings: any[]): Promise<AuditResult>;
  deleteAudit(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Auth methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Audit methods
  async createAudit(userId: string, audit: InsertAudit): Promise<Audit> {
    const [newAudit] = await db
      .insert(audits)
      .values({ ...audit, userId, status: "pending" })
      .returning();
    return newAudit;
  }

  async getAuditsByUser(userId: string): Promise<Audit[]> {
    return await db
      .select()
      .from(audits)
      .where(eq(audits.userId, userId))
      .orderBy(desc(audits.createdAt));
  }

  async getAudit(id: number): Promise<Audit & { results: AuditResult[] } | undefined> {
    const [audit] = await db.select().from(audits).where(eq(audits.id, id));
    if (!audit) return undefined;

    const results = await db.select().from(auditResults).where(eq(auditResults.auditId, id));
    return { ...audit, results };
  }

  async updateAuditStatus(id: number, status: string, overallScore: number = 0): Promise<Audit> {
    const [updated] = await db
      .update(audits)
      .set({ status, overallScore })
      .where(eq(audits.id, id))
      .returning();
    return updated;
  }

  async addAuditResult(auditId: number, module: string, score: number, data: any, findings: any[]): Promise<AuditResult> {
    const [result] = await db
      .insert(auditResults)
      .values({ auditId, module, score, data, findings })
      .returning();
    return result;
  }
  
  async deleteAudit(id: number): Promise<void> {
    await db.delete(auditResults).where(eq(auditResults.auditId, id));
    await db.delete(audits).where(eq(audits.id, id));
  }
}

export const storage = new DatabaseStorage();
