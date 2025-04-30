import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Transaction } from "@shared/schema";
import { TransactionDetails } from "@/components/transactions/TransactionDetails";
import { MilestoneList } from "@/components/transactions/MilestoneList";
import { DisputeForm } from "@/components/transactions/DisputeForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, MessageSquare, ChevronLeft } from "lucide-react";
import { FadeIn } from "@/components/ui/animation";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  
  // Fetch transaction details
  const { data: transaction, isLoading, isError } = useQuery<Transaction>({
    queryKey: [`/api/transactions/${id}`],
  });
  
  // Function to update transaction status
  const updateTransactionMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiRequest("PATCH", `/api/transactions/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/transactions/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Transaction updated",
        description: "The transaction status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update transaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Function to handle releasing funds
  const handleReleaseFunds = () => {
    updateTransactionMutation.mutate("completed");
  };
  
  // Function to handle cancellation
  const handleCancel = () => {
    updateTransactionMutation.mutate("cancelled");
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-dark" />
        </div>
      </Layout>
    );
  }
  
  if (isError || !transaction) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <AlertTriangle className="h-12 w-12 text-danger mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Transaction Not Found</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            We couldn't find the transaction you're looking for.
          </p>
          <Button onClick={() => navigate("/transactions")}>
            Back to Transactions
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <FadeIn>
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/transactions")}
            className="mr-4"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-poppins font-bold">
              {transaction.transactionId} - {transaction.title}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Created on {new Date(transaction.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </FadeIn>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="details">
            <TabsList className="mb-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <TransactionDetails transaction={transaction} />
            </TabsContent>
            
            <TabsContent value="milestones">
              <MilestoneList 
                transaction={transaction} 
                onUpdateMilestone={(updatedTransaction) => {
                  queryClient.setQueryData([`/api/transactions/${id}`], updatedTransaction);
                  queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <div className="glassmorphism rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Actions</h3>
            
            <div className="space-y-4">
              {transaction.status === "in_progress" && (
                <>
                  <Button 
                    className="w-full btn-primary"
                    onClick={handleReleaseFunds}
                    disabled={updateTransactionMutation.isPending}
                  >
                    {updateTransactionMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      "Release Funds"
                    )}
                  </Button>
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setIsDisputeModalOpen(true)}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2 text-danger" />
                    Raise Dispute
                  </Button>
                </>
              )}
              
              {transaction.status === "pending" && (
                <Button 
                  className="w-full btn-primary"
                  onClick={() => updateTransactionMutation.mutate("in_progress")}
                  disabled={updateTransactionMutation.isPending}
                >
                  {updateTransactionMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "Start Transaction"
                  )}
                </Button>
              )}
              
              {(transaction.status === "pending" || transaction.status === "in_progress") && (
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateTransactionMutation.isPending}
                >
                  Cancel Transaction
                </Button>
              )}
              
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate("/messages")}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
          
          <div className="glassmorphism rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Transaction Status</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  <span>Progress</span>
                  <span>{transaction.progress || 0}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-primary-dark to-primary-light h-full rounded-full progress-bar" 
                    style={{ width: `${transaction.progress || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Status</span>
                <div className={`transaction-status status-${transaction.status} text-sm font-medium`}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1).replace('_', ' ')}
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Amount</span>
                <span className="text-lg font-semibold">
                  {transaction.amount.toString()} {transaction.currency}
                </span>
              </div>
              
              {transaction.dueDate && (
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">Due Date</span>
                  <div className="flex items-center">
                    <span className="material-icons text-sm mr-1">calendar_today</span>
                    <span>{new Date(transaction.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Dispute Modal */}
      <Dialog open={isDisputeModalOpen} onOpenChange={setIsDisputeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise a Dispute</DialogTitle>
          </DialogHeader>
          <DisputeForm 
            transactionId={Number(id)} 
            onSuccess={() => {
              setIsDisputeModalOpen(false);
              queryClient.invalidateQueries({ queryKey: [`/api/transactions/${id}`] });
              queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
            }}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
