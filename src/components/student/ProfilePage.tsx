import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Edit, Share2, Award, Users, Heart, Flame, LogOut, Camera } from "lucide-react";

interface ProfilePageProps {
  user: any;
  onLogout: () => void;
}

const ProfilePage = ({ user, onLogout }: ProfilePageProps) => {
  const { t, lang, setLang } = useI18n();
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`;

  const stats = [
    { icon: Users, value: 24, label: t("profile.followers") },
    { icon: Award, value: 8, label: t("profile.achievements") },
    { icon: Heart, value: 156, label: t("profile.likes") },
  ];

  const certificates = [
    { title: lang === "kz" ? "Математика олимпиадасы" : "Олимпиада по математике", year: "2024" },
    { title: lang === "kz" ? "Үздік оқушы" : "Лучший ученик", year: "2024" },
    { title: lang === "kz" ? "Спорт жарысы" : "Спортивные соревнования", year: "2023" },
  ];

  return (
    <div className="px-4 pt-12">
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <img src={avatarUrl} alt="avatar" className="w-24 h-24 rounded-full bg-muted border-4 border-primary" />
          <div className="absolute bottom-0 right-0 w-8 h-8 gradient-primary rounded-full flex items-center justify-center border-2 border-card">
            <Camera className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
        <h2 className="text-xl font-black text-foreground mt-3">@{user.username}</h2>
        <p className="text-sm font-semibold text-muted-foreground">{user.class} • ID: {user.id?.slice(0, 8)}</p>
        <div className="flex items-center gap-1 mt-1">
          <Flame className="w-4 h-4 text-secondary" />
          <span className="text-sm font-bold text-secondary">7 {t("home.streak")}</span>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.95 }}
          className="flex-1 gradient-primary text-primary-foreground font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm">
          <Edit className="w-4 h-4" />
          {t("profile.edit")}
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }}
          className="flex-1 bg-muted text-foreground font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm">
          <Share2 className="w-4 h-4" />
          {t("profile.share")}
        </motion.button>
      </div>

      <div className="flex gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="flex-1 bg-card rounded-xl p-3 shadow-card text-center">
            <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-black text-foreground">{s.value}</p>
            <p className="text-[10px] font-bold text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-black text-foreground mb-3">{t("profile.certificates")}</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
        {certificates.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className="min-w-[140px] bg-card rounded-xl p-3 shadow-card border-2 border-primary/20">
            <Award className="w-8 h-8 text-primary mb-2" />
            <p className="text-xs font-bold text-foreground">{c.title}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{c.year}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-card rounded-xl p-4 shadow-card mb-4">
        <p className="text-sm font-bold text-foreground mb-2">{t("onboard.lang.title")}</p>
        <div className="flex gap-2">
          {(["kz", "ru"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${lang === l ? "gradient-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
              {l === "kz" ? "Қазақша" : "Русский"}
            </button>
          ))}
        </div>
      </div>

      <motion.button whileTap={{ scale: 0.95 }} onClick={onLogout}
        className="w-full bg-destructive/10 text-destructive font-bold py-3 rounded-xl flex items-center justify-center gap-2 mb-10">
        <LogOut className="w-4 h-4" />
        {t("profile.logout")}
      </motion.button>
    </div>
  );
};

export default ProfilePage;
