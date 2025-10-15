
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { chat } from '@/ai/flows/chat';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { agentImages } from '@/data/agent-images';

type Message = {
  role: 'user' | 'model';
  content: string;
};

const chatbotIconUrl = 'https://img.freepik.com/premium-vector/cartoon-artificial-intelligence-chatbot-illustration-children-s-day-toy-game-vector-icon-clip-art_737376-1329.jpg';


export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, isUserLoading } = useUser();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [avatarColor, setAvatarColor] = useState<string | null>(null);

  useEffect(() => {
    if (user?.photoURL) {
      const agent = agentImages.find(a => a.url === user.photoURL);
      if (agent) {
        setAvatarColor(agent.color);
      } else {
        setAvatarColor(null);
      }
    } else {
      setAvatarColor(null);
    }
  }, [user]);


  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsLoading(true);
      setTimeout(() => {
        setMessages([
          {
            role: 'model',
            content: "Hey! I'm your TribeXeSports Gaming Assistant. Ask me anything about games, eSports, or strategies!",
          },
        ]);
        setIsLoading(false);
      }, 700);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            setTimeout(() => {
                viewport.scrollTop = viewport.scrollHeight;
            }, 100);
        }
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const historyForAI = messages.map(msg => ({
        role: msg.role,
        content: [{ text: msg.content }]
      }));

      const responseText = await chat({
        history: historyForAI,
        prompt: currentInput,
      });
      
      setMessages((prev) => [...prev, { role: 'model', content: responseText }]);

    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: "Sorry, I'm having trouble connecting right now. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const ChatBubble = ({ message }: { message: Message }) => {
    const isUser = message.role === 'user';
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                'flex items-start gap-3 w-full',
                isUser ? 'justify-end' : 'justify-start'
            )}
        >
            {!isUser && (
                <Avatar className="h-8 w-8 border-2 border-primary overflow-visible">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/20">
                         <Image src={chatbotIconUrl} alt="Chatbot Icon" width={32} height={32} className="rounded-full" />
                    </div>
                </Avatar>
            )}
            <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-md',
                  isUser
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-dashboard-sidebar rounded-bl-none text-white'
                )}
              >
                <div className="leading-relaxed prose prose-sm text-white" dangerouslySetInnerHTML={{ __html: message.content }} />
              </div>
            {isUser && user && (
                <Avatar className="h-8 w-8 border-2" style={{ borderColor: avatarColor ? `hsl(${avatarColor})` : 'hsl(var(--accent))' }}>
                    <AvatarImage src={user.photoURL || undefined} alt="Your avatar" />
                    <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
            )}
        </motion.div>
    );
  };

  const chatWindowStyle = avatarColor
    ? {
        borderColor: `hsl(${avatarColor} / 0.4)`,
        boxShadow: `0 0 25px -5px hsl(${avatarColor} / 0.4), 0 0 40px -15px hsl(${avatarColor} / 0.6)`,
      }
    : {
        borderColor: 'hsl(var(--primary) / 0.2)',
        boxShadow: '0 0 25px -5px hsl(var(--primary) / 0.1), 0 0 40px -15px hsl(var(--primary) / 0.2)',
      };

  if (isUserLoading || !user) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
          <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="w-[calc(100vw-2rem)] max-w-md h-[70vh] max-h-[600px] bg-dashboard-card/80 backdrop-blur-xl border rounded-2xl flex flex-col origin-bottom-right"
                    style={chatWindowStyle}
                >
                    <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'hsl(var(--border) / 0.5)' }}>
                        <div className="flex items-center gap-3">
                        <div className="relative">
                           <Image src={chatbotIconUrl} alt="Chatbot Icon" width={32} height={32} className="rounded-full" />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                            </span>
                        </div>
                        <h3 className="text-lg font-headline font-bold text-white">TribeXeSports Gaming Assistant</h3>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                        <div className="space-y-6">
                        {messages.map((message, index) => (
                            <ChatBubble key={index} message={message} />
                        ))}
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-3 justify-start"
                            >
                                <Avatar className="h-8 w-8 border-2 border-primary">
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/20">
                                         <Image src={chatbotIconUrl} alt="Chatbot Icon" width={20} height={20} className="rounded-full" />
                                    </div>
                                </Avatar>
                                <div className="bg-dashboard-sidebar text-foreground rounded-2xl rounded-bl-none px-4 py-3 flex gap-2 items-center">
                                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-pulse delay-0"></span>
                                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-pulse delay-150"></span>
                                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-pulse delay-300"></span>
                                </div>
                            </motion.div>
                        )}
                        </div>
                    </ScrollArea>
                    <form onSubmit={handleSubmit} className="p-4 border-t" style={{ borderColor: 'hsl(var(--border) / 0.5)' }}>
                        <div className="relative">
                            <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about a game..."
                            className="bg-background border-border/50 focus-visible:ring-1 pr-12 transition-colors text-white"
                            disabled={isLoading}
                            style={{borderColor: avatarColor ? `hsl(${avatarColor})` : 'hsl(var(--primary))'}}
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-10" style={{backgroundColor: avatarColor ? `hsl(${avatarColor})` : 'hsl(var(--primary))'}}>
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            )}
          </AnimatePresence>
      </div>

       <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        className={cn(
            "fixed bottom-6 right-6 h-40 w-40 rounded-full z-50 flex items-center justify-center p-0 transition-all duration-300 ease-in-out",
            isOpen && "scale-0 opacity-0"
            )}
        >
        {user?.photoURL ? (
            <Avatar className="h-40 w-40 border-4" style={{borderColor: avatarColor ? `hsl(${avatarColor})` : 'hsl(var(--primary))'}}>
              <AvatarImage src={user.photoURL} alt="Your avatar" />
              <AvatarFallback>
                <MessageSquare className="h-20 w-20" />
              </AvatarFallback>
            </Avatar>
        ) : (
            <MessageSquare className="h-20 w-20 text-primary" />
        )}
      </Button>
    </>
  );
}
