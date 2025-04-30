import { Transaction } from "@shared/schema";
import { TransactionStatusBadge } from "@/components/ui/TransactionStatusBadge";
import { GlassmorphicCard } from "@/components/ui/GlassmorphicCard";
import { format } from "date-fns";
import { CalendarIcon, User, Clock, FileText } from "lucide-react";

type TransactionDetailsProps = {
  transaction: Transaction;
};

export function TransactionDetails({ transaction }: TransactionDetailsProps) {
  // Format dates
  const createdDate = format(new Date(transaction.createdAt), "MMMM dd, yyyy");
  const dueDate = transaction.dueDate 
    ? format(new Date(transaction.dueDate), "MMMM dd, yyyy")
    : "No due date";
  
  return (
    <div className="space-y-6">
      <GlassmorphicCard>
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-1">{transaction.title}</h2>
            <div className="flex items-center">
              <TransactionStatusBadge status={transaction.status} />
              <span className="mx-2">•</span>
              <span className="text-neutral-600 dark:text-neutral-400 text-sm">
                {transaction.transactionId}
              </span>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="text-2xl font-semibold gradient-text">
              {transaction.amount.toString()} {transaction.currency}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Transaction Information</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <CalendarIcon className="h-5 w-5 text-neutral-500 dark:text-neutral-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Created On</p>
                  <p className="font-medium">{createdDate}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-neutral-500 dark:text-neutral-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Due Date</p>
                  <p className="font-medium">{dueDate}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <User className="h-5 w-5 text-neutral-500 dark:text-neutral-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {transaction.initiatorId === transaction.receiverId ? "Counterparty" : "Initiator"}
                  </p>
                  <p className="font-medium">
                    {/* In a real app, we would load user details here */}
                    User #{transaction.initiatorId}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <User className="h-5 w-5 text-neutral-500 dark:text-neutral-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Recipient</p>
                  <p className="font-medium">
                    {/* In a real app, we would load user details here */}
                    User #{transaction.receiverId}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Description</h3>
            {transaction.description ? (
              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                  {transaction.description}
                </p>
              </div>
            ) : (
              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg">
                <p className="text-neutral-500 dark:text-neutral-400 italic">
                  No description provided
                </p>
              </div>
            )}
            
            {/* File attachments would go here in a real app */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Attachments</h3>
              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg flex items-center justify-center h-24">
                <div className="text-center">
                  <FileText className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-neutral-500 dark:text-neutral-400">
                    No attachments
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassmorphicCard>
      
      {/* Transaction activity timeline would go here in a real app */}
      <GlassmorphicCard>
        <h3 className="text-lg font-medium mb-4">Transaction Activity</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="min-w-[60px] text-sm text-neutral-500 dark:text-neutral-400">
              {format(new Date(transaction.createdAt), "MMM dd")}
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg flex-1">
              <p className="text-sm">
                Transaction created by <span className="font-medium">User #{transaction.initiatorId}</span>
              </p>
            </div>
          </div>
          
          {transaction.status !== "pending" && (
            <div className="flex items-start">
              <div className="min-w-[60px] text-sm text-neutral-500 dark:text-neutral-400">
                {format(new Date(transaction.updatedAt), "MMM dd")}
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg flex-1">
                <p className="text-sm">
                  Transaction status changed to <span className="font-medium">{transaction.status.replace('_', ' ')}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </GlassmorphicCard>
    </div>
  );
}
