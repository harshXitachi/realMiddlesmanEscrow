import { Message } from "@shared/schema";
import { MessageItem } from "./MessageItem";

type MessagesListProps = {
  messages: Message[];
  isLoading: boolean;
  onSelectMessage: (messageId: number) => void;
  selectedMessageId: number | null;
};

export function MessagesList({ messages, isLoading, onSelectMessage, selectedMessageId }: MessagesListProps) {
  // Group messages by conversation
  const conversationMap = new Map<number, Message[]>();
  
  // Get the most recent message for each conversation
  messages.forEach(message => {
    const otherUserId = message.senderId;
    if (!conversationMap.has(otherUserId) || 
        new Date(message.createdAt) > new Date(conversationMap.get(otherUserId)![0].createdAt)) {
      conversationMap.set(otherUserId, [message]);
    }
  });
  
  // Convert to array and sort by date
  const conversations = Array.from(conversationMap.values())
    .map(messages => messages[0])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"></div>
      </div>
    );
  }
  
  if (conversations.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
        No messages found
      </div>
    );
  }
  
  return (
    <>
      {conversations.map(message => (
        <div 
          key={message.id}
          onClick={() => onSelectMessage(message.id)}
          className={selectedMessageId === message.id ? "bg-blue-50/80 dark:bg-blue-900/20" : ""}
        >
          <MessageItem 
            message={message} 
          />
        </div>
      ))}
    </>
  );
}
