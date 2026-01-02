import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateAuditInput, type AuditResponse, type AuditListResponse } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useAudits() {
  return useQuery({
    queryKey: [api.audits.list.path],
    queryFn: async () => {
      const res = await fetch(api.audits.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch audits");
      // Manually parsing because the response might not exactly match the Zod schema if fields are null
      // but strictly speaking we should use api.audits.list.responses[200].parse(await res.json())
      return (await res.json()) as AuditListResponse;
    },
  });
}

export function useAudit(id: number) {
  return useQuery({
    queryKey: [api.audits.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.audits.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch audit details");
      return (await res.json()) as AuditResponse;
    },
    // Poll every 3 seconds if status is pending or processing
    refetchInterval: (query) => {
      const data = query.state.data as AuditResponse | undefined;
      if (data?.status === "pending" || data?.status === "processing") {
        return 3000;
      }
      return false;
    },
  });
}

export function useCreateAudit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateAuditInput) => {
      const validated = api.audits.create.input.parse(data);
      const res = await fetch(api.audits.create.path, {
        method: api.audits.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.audits.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create audit");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.audits.list.path] });
      toast({
        title: "Audit Started",
        description: "Your site analysis has begun. This may take a few minutes.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteAudit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.audits.delete.path, { id });
      const res = await fetch(url, { 
        method: api.audits.delete.method,
        credentials: "include" 
      });
      
      if (!res.ok) throw new Error("Failed to delete audit");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.audits.list.path] });
      toast({
        title: "Deleted",
        description: "Audit report has been removed.",
      });
    },
  });
}
