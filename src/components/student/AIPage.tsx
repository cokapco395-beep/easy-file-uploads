import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Send, Sparkles } from "lucide-react";

interface AIPageProps {
  user: any;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AIPage = ({ user }: AIPageProps) => {
  const { t, lang } = useI18n();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: lang === "kz"
        ? `Сәлем, @${user.username}! 🎓 Мен Sphere AI — сенің оқу көмекшіңмін. Маған кез келген сұрақ қой!`
        : `Привет, @${user.username}! 🎓 Я Sphere AI — твой учебный помощник. Задай мне любой вопрос!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Mock AI response
    setTimeout(() => {
      const aiContent = lang === "kz"
        ? "Бұл жақсы сұрақ! Мен саған көмектесуге дайынмын. 📚"
        : "Отличный вопрос! Я готов тебе помочь. 📚";
      setMessages((prev) => [...prev, { role: "assistant", content: aiContent }]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="gradient-primary px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-black text-primary-foreground">Sphere AI</h1>
            <p className="text-xs text-primary-foreground/70 font-semibold">
              {lang === "kz" ? "Оқу көмекшісі" : "Учебный помощник"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
              msg.role === "user"
                ? "gradient-primary text-primary-foreground rounded-br-md"
                : "bg-muted text-foreground rounded-bl-md"
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 pb-24 pt-2 bg-background border-t border-border">
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={lang === "kz" ? "Сұрақ жазыңыз..." : "Напишите вопрос..."}
            className="flex-1 bg-muted rounded-xl px-4 py-3 text-foreground font-semibold outline-none focus:ring-2 focus:ring-primary" />
          <motion.button whileTap={{ scale: 0.9 }} onClick={sendMessage} disabled={loading || !input.trim()}
            className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-button disabled:opacity-50">
            <Send className="w-5 h-5 text-primary-foreground" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AIPage;
