import { Transaction } from "@shared/schema";
import { TransactionCard } from "@/components/ui/TransactionCard";
import { Link } from "wouter";
import { StaggerChildren, StaggerItem } from "../ui/animation";

type ActiveTransactionsProps = {
  transactions: Transaction[];
  isLoading: boolean;
};

export function ActiveTransactions({ transactions, isLoading }: ActiveTransactionsProps) {
  const activeTransactions = transactions.filter(
    (tx) => tx.status === "in_progress" || tx.status === "pending"
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-poppins font-semibold">Active Transactions</h2>
        <Link 
          to="/transactions" 
          className="text-primary-dark hover:text-primary-light dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition duration-300"
        >
          View All
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark"></div>
        </div>
      ) : activeTransactions.length === 0 ? (
        <div className="glassmorphism rounded-xl p-8 text-center">
          <h3 className="text-xl font-medium mb-2">No Active Transactions</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Start a new transaction to secure your payments.
          </p>
          <Link to="/transactions">
            <button className="btn-primary px-4 py-2 rounded-lg">
              Create Transaction
            </button>
          </Link>
        </div>
      ) : (
        <StaggerChildren className="space-y-5">
          {activeTransactions.map((transaction) => (
            <StaggerItem key={transaction.id}>
              <TransactionCard transaction={transaction} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}
    </div>
  );
}
