import { Message } from "@shared/schema";
import { useState } from "react";
import { Link } from "wouter";
import { MessageItem } from "../messages/MessageItem";
import { GlassmorphicCard } from "../ui/GlassmorphicCard";
import { Input } from "../ui/input";
import { FadeIn } from "../ui/animation";

type RecentMessagesProps = {
  messages: Message[];
  isLoading: boolean;
};

export function RecentMessages({ messages, isLoading }: RecentMessagesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredMessages = searchTerm
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : messages;

  return (
    <FadeIn delay={0.4}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-poppins font-semibold">Recent Messages</h2>
          <Link 
            to="/messages" 
            className="text-primary-dark hover:text-primary-light dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition duration-300"
          >
            View All
          </Link>
        </div>
        
        <GlassmorphicCard className="overflow-hidden p-0">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
                search
              </span>
              <Input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-50 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"></div>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                {searchTerm ? "No messages matching your search" : "No messages yet"}
              </div>
            ) : (
              filteredMessages.slice(0, 5).map((message) => (
                <MessageItem key={message.id} message={message} />
              ))
            )}
          </div>
          
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <Link to="/messages">
              <button className="w-full py-2 text-sm font-medium text-center text-white btn-primary rounded-lg">
                New Message
              </button>
            </Link>
          </div>
        </GlassmorphicCard>
      </div>
    </FadeIn>
  );
}
