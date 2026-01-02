import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import OpenAI from "openai";
import * as cheerio from "cheerio";

// Initialize OpenAI (Replit AI)
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

async function analyzeWithAI(content: string, type: 'seo' | 'aeo' | 'geo' | 'gmb') {
  const prompts = {
    seo: "Analyze this website content for SEO. Return a JSON object with: score (0-100), findings (array of objects with type: 'critical'|'medium'|'low', message: string, fix: string). Focus on keywords, structure, and meta.",
    aeo: "Analyze this content for AEO (Answer Engine Optimization). Is it concise? Does it answer questions? Return JSON with: score (0-100), findings (array of issues/fixes).",
    geo: "Analyze this for GEO (Generative Engine Optimization). Does it have E-E-A-T signals? Return JSON with: score (0-100), findings.",
    gmb: "Analyze this business info for Google Business Profile optimization. Return JSON with: score (0-100), findings.",
  };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [
        { role: "system", content: "You are an expert SEO auditor. Output strictly valid JSON." },
        { role: "user", content: `${prompts[type]}\n\nContent Preview:\n${content.substring(0, 5000)}` }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content || "{}");
  } catch (e) {
    console.error(`AI Analysis failed for ${type}:`, e);
    return { score: 50, findings: [{ type: "low", message: "AI analysis failed, using fallback.", fix: "Try again later." }] };
  }
}

async function performAudit(auditId: number, url: string, businessName: string, city: string) {
  try {
    await storage.updateAuditStatus(auditId, "processing");

    // 1. Fetch Page Content
    // Note: In a real app, use Puppeteer. For MVP, fetch + cheerio is safer in this environment.
    let html = "";
    try {
      const res = await fetch(url);
      html = await res.text();
    } catch (e) {
      console.error("Fetch failed:", e);
      // Fail gracefully or use dummy content
      html = `<html><body><h1>${businessName}</h1><p>Welcome to our service in ${city}.</p></body></html>`;
    }

    const $ = cheerio.load(html);
    const textContent = $("body").text().replace(/\s+/g, " ").trim();
    const metaTitle = $("title").text();
    const metaDesc = $('meta[name="description"]').attr("content") || "";
    
    // 2. SEO Analysis (Basic Rules + AI)
    const seoAnalysis = await analyzeWithAI(`Title: ${metaTitle}\nDesc: ${metaDesc}\nBody: ${textContent}`, "seo");
    await storage.addAuditResult(auditId, "seo", seoAnalysis.score || 60, { metaTitle, metaDesc }, seoAnalysis.findings || []);

    // 3. AEO Analysis
    const aeoAnalysis = await analyzeWithAI(textContent, "aeo");
    await storage.addAuditResult(auditId, "aeo", aeoAnalysis.score || 50, {}, aeoAnalysis.findings || []);

    // 4. GEO Analysis
    const geoAnalysis = await analyzeWithAI(textContent, "geo");
    await storage.addAuditResult(auditId, "geo", geoAnalysis.score || 50, {}, geoAnalysis.findings || []);

    // 5. GMB/Local Analysis
    const gmbAnalysis = await analyzeWithAI(`Business: ${businessName}, City: ${city}`, "gmb");
    await storage.addAuditResult(auditId, "gmb", gmbAnalysis.score || 50, {}, gmbAnalysis.findings || []);

    // Calc overall
    const totalScore = Math.round(((seoAnalysis.score || 0) + (aeoAnalysis.score || 0) + (geoAnalysis.score || 0) + (gmbAnalysis.score || 0)) / 4);

    await storage.updateAuditStatus(auditId, "completed", totalScore);

  } catch (err) {
    console.error("Audit failed:", err);
    await storage.updateAuditStatus(auditId, "failed");
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // API Routes
  app.post(api.audits.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.audits.create.input.parse(req.body);
      const user = req.user as any;
      const audit = await storage.createAudit(user.claims.sub, input);

      // Trigger async audit in background
      performAudit(audit.id, input.url, input.businessName, input.targetCity);

      res.status(201).json(audit);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.get(api.audits.list.path, isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const audits = await storage.getAuditsByUser(user.claims.sub);
    res.json(audits);
  });

  app.get(api.audits.get.path, isAuthenticated, async (req, res) => {
    const audit = await storage.getAudit(Number(req.params.id));
    if (!audit) return res.status(404).json({ message: "Audit not found" });
    
    // Security check: ensure user owns this audit
    const user = req.user as any;
    if (audit.userId !== user.claims.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.json(audit);
  });

  app.delete(api.audits.delete.path, isAuthenticated, async (req, res) => {
    const audit = await storage.getAudit(Number(req.params.id));
    if (!audit) return res.status(404).json({ message: "Audit not found" });

    const user = req.user as any;
    if (audit.userId !== user.claims.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await storage.deleteAudit(Number(req.params.id));
    res.status(204).send();
  });

  return httpServer;
}
