import { Message, User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type MessageItemProps = {
  message: Message;
  className?: string;
};

export function MessageItem({ message, className }: MessageItemProps) {
  // In a real app, we would fetch the user data based on the senderId
  // For now, we'll use placeholder data
  const sender = {
    id: message.senderId,
    username: "user" + message.senderId,
    fullName: "User " + message.senderId,
    avatarUrl: `https://ui-avatars.com/api/?name=User+${message.senderId}&background=random`
  };
  
  const formattedTime = message.createdAt instanceof Date
    ? format(message.createdAt, "h:mm a")
    : "Unknown time";
    
  const formattedDate = message.createdAt instanceof Date
    ? format(message.createdAt, "MMM d")
    : "Unknown date";

  return (
    <div 
      className={cn(
        "px-4 py-3 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors duration-150 cursor-pointer",
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <img 
          src={sender.avatarUrl} 
          alt={sender.fullName} 
          className="h-10 w-10 rounded-full"
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
              {sender.fullName}
            </h4>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {formattedDate}
            </span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}
