import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Flame, TrendingUp, Sparkles, Heart, MessageSquare } from "lucide-react";

interface HomePageProps {
  user: any;
}

const HomePage = ({ user }: HomePageProps) => {
  const { t } = useI18n();
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`;

  const todayGrades = [
    { subject: t("lang") === "kz" ? "Математика" : "Математика", grade: 5, color: "bg-accent" },
    { subject: t("lang") === "kz" ? "Қазақ тілі" : "Русский язык", grade: 4, color: "bg-secondary" },
    { subject: t("lang") === "kz" ? "Тарих" : "История", grade: 5, color: "bg-primary" },
  ];

  const feedPosts = [
    {
      author: t("lang") === "kz" ? "Мектеп әкімшілігі" : "Администрация школы",
      avatar: "Admin",
      text: t("lang") === "kz"
        ? "🎉 Құттықтаймыз! Біздің мектеп олимпиадада 1-ші орын алды!"
        : "🎉 Поздравляем! Наша школа заняла 1 место на олимпиаде!",
      time: "2ч",
      likes: 45,
      comments: 12,
      image: null,
    },
    {
      author: t("lang") === "kz" ? "Спорт клубы" : "Спортивный клуб",
      avatar: "Sport",
      text: t("lang") === "kz"
        ? "⚽ Ертең футбол турнирі! Барлығын шақырамыз!"
        : "⚽ Завтра футбольный турнир! Приглашаем всех!",
      time: "4ч",
      likes: 23,
      comments: 5,
      image: null,
    },
  ];

  return (
    <div className="px-4 pt-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src={avatarUrl} alt="avatar" className="w-12 h-12 rounded-full bg-muted" />
          <div>
            <p className="text-sm text-muted-foreground font-semibold">{t("home.greeting")},</p>
            <h1 className="text-xl font-black text-foreground">@{user.username} 👋</h1>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-secondary/20 px-3 py-1.5 rounded-full">
          <Flame className="w-5 h-5 text-secondary" />
          <span className="font-black text-secondary">7</span>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="gradient-primary rounded-2xl p-4 mb-4 flex items-center gap-3">
        <Sparkles className="w-8 h-8 text-primary-foreground flex-shrink-0" />
        <div>
          <p className="text-primary-foreground font-bold text-sm">Sphere AI</p>
          <p className="text-primary-foreground/90 text-sm">
            {t("home.greeting")}, @{user.username}! {t("home.aiMessage")}
          </p>
        </div>
      </motion.div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-foreground">{t("home.todayGrades")}</h2>
          <TrendingUp className="w-5 h-5 text-accent" />
        </div>
        <div className="flex gap-2">
          {todayGrades.map((g, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              className="flex-1 bg-card rounded-xl p-3 shadow-card text-center">
              <div className={`w-10 h-10 ${g.color} rounded-lg mx-auto flex items-center justify-center mb-2`}>
                <span className="text-primary-foreground font-black text-lg">{g.grade}</span>
              </div>
              <p className="text-xs font-bold text-muted-foreground truncate">{g.subject}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 shadow-card mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">{t("home.rating")}</p>
          <p className="text-2xl font-black text-foreground">#3 <span className="text-sm text-accent font-bold">↑2</span></p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-muted-foreground">{t("home.streak")}</p>
          <div className="flex items-center gap-1 justify-end">
            <Flame className="w-5 h-5 text-secondary" />
            <span className="text-2xl font-black text-secondary">7</span>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-black text-foreground mb-3">{t("home.feed")}</h2>
      {feedPosts.map((post, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          className="bg-card rounded-2xl p-4 shadow-card mb-3">
          <div className="flex items-center gap-3 mb-3">
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${post.avatar}`} alt="" className="w-10 h-10 rounded-full bg-muted" />
            <div className="flex-1">
              <p className="font-bold text-foreground text-sm">{post.author}</p>
              <p className="text-xs text-muted-foreground">{post.time}</p>
            </div>
          </div>
          <p className="text-foreground text-sm mb-3">{post.text}</p>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-muted-foreground">
              <Heart className="w-4 h-4" />
              <span className="text-xs font-bold">{post.likes}</span>
            </button>
            <button className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-bold">{post.comments}</span>
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default HomePage;
