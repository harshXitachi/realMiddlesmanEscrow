import { cn } from "@/lib/utils";

type TransactionStatus = "pending" | "in_progress" | "completed" | "cancelled" | "disputed";

const statusLabels: Record<TransactionStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  disputed: "Disputed"
};

type TransactionStatusBadgeProps = {
  status: string;
  className?: string;
};

export function TransactionStatusBadge({ status, className }: TransactionStatusBadgeProps) {
  const normalizedStatus = status as TransactionStatus;
  const label = statusLabels[normalizedStatus] || status;
  
  const getStatusClasses = (status: string) => {
    switch(status) {
      case "completed":
        return "status-complete text-success";
      case "in_progress":
        return "status-progress text-warning";
      case "disputed":
        return "status-dispute text-danger";
      case "pending":
        return "status-pending text-gray-500";
      case "cancelled":
        return "status-cancelled text-gray-600";
      default:
        return "text-gray-500";
    }
  };
  
  return (
    <span className={cn(
      "transaction-status text-sm font-medium",
      getStatusClasses(status),
      className
    )}>
      {label}
    </span>
  );
}
