import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Import auth models to ensure they are available
export * from "./models/auth";
export * from "./models/chat";

import { users } from "./models/auth";

// === TABLE DEFINITIONS ===

export const audits = pgTable("audits", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id), // Using text/varchar for Replit Auth IDs
  url: text("url").notNull(),
  businessName: text("business_name").notNull(),
  primaryService: text("primary_service").notNull(),
  targetCity: text("target_city").notNull(),
  gmbUrl: text("gmb_url"),
  status: text("status", { enum: ["pending", "processing", "completed", "failed"] }).default("pending").notNull(),
  overallScore: integer("overall_score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditResults = pgTable("audit_results", {
  id: serial("id").primaryKey(),
  auditId: integer("audit_id").references(() => audits.id).notNull(),
  module: text("module", { enum: ["seo", "aeo", "geo", "gmb", "local"] }).notNull(),
  score: integer("score").default(0),
  data: jsonb("data").$type<any>().default({}), // Raw analysis data
  findings: jsonb("findings").$type<any[]>().default([]), // List of issues/fixes
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const auditsRelations = relations(audits, ({ one, many }) => ({
  user: one(users, {
    fields: [audits.userId],
    references: [users.id],
  }),
  results: many(auditResults),
}));

export const auditResultsRelations = relations(auditResults, ({ one }) => ({
  audit: one(audits, {
    fields: [auditResults.auditId],
    references: [audits.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertAuditSchema = createInsertSchema(audits).omit({ 
  id: true, 
  userId: true, 
  status: true, 
  overallScore: true,
  createdAt: true 
});

// === EXPLICIT API CONTRACT TYPES ===

export type Audit = typeof audits.$inferSelect;
export type InsertAudit = z.infer<typeof insertAuditSchema>;
export type AuditResult = typeof auditResults.$inferSelect;

export type CreateAuditRequest = InsertAudit;

export type AuditResponse = Audit & {
  results: AuditResult[];
};

export type AuditListResponse = Audit[];
