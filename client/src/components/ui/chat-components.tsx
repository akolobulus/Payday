import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Send, MessageCircle, Clock, Check, CheckCheck } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Message, User, Gig } from "@shared/schema";

interface ChatComponentProps {
  gig: Gig;
  currentUser: User;
  otherUser?: User;
}

interface MessageWithSender extends Message {
  sender?: User;
  receiver?: User;
}

export function ChatComponent({ gig, currentUser, otherUser }: ChatComponentProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Determine the other user in the conversation
  const receiverId = otherUser?.id || (gig.posterId === currentUser.id ? gig.seekerId : gig.posterId);
  
  // Fetch messages for this gig
  const { data: messages, isLoading } = useQuery<MessageWithSender[]>({
    queryKey: ['/api/messages/gig', gig.id],
    enabled: isOpen && !!receiverId,
    refetchInterval: 3000, // Poll for new messages every 3 seconds
  });

  // Fetch unread message count
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ['/api/messages/unread-count', gig.id],
    refetchInterval: 5000, // Check for unread messages every 5 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('/api/messages', 'POST', {
        gigId: gig.id,
        receiverId,
        content,
        type: 'text'
      });
      return await response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/messages/gig', gig.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/unread-count'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Could not send message",
        variant: "destructive",
      });
    }
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return apiRequest(`/api/messages/${messageId}/read`, 'PATCH');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/gig', gig.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/unread-count'] });
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark unread messages as read when chat is opened
  useEffect(() => {
    if (isOpen && messages) {
      const unreadMessages = messages.filter(msg => 
        msg.receiverId === currentUser.id && !msg.isRead
      );
      unreadMessages.forEach(msg => {
        markAsReadMutation.mutate(msg.id);
      });
    }
  }, [isOpen, messages, currentUser.id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !receiverId) return;
    
    sendMessageMutation.mutate(newMessage.trim());
  };

  const formatMessageTime = (date: Date | string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return messageDate.toLocaleDateString();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (!receiverId) {
    return null; // Can't chat if there's no other user
  }

  const unreadCount = unreadData?.count || 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative" data-testid={`chat-button-${gig.id}`}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Chat - {gig.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 px-1">
            <div className="space-y-4 pb-4">
              {isLoading ? (
                <div className="text-center text-gray-500 mt-8">
                  Loading messages...
                </div>
              ) : messages && messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        message.senderId === currentUser.id
                          ? 'bg-blue-500 text-white ml-4'
                          : 'bg-gray-100 dark:bg-gray-800 mr-4'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.senderId !== currentUser.id && (
                          <Avatar className="h-6 w-6 mt-1">
                            <AvatarFallback className="text-xs">
                              {otherUser ? getInitials(otherUser.firstName, otherUser.lastName) : '?'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1">
                          <p className="text-sm break-words">{message.content}</p>
                          <div className={`flex items-center justify-between mt-1 text-xs ${
                            message.senderId === currentUser.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <span>{formatMessageTime(message.createdAt || new Date())}</span>
                            {message.senderId === currentUser.id && (
                              <div className="ml-2">
                                {message.isRead ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 mt-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2 pt-4 border-t">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={sendMessageMutation.isPending}
              className="flex-1"
              data-testid={`message-input-${gig.id}`}
            />
            <Button 
              type="submit" 
              size="sm"
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              data-testid={`send-message-${gig.id}`}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ChatListProps {
  currentUser: User;
}

export function ChatList({ currentUser }: ChatListProps) {
  // Get all gigs where the user is involved and has messages
  const { data: myGigs } = useQuery<Gig[]>({
    queryKey: currentUser.userType === 'seeker' 
      ? ['/api/gigs/my-applications']
      : ['/api/gigs/posted']
  });

  // Get unread message counts for all gigs
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ['/api/messages/unread-count'],
    refetchInterval: 5000,
  });

  const gigsWithMessages = myGigs?.filter(gig => 
    gig.status === 'assigned' || gig.status === 'pending_completion' || 
    gig.status === 'awaiting_mutual_confirmation' || gig.status === 'completed'
  ) || [];

  const totalUnreadCount = unreadData?.count || 0;

  if (gigsWithMessages.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold mb-2">No Active Chats</h3>
          <p className="text-gray-500">
            Once you have assigned gigs, you'll be able to chat with the other party here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Active Chats</span>
          </span>
          {totalUnreadCount > 0 && (
            <Badge variant="destructive">{totalUnreadCount}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {gigsWithMessages.map((gig) => (
          <div key={gig.id} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex-1">
              <h4 className="font-medium text-sm" data-testid={`chat-gig-title-${gig.id}`}>
                {gig.title}
              </h4>
              <p className="text-xs text-gray-500">
                With: {currentUser.userType === 'seeker' ? 'Gig Poster' : 'Gig Seeker'}
              </p>
            </div>
            <ChatComponent 
              gig={gig} 
              currentUser={currentUser}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}