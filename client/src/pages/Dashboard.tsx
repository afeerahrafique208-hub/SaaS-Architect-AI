import { useAudits, useDeleteAudit } from "@/hooks/use-audits";
import { Link, useLocation } from "wouter";
import { Plus, ExternalLink, Trash2, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: audits, isLoading } = useAudits();
  const { mutate: deleteAudit } = useDeleteAudit();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "processing": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "failed": return "text-red-500 bg-red-500/10 border-red-500/20";
      default: return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4" />;
      case "failed": return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage and view your SEO audits</p>
        </div>
        <Link href="/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            New Audit
          </Button>
        </Link>
      </div>

      {audits?.length === 0 ? (
        <Card className="bg-card/50 border-dashed border-2 p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">No audits yet</h3>
            <p className="text-muted-foreground max-w-sm">
              Start your first comprehensive SEO & AEO audit to see how your site performs.
            </p>
            <Link href="/new">
              <Button>Start First Audit</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {audits?.map((audit, i) => (
            <motion.div
              key={audit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="group hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-stretch">
                    {/* Status Strip */}
                    <div className={cn("w-full md:w-2", 
                      audit.status === 'completed' ? 'bg-green-500' : 
                      audit.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                    )} />
                    
                    <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-lg">{audit.businessName}</h3>
                          <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5", getStatusColor(audit.status))}>
                            {getStatusIcon(audit.status)}
                            {audit.status.charAt(0).toUpperCase() + audit.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ExternalLink className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{audit.url}</span>
                          <span>•</span>
                          <span>{audit.targetCity}</span>
                          <span>•</span>
                          <span>{format(new Date(audit.createdAt || new Date()), "MMM d, yyyy")}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 justify-between md:justify-end">
                        {audit.status === 'completed' && (
                          <div className="text-center px-4">
                            <div className="text-2xl font-bold font-display text-foreground">{audit.overallScore ?? 0}</div>
                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Score</div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Link href={`/audits/${audit.id}`}>
                            <Button variant="outline" className="hover:bg-primary/10 hover:text-primary hover:border-primary">
                              View Details
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.preventDefault();
                              if (confirm("Are you sure you want to delete this audit?")) {
                                deleteAudit(audit.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
