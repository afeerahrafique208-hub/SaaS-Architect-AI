import { useCreateAudit } from "@/hooks/use-audits";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAuditSchema } from "@shared/schema";
import { z } from "zod";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

// Creating a form schema that handles coercions if necessary, though strings are fine here
const formSchema = insertAuditSchema.pick({
  url: true,
  businessName: true,
  primaryService: true,
  targetCity: true,
  gmbUrl: true,
});

type FormValues = z.infer<typeof formSchema>;

export default function NewAudit() {
  const [, setLocation] = useLocation();
  const { mutateAsync: createAudit, isPending } = useCreateAudit();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      businessName: "",
      primaryService: "",
      targetCity: "",
      gmbUrl: "",
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      const res = await createAudit(data);
      // Redirect to the newly created audit
      setLocation(`/audits/${res.id}`);
    } catch (error) {
      // Error is handled by mutation hook toast
      console.error(error);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/">
        <button className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold font-display">New Audit</h1>
        <p className="text-muted-foreground mt-1">Configure your analysis parameters.</p>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
          <CardDescription>
            Enter the details of the business you want to audit. Our AI will crawl the site and analyze local presence.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Plumbing Co." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="primaryService"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Service</FormLabel>
                      <FormControl>
                        <Input placeholder="Plumbing Services" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="targetCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York, NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://acmeplumbing.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gmbUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Business Profile URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://maps.google.com/..." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Starting Analysis...
                  </>
                ) : (
                  "Start Audit"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
