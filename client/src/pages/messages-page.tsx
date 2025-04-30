import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Message } from "@shared/schema";
import { MessagesList } from "@/components/messages/MessagesList";
import { MessageComposer } from "@/components/messages/MessageComposer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { GlassmorphicCard } from "@/components/ui/GlassmorphicCard";
import { FadeIn, SlideIn } from "@/components/ui/animation";

export default function MessagesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });
  
  // Filter messages based on search term
  const filteredMessages = searchTerm
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : messages;
  
  // Group messages by conversation
  const conversationMap = new Map();
  filteredMessages.forEach(message => {
    const partnerId = message.senderId === message.receiverId ? message.senderId : message.receiverId;
    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, []);
    }
    conversationMap.get(partnerId).push(message);
  });
  
  // Sort conversations by latest message
  const conversations = Array.from(conversationMap.entries())
    .map(([partnerId, messages]) => ({
      partnerId,
      messages: messages.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }))
    .sort((a, b) => 
      new Date(b.messages[0].createdAt).getTime() - new Date(a.messages[0].createdAt).getTime()
    );

  return (
    <Layout title="Messages">
      <FadeIn>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Communicate securely with your transaction partners
        </p>
      </FadeIn>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Messages List */}
        <SlideIn direction="up" className="lg:col-span-1">
          <GlassmorphicCard className="overflow-hidden p-0">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-50 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[60vh] overflow-y-auto">
              <MessagesList 
                messages={filteredMessages}
                isLoading={isLoading}
                onSelectMessage={(messageId) => setSelectedMessageId(messageId)}
                selectedMessageId={selectedMessageId}
              />
            </div>
            
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <Button className="w-full btn-primary">
                New Conversation
              </Button>
            </div>
          </GlassmorphicCard>
        </SlideIn>
        
        {/* Message Detail / Composer */}
        <SlideIn direction="up" delay={0.2} className="lg:col-span-2">
          <GlassmorphicCard className="h-full flex flex-col min-h-[60vh]">
            {selectedMessageId ? (
              <MessageComposer 
                partnerId={
                  messages.find(m => m.id === selectedMessageId)?.senderId ||
                  messages.find(m => m.id === selectedMessageId)?.receiverId || 0
                }
                transactionId={messages.find(m => m.id === selectedMessageId)?.transactionId}
              />
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mb-4">
                  <span className="material-icons text-white text-3xl">chat</span>
                </div>
                <h3 className="text-xl font-medium mb-2">Select a Conversation</h3>
                <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
                  Choose a conversation from the list or start a new one to communicate securely with your transaction partners.
                </p>
              </div>
            )}
          </GlassmorphicCard>
        </SlideIn>
      </div>
    </Layout>
  );
}
