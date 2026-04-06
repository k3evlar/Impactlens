import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "bot", text: "Hello! I am your environmental AI assistant. How can I help you regarding carbon tracking today?" }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const currentInput = input.trim();
    const newMsg: Message = { id: Date.now().toString(), sender: "user", text: currentInput };
    
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setIsLoading(true);

    const messageText = currentInput.toLowerCase();
    if (messageText.includes("my credits") || messageText.includes("how many credits")) {
      try {
        const userStr = localStorage.getItem("user");
        let credits = 0;
        if (userStr) {
          const user = JSON.parse(userStr);
          const dataStr = localStorage.getItem(`data_${user.email}`);
          if (dataStr) credits = JSON.parse(dataStr).credits || 0;
        }
        setTimeout(() => {
          const botMsg: Message = { 
            id: Date.now().toString() + "-ai", 
            sender: "bot",
            text: `You currently have **${credits}** securely earned Carbon Credits! 🌱 Navigate to the Rewards Marketplace in your sidebar to exchange them for NFTs or global conservation footprints.`, 
          };
          setMessages((prev) => [...prev, botMsg]);
          setIsLoading(false);
        }, 800);
        return;
      } catch (e) {}
    }

    // Map conversation dynamically tracking contextual histories formatted strictly towards OpenRouter APIs
    const conversation = messages.map(m => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text
    }));
    
    // Inject the newest active query
    conversation.push({ role: "user", content: currentInput });

    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error("Missing OpenRouter connection string environment flag.");
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "SecureCarbonX"
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an AI assistant for a sustainability platform called SecureCarbonX. Help users understand carbon credits, sustainability, and how to use the platform features like earning, tracking, and redeeming credits."
            },
            ...conversation
          ]
        })
      });

      if (!response.ok) {
        throw new Error("Target upstream host routing validation completely failed.");
      }

      const data = await response.json();
      const botResponse = data.choices[0].message.content;

      setMessages(prev => [
        ...prev, 
        { id: Date.now().toString(), sender: "bot", text: botResponse }
      ]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [
         ...prev, 
         { id: Date.now().toString(), sender: "bot", text: "Sorry, something went wrong. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-80 sm:w-96 bg-card border border-primary/20 rounded-2xl shadow-2xl overflow-hidden mb-4 flex flex-col backdrop-blur-xl"
            style={{ height: "500px", maxHeight: "calc(100vh - 120px)" }}
          >
            {/* Header */}
            <div className="bg-primary/5 border-b border-primary/20 p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm">AI Assistant</h3>
                  <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium tracking-wide">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Active
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-end gap-2.5 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.sender === "user" ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary border border-primary/20"}`}>
                      {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.sender === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border/50 text-foreground rounded-bl-sm"}`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Responsive Loading Typist Physics */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-end gap-2.5 max-w-[85%] flex-row">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-primary/10 text-primary border border-primary/20">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm bg-card border border-border/50 text-foreground rounded-bl-sm flex items-center gap-1.5 h-[38px]">
                      <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Region */}
            <div className="p-3 border-t border-border/50 bg-card">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2 relative bg-background border border-border/50 rounded-full pr-1.5 pl-4 py-1.5 shadow-inner"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent text-sm focus:outline-none transition-all placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0"
                >
                  <Send className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-[0_4px_25px_hsl(142_71%_45%/0.4)] flex items-center justify-center transition-all z-50 overflow-hidden relative group"
            title="Chat with AI"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-12 group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-full" />
            <MessageSquare className="w-6 h-6 relative z-10" />
            <span className="absolute top-3.5 right-3.5 flex h-2.5 w-2.5 z-20">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400 border-2 border-primary"></span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
