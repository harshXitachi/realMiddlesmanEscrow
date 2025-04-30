import { Transaction } from "@shared/schema";
import { TransactionCard } from "@/components/ui/TransactionCard";
import { StaggerChildren, StaggerItem } from "@/components/ui/animation";

type TransactionsListProps = {
  transactions: Transaction[];
  isLoading: boolean;
};

export function TransactionsList({ transactions, isLoading }: TransactionsListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"></div>
      </div>
    );
  }
  
  if (transactions.length === 0) {
    return (
      <div className="glassmorphism rounded-xl p-8 text-center">
        <h3 className="text-xl font-medium mb-2">No Transactions Found</h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Start creating transactions to manage your escrow payments.
        </p>
      </div>
    );
  }
  
  return (
    <StaggerChildren className="space-y-4">
      {transactions.map((transaction) => (
        <StaggerItem key={transaction.id}>
          <TransactionCard 
            transaction={transaction}
            showActions={true}
          />
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}
