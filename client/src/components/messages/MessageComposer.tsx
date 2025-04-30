import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { InsertMessage, Message } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { format } from "date-fns";

type MessageComposerProps = {
  partnerId: number;
  transactionId?: number;
};

export function MessageComposer({ partnerId, transactionId }: MessageComposerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch conversation history
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    select: (data) => data.filter(m => 
      (m.senderId === partnerId && m.receiverId === user?.id) || 
      (m.receiverId === partnerId && m.senderId === user?.id)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage: InsertMessage) => {
      const res = await apiRequest("POST", "/api/messages", newMessage);
      return await res.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Get partner information (in a real app, we would fetch this from the API)
  const partner = {
    id: partnerId,
    fullName: `User ${partnerId}`,
    avatarUrl: `https://ui-avatars.com/api/?name=User+${partnerId}&background=random`
  };
  
  const handleSendMessage = () => {
    if (!message.trim() || !user) return;
    
    sendMessageMutation.mutate({
      content: message,
      senderId: user.id,
      receiverId: partnerId,
      transactionId: transactionId,
      isRead: false,
    });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Group messages by date
  const groupedMessages: Record<string, Message[]> = {};
  messages.forEach(msg => {
    const date = format(new Date(msg.createdAt), "MMM dd, yyyy");
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(msg);
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center">
        <img 
          src={partner.avatarUrl} 
          alt={partner.fullName} 
          className="h-10 w-10 rounded-full mr-3"
        />
        <div>
          <h3 className="font-medium">{partner.fullName}</h3>
          {transactionId && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Transaction #{transactionId}
            </p>
          )}
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-dark" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-neutral-500 dark:text-neutral-400 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="space-y-4">
              <div className="flex justify-center">
                <span className="text-xs bg-neutral-200 dark:bg-neutral-700 px-2 py-1 rounded-full text-neutral-600 dark:text-neutral-300">
                  {date}
                </span>
              </div>
              
              {dateMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      msg.senderId === user?.id
                        ? "bg-primary-dark text-white rounded-tr-none"
                        : "bg-neutral-100 dark:bg-neutral-800 rounded-tl-none"
                    }`}
                  >
                    <p className="break-words">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.senderId === user?.id
                          ? "text-blue-200"
                          : "text-neutral-500 dark:text-neutral-400"
                      }`}
                    >
                      {format(new Date(msg.createdAt), "h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Composer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-end gap-2">
          <Textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="resize-none min-h-[80px]"
          />
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="btn-primary"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
