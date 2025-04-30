import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { Transaction, Message } from "@shared/schema";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { ActiveTransactions } from "@/components/dashboard/ActiveTransactions";
import { RecentMessages } from "@/components/dashboard/RecentMessages";
import { NewTransactionModal } from "@/components/transactions/NewTransactionModal";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { FadeIn, SlideIn } from "@/components/ui/animation";

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  
  // Fetch transactions
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    enabled: !!user,
  });
  
  // Fetch messages
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    enabled: !!user,
  });
  
  // Calculate statistics
  const activeTransactions = transactions.filter(tx => tx.status === "in_progress" || tx.status === "pending");
  const completedTransactions = transactions.filter(tx => tx.status === "completed");
  const inEscrowAmount = activeTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const pendingApprovalCount = activeTransactions.filter(tx => Number(tx.progress) === 100).length;
  
  return (
    <Layout>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <FadeIn>
            <div>
              <h1 className="text-3xl font-poppins font-bold mb-2">Dashboard</h1>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4 md:mb-0">
                Welcome back, <span className="font-medium">{user?.fullName || user?.username}</span>
              </p>
            </div>
          </FadeIn>
          
          <SlideIn direction="left">
            <div className="flex space-x-2">
              <Button 
                className="btn-primary px-4 py-2 text-white rounded-lg flex items-center space-x-2 shadow-md"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span>New Transaction</span>
              </Button>
              <Button 
                variant="outline" 
                className="neumorphic px-4 py-2 text-neutral-700 dark:text-neutral-200 rounded-lg flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
            </div>
          </SlideIn>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Transactions"
          value={activeTransactions.length}
          icon="sync"
          footer={
            <div className="flex items-center">
              <span className="text-success text-sm font-medium">Active</span>
            </div>
          }
        />
        
        <StatCard
          title="Completed"
          value={completedTransactions.length}
          icon="check_circle"
          iconBgClass="bg-success/10"
          iconClass="text-success"
          footer={
            <div className="flex items-center">
              <span className="text-success text-sm font-medium">Successful transactions</span>
            </div>
          }
        />
        
        <StatCard
          title="In Escrow"
          value={`$${inEscrowAmount.toFixed(2)}`}
          icon="account_balance_wallet"
          iconBgClass="bg-primary-dark/10"
          iconClass="text-primary-dark dark:text-primary-light"
          footer={
            <div className="flex items-center">
              <span className="text-neutral-600 dark:text-neutral-400 text-sm font-medium">
                Across {activeTransactions.length} transactions
              </span>
            </div>
          }
        />
        
        <StatCard
          title="Pending Approval"
          value={pendingApprovalCount}
          icon="hourglass_top"
          iconBgClass="bg-warning/10"
          iconClass="text-warning"
          footer={
            <div className="flex items-center">
              <span className="text-warning text-sm font-medium">Action required</span>
              <span className="material-icons text-warning text-sm ml-1">priority_high</span>
            </div>
          }
        />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions 
        transactions={transactions.slice(0, 5)} 
        isLoading={isLoadingTransactions} 
      />
      
      {/* Active Transactions and Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Transactions */}
        <div className="lg:col-span-2">
          <ActiveTransactions 
            transactions={activeTransactions.slice(0, 3)}
            isLoading={isLoadingTransactions}
          />
        </div>
        
        {/* Messages */}
        <div>
          <RecentMessages 
            messages={messages} 
            isLoading={isLoadingMessages} 
          />
        </div>
      </div>
      
      {/* New Transaction Modal */}
      <NewTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </Layout>
  );
}
