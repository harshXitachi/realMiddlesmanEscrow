import { Transaction } from "@shared/schema";
import { Link } from "wouter";
import { TransactionStatusBadge } from "@/components/ui/TransactionStatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FadeIn } from "../ui/animation";
import { format } from "date-fns";

type RecentTransactionsProps = {
  transactions: Transaction[];
  isLoading: boolean;
};

export function RecentTransactions({ transactions, isLoading }: RecentTransactionsProps) {
  // Format date to 'Jul 12, 2023' style
  const formatDate = (date: Date) => {
    return format(new Date(date), "MMM dd, yyyy");
  };

  return (
    <FadeIn delay={0.2}>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-poppins font-semibold">Recent Transactions</h2>
          <Link to="/transactions" className="text-primary-dark hover:text-primary-light dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition duration-300">
            View All
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <Table className="min-w-full glassmorphism rounded-xl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-neutral-500 dark:text-neutral-400">ID</TableHead>
                <TableHead className="text-neutral-500 dark:text-neutral-400">Title</TableHead>
                <TableHead className="text-neutral-500 dark:text-neutral-400">Amount</TableHead>
                <TableHead className="text-neutral-500 dark:text-neutral-400">Status</TableHead>
                <TableHead className="text-neutral-500 dark:text-neutral-400">Date</TableHead>
                <TableHead className="text-right text-neutral-500 dark:text-neutral-400">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow 
                    key={transaction.id} 
                    className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors duration-150"
                  >
                    <TableCell className="whitespace-nowrap text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {transaction.transactionId}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                      {transaction.title}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                      {transaction.amount.toString()} {transaction.currency}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <TransactionStatusBadge status={transaction.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                      {formatDate(transaction.createdAt)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/transactions/${transaction.id}`} 
                        className="text-primary-dark hover:text-primary-light dark:text-blue-400 dark:hover:text-blue-300 transition duration-300"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </FadeIn>
  );
}
