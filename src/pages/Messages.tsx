
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useUserStore } from "@/store/userStore";
import { useMessageStore } from "@/store/messageStore";
import { Send, MessageSquare } from "lucide-react";

const Messages = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, users } = useUserStore();
  const { messages, addMessage, markAsRead, markAllAsRead } = useMessageStore();
  const { toast } = useToast();
  
  const [newMessage, setNewMessage] = useState("");
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    
    // Mark messages as read when viewing them
    messages.forEach(msg => {
      if (!msg.isRead) {
        markAsRead(msg.id);
      }
    });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to send messages",
        variant: "destructive",
      });
      return;
    }
    
    addMessage({
      senderId: currentUser.id,
      content: newMessage,
      isAnnouncement: isAnnouncement && currentUser.role === "founder",
    });
    
    setNewMessage("");
    
    toast({
      title: "Message Sent",
      description: isAnnouncement ? "Announcement has been broadcast to all employees" : "Message sent successfully",
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) + " - " + date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };
  
  const getSenderName = (senderId: string) => {
    const sender = users.find(user => user.id === senderId);
    return sender?.name || "Unknown User";
  };
  
  const isCurrentUserMessage = (senderId: string) => {
    return currentUser?.id === senderId;
  };
  
  // Sort messages by timestamp (oldest first)
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  return (
    <PageLayout>
      <div className="flex h-full flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>
        
        <Card className="flex flex-1 flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Team Communications
            </CardTitle>
            <CardDescription>
              Send messages and announcements to your team
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden">
            <div className="h-[calc(100vh-350px)] overflow-y-auto p-2">
              {sortedMessages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedMessages.map((msg) => {
                    const isCurrentUser = isCurrentUserMessage(msg.senderId);
                    const senderName = getSenderName(msg.senderId);
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.isAnnouncement
                              ? "bg-primary/10 text-foreground"
                              : isCurrentUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          } ${msg.isAnnouncement ? "w-full" : ""}`}
                        >
                          {msg.isAnnouncement && (
                            <div className="mb-1 flex items-center">
                              <span className="text-xs font-semibold uppercase text-primary">
                                Announcement
                              </span>
                            </div>
                          )}
                          
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-medium">{senderName}</span>
                            <span className="text-xs opacity-70">
                              {formatDate(msg.timestamp)}
                            </span>
                          </div>
                          
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </CardContent>
          
          <Separator />
          
          <CardFooter className="pt-4">
            <div className="w-full space-y-4">
              {currentUser?.role === "founder" && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="announcement-mode"
                    checked={isAnnouncement}
                    onCheckedChange={setIsAnnouncement}
                  />
                  <Label htmlFor="announcement-mode">Send as announcement</Label>
                </div>
              )}
              
              <div className="flex items-end gap-2">
                <Textarea
                  placeholder="Type your message here..."
                  className="min-h-[80px] resize-none"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  className="h-10 w-10 rounded-full p-0"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Messages;
