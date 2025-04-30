import { Transaction } from "@shared/schema";
import { GlassmorphicCard } from "./GlassmorphicCard";
import { format } from "date-fns";
import { TransactionStatusBadge } from "./TransactionStatusBadge";
import { useLocation } from "wouter";

type TransactionCardProps = {
  transaction: Transaction;
  className?: string;
  showActions?: boolean;
};

export function TransactionCard({ transaction, className, showActions = true }: TransactionCardProps) {
  const [, navigate] = useLocation();
  
  const formattedDate = transaction.dueDate 
    ? format(new Date(transaction.dueDate), "MMM dd, yyyy")
    : "No due date";
  
  const progressPercentage = transaction.progress || 0;
  
  return (
    <GlassmorphicCard 
      className={`transaction-card ${className}`}
      onClick={() => navigate(`/transactions/${transaction.id}`)}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <h3 className="font-poppins font-semibold text-lg">{transaction.transactionId} - {transaction.title}</h3>
            <TransactionStatusBadge status={transaction.status} className="ml-2" />
          </div>
          {/* We'd normally pull the other user's data from the API */}
          <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
            {transaction.amount.toString()} {transaction.currency}
          </p>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-1">
          <span>Progress</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-primary-dark to-primary-light h-full rounded-full progress-bar" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {showActions && (
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
            <span className="material-icons text-sm mr-1">calendar_today</span>
            <span>Due: {formattedDate}</span>
          </div>
          <div className="flex space-x-2">
            <button 
              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 
                rounded-lg text-sm font-medium transition duration-300"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/messages");
              }}
            >
              Message
            </button>
            {transaction.status === "in_progress" && progressPercentage >= 100 && (
              <button 
                className="px-3 py-1.5 btn-accent rounded-lg text-sm font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  // This would trigger a state change in a real application
                  alert("This would release funds in a real application");
                }}
              >
                Approve & Pay
              </button>
            )}
          </div>
        </div>
      )}
    </GlassmorphicCard>
  );
}
