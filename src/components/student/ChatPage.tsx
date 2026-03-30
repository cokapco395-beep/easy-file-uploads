import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Send, Search } from "lucide-react";

interface ChatPageProps {
  user: any;
}

interface ChatMsg {
  id: string;
  sender: string;
  senderAvatar: string;
  text: string;
  time: string;
  isMe: boolean;
}

const ChatPage = ({ user }: ChatPageProps) => {
  const { lang } = useI18n();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const chatList = [
    { id: "class", name: lang === "kz" ? "7А сынып чаты" : "Чат 7А класса", lastMsg: lang === "kz" ? "Ертең тест бар!" : "Завтра тест!", avatar: "ClassChat", unread: 3 },
    { id: "math", name: lang === "kz" ? "Математика" : "Математика", lastMsg: lang === "kz" ? "Үй тапсырмасын жібердім" : "Отправил домашку", avatar: "MathChat", unread: 0 },
    { id: "friend", name: "Arman", lastMsg: lang === "kz" ? "Кездесеміз бе?" : "Встретимся?", avatar: "Arman", unread: 1 },
  ];

  const mockMessages: ChatMsg[] = [
    { id: "1", sender: "Teacher", senderAvatar: "Teacher", text: lang === "kz" ? "Сәлем балалар! Ертең тест бар" : "Привет ребята! Завтра тест", time: "09:00", isMe: false },
    { id: "2", sender: user.username, senderAvatar: user.username, text: lang === "kz" ? "Қандай тақырыптан?" : "По какой теме?", time: "09:05", isMe: true },
    { id: "3", sender: "Teacher", senderAvatar: "Teacher", text: lang === "kz" ? "3-ші тарау бойынша" : "По 3 главе", time: "09:10", isMe: false },
  ];

  if (!selectedChat) {
    return (
      <div className="px-4 pt-12">
        <h1 className="text-2xl font-black text-foreground mb-4">
          {lang === "kz" ? "💬 Чат" : "💬 Чат"}
        </h1>
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input placeholder={lang === "kz" ? "Іздеу..." : "Поиск..."}
            className="w-full bg-muted rounded-xl pl-10 pr-4 py-2.5 text-foreground text-sm font-semibold outline-none" />
        </div>
        <div className="space-y-2">
          {chatList.map((chat) => (
            <motion.button key={chat.id} whileTap={{ scale: 0.98 }} onClick={() => setSelectedChat(chat.id)}
              className="w-full bg-card rounded-xl p-3 shadow-card flex items-center gap-3 text-left">
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${chat.avatar}`} alt="" className="w-12 h-12 rounded-full bg-muted" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm">{chat.name}</p>
                <p className="text-xs text-muted-foreground truncate">{chat.lastMsg}</p>
              </div>
              {chat.unread > 0 && (
                <span className="w-5 h-5 gradient-primary rounded-full text-[10px] text-primary-foreground font-black flex items-center justify-center">
                  {chat.unread}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-card border-b border-border px-4 pt-12 pb-3 flex items-center gap-3">
        <button onClick={() => setSelectedChat(null)} className="text-foreground font-bold">←</button>
        <h2 className="font-black text-foreground">{chatList.find(c => c.id === selectedChat)?.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {mockMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
              msg.isMe ? "gradient-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
            }`}>
              {!msg.isMe && <p className="text-[10px] font-bold text-primary mb-0.5">{msg.sender}</p>}
              <p>{msg.text}</p>
              <p className={`text-[10px] mt-0.5 text-right ${msg.isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-24 pt-2 bg-background border-t border-border">
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            placeholder={lang === "kz" ? "Хабарлама..." : "Сообщение..."}
            className="flex-1 bg-muted rounded-xl px-4 py-3 text-foreground font-semibold outline-none" />
          <motion.button whileTap={{ scale: 0.9 }}
            className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-button">
            <Send className="w-5 h-5 text-primary-foreground" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
