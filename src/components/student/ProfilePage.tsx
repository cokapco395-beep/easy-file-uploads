import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { Edit, Share2, Award, Users, Heart, Flame, LogOut, Camera, Star } from "lucide-react";

interface ProfilePageProps {
  user: any;
  onLogout: () => void;
}

const ProfilePage = ({ user, onLogout }: ProfilePageProps) => {
  const { t, lang, setLang } = useI18n();
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`;

  const [achievements, setAchievements] = useState<any[]>([]);
  const [profile, setProfile] = useState(user);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    // Refresh profile data
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (profileData) setProfile(profileData);

    // Load user achievements
    const { data: userAch } = await supabase
      .from("user_achievements")
      .select("*, achievements(*)")
      .eq("user_id", user.id);
    if (userAch) setAchievements(userAch);
  };

  const stats = [
    { icon: Star, value: profile.xp || 0, label: "XP" },
    { icon: Award, value: achievements.length, label: t("profile.achievements") },
    { icon: Flame, value: profile.level || 1, label: t("home.level") },
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
        <h2 className="text-xl font-black text-foreground mt-3">@{profile.username}</h2>
        <p className="text-sm font-semibold text-muted-foreground">{profile.full_name}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {t("home.level")} {profile.level || 1} • {profile.xp || 0} XP • {profile.sphere_coins || 0} 🪙
        </p>
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

      {/* Achievements */}
      <h3 className="text-lg font-black text-foreground mb-3">{t("home.achievements")}</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
        {achievements.length > 0 ? achievements.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className="min-w-[80px] bg-card rounded-xl p-3 shadow-card text-center border-2 border-primary/20">
            <span className="text-2xl">{a.achievements?.icon}</span>
            <p className="text-[10px] font-bold text-foreground mt-1">{a.achievements?.title}</p>
          </motion.div>
        )) : (
          <p className="text-sm text-muted-foreground">{lang === "kz" ? "Жетістіктер әлі жоқ" : "Достижений пока нет"}</p>
        )}
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="bg-card rounded-xl p-4 shadow-card mb-4">
          <p className="text-sm font-bold text-foreground mb-1">{t("profile.about")}</p>
          <p className="text-sm text-muted-foreground">{profile.bio}</p>
        </div>
      )}

      {/* Language */}
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
