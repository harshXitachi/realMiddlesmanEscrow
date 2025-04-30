import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TransactionForm } from "./TransactionForm";
import { InsertTransaction } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type NewTransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function NewTransactionModal({ isOpen, onClose }: NewTransactionModalProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  
  const createTransactionMutation = useMutation({
    mutationFn: async (data: InsertTransaction) => {
      const res = await apiRequest("POST", "/api/transactions", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Transaction created",
        description: "Your transaction has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      onClose();
      setStep(1);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create transaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertTransaction) => {
    createTransactionMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dark:bg-gray-900 dark:text-white dark:border-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-poppins font-bold">
            New Transaction
          </DialogTitle>
          <DialogDescription className="text-neutral-600 dark:text-neutral-400">
            Create a secure escrow transaction to protect your payment.
          </DialogDescription>
        </DialogHeader>
        
        <TransactionForm 
          onSubmit={handleSubmit} 
          isSubmitting={createTransactionMutation.isPending} 
        />
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit"
            form="transaction-form"
            className="btn-accent"
            disabled={createTransactionMutation.isPending}
          >
            {createTransactionMutation.isPending ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              "Create Transaction"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
