
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Download, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { storageUtils } from '@/utils/storage';
import { exportUtils } from '@/utils/export';

interface Message {
  id: string;
  content: string;
  role: 'human' | 'bot';
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export const ChatInterface = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentRole, setCurrentRole] = useState<'human' | 'bot'>('human');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  useEffect(() => {
    const loaded = storageUtils.loadConversations();
    setConversations(loaded);
    if (loaded.length > 0) {
      setActiveConversationId(loaded[0].id);
    }
  }, []);

  useEffect(() => {
    storageUtils.saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
  };

  const deleteConversation = (convId: string) => {
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConversationId === convId) {
      const remaining = conversations.filter(c => c.id !== convId);
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
    toast({
      title: "Conversation deleted",
      description: "The conversation has been removed.",
    });
  };

  const sendMessage = () => {
    if (!currentMessage.trim() || !activeConversationId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage.trim(),
      role: currentRole,
      timestamp: new Date()
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversationId) {
        const updatedMessages = [...conv.messages, newMessage];
        const title = conv.title === 'New Conversation' && updatedMessages.length === 1
          ? currentMessage.slice(0, 50) + (currentMessage.length > 50 ? '...' : '')
          : conv.title;
        
        return {
          ...conv,
          messages: updatedMessages,
          title,
          updatedAt: new Date()
        };
      }
      return conv;
    }));

    setCurrentMessage('');
    setCurrentRole(currentRole === 'human' ? 'bot' : 'human');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const exportConversation = () => {
    if (!activeConversation) return;
    
    exportUtils.exportAsMarkdown(activeConversation);
    toast({
      title: "Exported successfully",
      description: "Conversation downloaded as markdown file.",
    });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-muted/30 border-r flex flex-col overflow-hidden`}>
        <div className="p-4 border-b">
          <Button onClick={createNewConversation} className="w-full" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            New Conversation
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map((conv) => (
            <Card 
              key={conv.id}
              className={`p-3 mb-2 cursor-pointer hover:bg-accent transition-colors ${
                activeConversationId === conv.id ? 'bg-accent border-primary' : ''
              }`}
              onClick={() => setActiveConversationId(conv.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium truncate">{conv.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {conv.messages.length} messages • {new Date(conv.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between bg-background/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold">
              {activeConversation?.title || 'Select a conversation'}
            </h1>
          </div>
          
          {activeConversation && (
            <Button variant="outline" size="sm" onClick={exportConversation}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeConversation?.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'human' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${message.role === 'human' ? 'order-2' : 'order-1'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {message.role === 'human' ? (
                    <User className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-green-600" />
                  )}
                  <Badge variant={message.role === 'human' ? 'default' : 'secondary'} className="text-xs">
                    {message.role === 'human' ? 'You' : 'Assistant'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <Card className={`p-3 ${
                  message.role === 'human' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </Card>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {activeConversationId && (
          <div className="border-t p-4 bg-background/95 backdrop-blur">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant={currentRole === 'human' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentRole('human')}
              >
                <User className="w-3 h-3 mr-1" />
                Human
              </Button>
              <Button
                variant={currentRole === 'bot' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentRole('bot')}
              >
                <Bot className="w-3 h-3 mr-1" />
                Assistant
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Type your message as ${currentRole}...`}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!currentMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!activeConversationId && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Start a new conversation</h2>
              <p className="text-muted-foreground mb-4">
                Create a conversation to start taking notes with yourself
              </p>
              <Button onClick={createNewConversation}>
                <Plus className="w-4 h-4 mr-2" />
                New Conversation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
