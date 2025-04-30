import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Define form schema
const formSchema = z.object({
  reason: z.string().min(10, {
    message: "Reason must be at least 10 characters.",
  }),
});

type DisputeFormValues = z.infer<typeof formSchema>;

type DisputeFormProps = {
  transactionId: number;
  onSuccess: () => void;
};

export function DisputeForm({ transactionId, onSuccess }: DisputeFormProps) {
  const { toast } = useToast();
  
  // Create form
  const form = useForm<DisputeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
    },
  });
  
  // Create dispute mutation
  const createDisputeMutation = useMutation({
    mutationFn: async (data: DisputeFormValues) => {
      const res = await apiRequest("POST", "/api/disputes", {
        ...data,
        transactionId,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Dispute filed",
        description: "Your dispute has been filed successfully. Our team will review it shortly.",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to file dispute",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Submit handler
  function onSubmit(values: DisputeFormValues) {
    createDisputeMutation.mutate(values);
  }

  return (
    <div className="py-4">
      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
        Please provide a detailed explanation of the issue you're experiencing with this transaction.
        Our team will review your dispute and work to resolve it as quickly as possible.
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason for Dispute</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the issue in detail..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end">
            <Button
              type="submit"
              className="btn-primary"
              disabled={createDisputeMutation.isPending}
            >
              {createDisputeMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Filing Dispute...
                </span>
              ) : (
                "File Dispute"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
