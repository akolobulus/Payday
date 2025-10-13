import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Bot, Send, Sparkles } from "lucide-react";
import type { AIAssistantChat } from "@shared/schema";

interface AIAssistantProps {
  userId: string;
}

export default function AIAssistant({ userId }: AIAssistantProps) {
  const [message, setMessage] = useState("");

  const { data: chatHistory = [] } = useQuery<AIAssistantChat[]>({
    queryKey: ['/api/ai/chats', userId],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (msg: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", {
        userId,
        message: msg,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/chats', userId] });
      setMessage("");
    },
  });

  const handleSend = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-payday-blue" />
          Zee - Your AI Assistant
        </CardTitle>
        <CardDescription>
          Get gig suggestions, coaching, and help with your career
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {chatHistory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-payday-blue opacity-50" />
                <p>Ask me anything! I can help you find gigs, improve your profile, or give career advice.</p>
              </div>
            ) : (
              chatHistory.map((chat) => (
                <div key={chat.id} className="space-y-2">
                  <div className="flex justify-end">
                    <div className="bg-payday-blue text-white rounded-lg px-4 py-2 max-w-[80%]">
                      {chat.message}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 max-w-[80%]">
                      {chat.response}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            data-testid="input-ai-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask Zee anything..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={sendMessageMutation.isPending}
          />
          <Button
            data-testid="button-send-ai-message"
            onClick={handleSend}
            disabled={sendMessageMutation.isPending || !message.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
