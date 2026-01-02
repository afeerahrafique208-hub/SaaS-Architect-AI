import { useAudit } from "@/hooks/use-audits";
import { Link, useRoute } from "wouter";
import { Loader2, ArrowLeft, Download, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreGauge } from "@/components/ScoreGauge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function AuditDetail() {
  const [, params] = useRoute("/audits/:id");
  const id = parseInt(params?.id || "0");
  const { data: audit, isLoading } = useAudit(id);

  if (isLoading || !audit) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading audit data...</p>
      </div>
    );
  }

  // Polling loading state
  if (audit.status === "pending" || audit.status === "processing") {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-8">
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-xl animate-pulse">
            AI
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold font-display mb-2">Analyzing {audit.businessName}</h2>
          <p className="text-muted-foreground text-lg">
            Our AI is currently crawling your site and generating insights.
            <br />
            This usually takes 1-2 minutes.
          </p>
        </div>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground/50">
           <span>SEO Analysis</span> • <span>Technical Check</span> • <span>Local Ranking</span>
        </div>
      </div>
    );
  }

  const moduleScores = audit.results.map(r => ({
    name: r.module.toUpperCase(),
    score: r.score || 0,
    module: r.module
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/">
            <button className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </button>
          </Link>
          <h1 className="text-3xl font-bold font-display">{audit.businessName} Audit</h1>
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">{audit.status}</span>
            <span>•</span>
            <a href={audit.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{audit.url}</a>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-card/50 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <ScoreGauge score={audit.overallScore || 0} label="Overall Score" />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Performance by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleScores} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={50} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={32}>
                  {moduleScores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.score >= 90 ? "hsl(142, 71%, 45%)" : 
                      entry.score >= 70 ? "hsl(45, 93%, 47%)" : 
                      "hsl(0, 84%, 60%)"
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Modules */}
      <div className="grid grid-cols-1 gap-6">
        {audit.results.map((result, idx) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="overflow-hidden border-t-4" style={{ 
              borderTopColor: result.score && result.score >= 70 ? (result.score >= 90 ? 'hsl(142, 71%, 45%)' : 'hsl(45, 93%, 47%)') : 'hsl(0, 84%, 60%)'
            }}>
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{result.module.toUpperCase()} Analysis</CardTitle>
                    <p className="text-sm text-muted-foreground">Detailed findings and AI recommendations</p>
                  </div>
                  <div className={cn(
                    "text-2xl font-bold font-display px-4 py-2 rounded-lg bg-background border",
                    result.score && result.score >= 90 ? "text-green-500 border-green-500/20" :
                    result.score && result.score >= 70 ? "text-yellow-500 border-yellow-500/20" :
                    "text-red-500 border-red-500/20"
                  )}>
                    {result.score}/100
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {(result.findings as any[])?.length > 0 ? (
                    (result.findings as any[]).map((finding: any, i: number) => (
                      <div key={i} className="flex gap-4 p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                        <div className="shrink-0 mt-1">
                          {finding.severity === 'critical' ? (
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                          ) : finding.severity === 'warning' ? (
                            <Info className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <h4 className={cn("font-medium", 
                            finding.severity === 'critical' ? "text-red-400" :
                            finding.severity === 'warning' ? "text-yellow-400" :
                            "text-green-400"
                          )}>
                            {finding.issue}
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {finding.recommendation}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No specific findings available for this section.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
