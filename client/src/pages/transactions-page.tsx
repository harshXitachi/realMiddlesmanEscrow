import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Transaction } from "@shared/schema";
import { TransactionsList } from "@/components/transactions/TransactionsList";
import { NewTransactionModal } from "@/components/transactions/NewTransactionModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn } from "@/components/ui/animation";

export default function TransactionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });
  
  // Filter transactions based on active tab
  const filteredTransactions = transactions.filter((transaction) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return transaction.status === "in_progress" || transaction.status === "pending";
    if (activeTab === "completed") return transaction.status === "completed";
    if (activeTab === "disputed") return transaction.status === "disputed";
    return true;
  });

  return (
    <Layout title="Transactions">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <FadeIn>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4 md:mb-0">
            Manage your escrow transactions in one place
          </p>
        </FadeIn>
        
        <Button 
          className="btn-primary flex items-center gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New Transaction
        </Button>
      </div>
      
      <Tabs 
        defaultValue="all" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="disputed">Disputed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <TransactionsList 
            transactions={filteredTransactions} 
            isLoading={isLoading} 
          />
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          <TransactionsList 
            transactions={filteredTransactions} 
            isLoading={isLoading} 
          />
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <TransactionsList 
            transactions={filteredTransactions} 
            isLoading={isLoading} 
          />
        </TabsContent>
        
        <TabsContent value="disputed" className="mt-6">
          <TransactionsList 
            transactions={filteredTransactions} 
            isLoading={isLoading} 
          />
        </TabsContent>
      </Tabs>
      
      <NewTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </Layout>
  );
}
