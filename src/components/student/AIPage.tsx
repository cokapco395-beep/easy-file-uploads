import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { supabase, callAlemAI } from "@/lib/supabase";
import { Send, Sparkles, Plus, MessageSquare, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AIPageProps {
  user: any;
}

interface AIConvo {
  id: string;
  title: string;
  created_at: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AIPage = ({ user }: AIPageProps) => {
  const { lang } = useI18n();
  const [conversations, setConversations] = useState<AIConvo[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    const { data } = await supabase
      .from("ai_conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setConversations(data);
  };

  const loadMessages = async (convoId: string) => {
    setActiveConvoId(convoId);
    setShowSidebar(false);
    const { data } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", convoId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data.map((m: any) => ({ role: m.role, content: m.content })));
  };

  const createNewConvo = async () => {
    const title = lang === "kz" ? "Жаңа чат" : "Новый чат";
    const { data } = await supabase
      .from("ai_conversations")
      .insert({ user_id: user.id, title })
      .select()
      .single();
    if (data) {
      setConversations((prev) => [data, ...prev]);
      setActiveConvoId(data.id);
      setMessages([]);
      setShowSidebar(false);
    }
  };

  const deleteConvo = async (id: string) => {
    await supabase.from("ai_conversations").delete().eq("id", id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvoId === id) {
      setActiveConvoId(null);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    let convoId = activeConvoId;
    if (!convoId) {
      const title = input.trim().slice(0, 50);
      const { data } = await supabase
        .from("ai_conversations")
        .insert({ user_id: user.id, title })
        .select()
        .single();
      if (data) {
        convoId = data.id;
        setActiveConvoId(data.id);
        setConversations((prev) => [data, ...prev]);
      } else return;
    }

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Save user message
    await supabase.from("ai_messages").insert({
      conversation_id: convoId,
      role: "user",
      content: userMsg.content,
    });

    // Get student grades for context
    const { data: recentGrades } = await supabase
      .from("grades")
      .select("grade, type, subjects(name)")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    const gradesContext = recentGrades?.length
      ? `Последние оценки ученика: ${recentGrades.map((g: any) => `${g.subjects?.name}: ${g.grade} (${g.type})`).join(", ")}.`
      : "";

    const systemPrompt = lang === "kz"
      ? `Сен EduSphere платформасындағы Sphere AI — оқушылардың жеке AI көмекшісісің. Қазақ тілінде жауап бер. Оқушы аты: ${user.username}. ${gradesContext} Қысқа, нақты, пайдалы кеңес бер.`
      : `Ты Sphere AI — персональный AI-помощник ученика на платформе EduSphere. Отвечай на русском. Имя ученика: ${user.username}. ${gradesContext} Давай краткие, полезные советы.`;

    const allMsgs = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMsg.content },
    ];

    const aiResponse = await callAlemAI(allMsgs);
    const aiMsg: Message = { role: "assistant", content: aiResponse };
    setMessages((prev) => [...prev, aiMsg]);

    await supabase.from("ai_messages").insert({
      conversation_id: convoId,
      role: "assistant",
      content: aiResponse,
    });

    setLoading(false);
  };

  // Chat list sidebar
  if (showSidebar || !activeConvoId) {
    return (
      <div className="flex flex-col h-screen">
        <div className="gradient-primary px-4 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
            <h1 className="text-lg font-black text-primary-foreground">Sphere AI</h1>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={createNewConvo}
            className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary-foreground" />
          </motion.button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {conversations.length === 0 && (
            <div className="text-center py-20">
              <Sparkles className="w-16 h-16 text-primary/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-semibold">
                {lang === "kz" ? "Жаңа чат бастаңыз!" : "Начните новый чат!"}
              </p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={createNewConvo}
                className="mt-4 gradient-primary text-primary-foreground font-bold px-6 py-3 rounded-xl">
                {lang === "kz" ? "Жаңа чат" : "Новый чат"}
              </motion.button>
            </div>
          )}
          {conversations.map((c) => (
            <motion.div key={c.id} whileTap={{ scale: 0.98 }}
              className="bg-card rounded-xl p-4 shadow-card flex items-center gap-3 cursor-pointer"
              onClick={() => loadMessages(c.id)}>
              <MessageSquare className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm truncate">{c.title}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteConvo(c.id); }}
                className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="gradient-primary px-4 pt-12 pb-3 flex items-center gap-3">
        <button onClick={() => setShowSidebar(true)} className="text-primary-foreground font-bold text-xl">←</button>
        <Sparkles className="w-5 h-5 text-primary-foreground" />
        <h1 className="text-lg font-black text-primary-foreground">Sphere AI</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <Sparkles className="w-12 h-12 text-primary/20 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              {lang === "kz" ? "Сұрақ қойыңыз..." : "Задайте вопрос..."}
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
              msg.role === "user"
                ? "gradient-primary text-primary-foreground rounded-br-md"
                : "bg-muted text-foreground rounded-bl-md"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : msg.content}
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
