import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { Flame, TrendingUp, Sparkles, Heart, MessageSquare, Clock, AlertTriangle, Trophy, Star } from "lucide-react";

interface HomePageProps {
  user: any;
}

// Fallback mock data generator
function getBilimClassMock() {
  const subjects = ["Математика", "Физика", "Қазақ тілі", "Русский язык", "Информатика"];
  return subjects.map((s) => ({
    subject: s,
    grade: Math.floor(Math.random() * 4) + 2,
    type: Math.random() > 0.5 ? "БЖБ" : "ТЖБ",
  }));
}

const HomePage = ({ user }: HomePageProps) => {
  const { t, lang } = useI18n();
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`;

  const [grades, setGrades] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const xp = user.xp || 0;
  const level = user.level || 1;
  const xpForNext = level * 1000;
  const xpProgress = (xp % 1000) / 10; // percent

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Load subjects
    const { data: subjectsData } = await supabase.from("subjects").select("*");
    if (subjectsData && subjectsData.length > 0) {
      setSubjects(subjectsData);
    }

    // Load today's grades
    const today = new Date().toISOString().split("T")[0];
    const { data: gradesData, error: gradesError } = await supabase
      .from("grades")
      .select("*, subjects(name)")
      .eq("student_id", user.id)
      .gte("date", today)
      .order("created_at", { ascending: false });

    if (gradesData && gradesData.length > 0) {
      setGrades(gradesData);
    } else if (gradesError || !gradesData || gradesData.length === 0) {
      // BilimClass mock fallback
      const mock = getBilimClassMock();
      setGrades(mock.map((m, i) => ({
        id: `mock-${i}`,
        grade: m.grade,
        subjects: { name: m.subject },
        comment: m.type,
        isMock: true,
      })));
    }

    // Load today's lessons
    const dayOfWeek = new Date().getDay() || 7; // 1=Mon, 7=Sun
    const { data: lessonsData } = await supabase
      .from("lessons")
      .select("*, subjects(name)")
      .eq("class_id", user.class_id)
      .eq("day_of_week", dayOfWeek)
      .order("start_time", { ascending: true });

    if (lessonsData) setLessons(lessonsData);

    // Load leaderboard (top 5 by XP in same class)
    if (user.class_id) {
      const { data: leaderData } = await supabase
        .from("profiles")
        .select("id, username, xp, level, avatar_url")
        .eq("class_id", user.class_id)
        .order("xp", { ascending: false })
        .limit(5);
      if (leaderData) setLeaderboard(leaderData);
    }

    setLoading(false);
  };

  const getGradeColor = (grade: number) => {
    if (grade === 5) return "bg-accent";
    if (grade === 4) return "bg-primary";
    if (grade === 3) return "bg-secondary";
    return "bg-destructive";
  };

  const now = new Date();
  const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  // Calculate GPA by subject
  const subjectGPAs = subjects.map((s) => {
    const subjectGrades = grades.filter((g) => g.subjects?.name === s.name || g.subject_id === s.id);
    const avg = subjectGrades.length > 0
      ? subjectGrades.reduce((sum, g) => sum + g.grade, 0) / subjectGrades.length
      : 0;
    return { ...s, gpa: avg, count: subjectGrades.length };
  }).filter((s) => s.count > 0);

  return (
    <div className="px-4 pt-12 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src={avatarUrl} alt="avatar" className="w-12 h-12 rounded-full bg-muted" />
          <div>
            <p className="text-sm text-muted-foreground font-semibold">{t("home.greeting")},</p>
            <h1 className="text-xl font-black text-foreground">@{user.username} 👋</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-secondary/20 px-3 py-1.5 rounded-full">
            <Flame className="w-5 h-5 text-secondary" />
            <span className="font-black text-secondary">{level}</span>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="bg-card rounded-2xl p-4 shadow-card mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-muted-foreground">{t("home.level")} {level}</span>
          <span className="text-sm font-bold text-primary">{xp} / {xpForNext} XP</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full gradient-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} />
        </div>
      </div>

      {/* AI Insight */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="gradient-primary rounded-2xl p-4 mb-4 flex items-center gap-3">
        <Sparkles className="w-8 h-8 text-primary-foreground flex-shrink-0" />
        <div>
          <p className="text-primary-foreground font-bold text-sm">{t("home.aiInsight")}</p>
          <p className="text-primary-foreground/90 text-sm">
            {lang === "kz"
              ? `${user.username}, бүгін жақсы күн! Оқуды жалғастыр! 💪`
              : `${user.username}, сегодня отличный день! Продолжай учиться! 💪`}
          </p>
        </div>
      </motion.div>

      {/* Today's Grades */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-foreground">{t("home.todayGrades")}</h2>
          <TrendingUp className="w-5 h-5 text-accent" />
        </div>
        {grades.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {grades.slice(0, 5).map((g, i) => (
              <motion.div key={g.id || i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                className="min-w-[90px] bg-card rounded-xl p-3 shadow-card text-center flex-shrink-0">
                <div className={`w-10 h-10 ${getGradeColor(g.grade)} rounded-lg mx-auto flex items-center justify-center mb-2`}>
                  <span className="text-primary-foreground font-black text-lg">{g.grade}</span>
                </div>
                <p className="text-xs font-bold text-muted-foreground truncate">{g.subjects?.name || "—"}</p>
                {g.comment && <p className="text-[10px] text-muted-foreground/70">{g.comment}</p>}
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("home.noGrades")}</p>
        )}
      </div>

      {/* Subject GPA cards */}
      {subjectGPAs.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-black text-foreground mb-3">{t("home.performance")}</h2>
          <div className="grid grid-cols-2 gap-2">
            {subjectGPAs.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl p-3 shadow-card">
                <p className="text-xs font-bold text-muted-foreground truncate mb-1">{s.name}</p>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-black text-foreground">{s.gpa.toFixed(1)}</span>
                  {s.gpa >= 4 ? <TrendingUp className="w-4 h-4 text-accent" /> : <TrendingUp className="w-4 h-4 text-destructive rotate-180" />}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Schedule */}
      <div className="mb-5">
        <h2 className="text-lg font-black text-foreground mb-3">{t("home.schedule")}</h2>
        {lessons.length > 0 ? (
          <div className="space-y-2">
            {lessons.map((lesson, i) => {
              const isCurrent = currentTimeStr >= lesson.start_time?.slice(0, 5) && currentTimeStr <= lesson.end_time?.slice(0, 5);
              return (
                <motion.div key={lesson.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className={`bg-card rounded-xl p-3 shadow-card flex items-center gap-3 ${isCurrent ? "ring-2 ring-primary/50 bg-primary/5" : ""}`}>
                  <div className="flex flex-col items-center min-w-[50px]">
                    <Clock className={`w-4 h-4 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-xs font-bold text-muted-foreground">{lesson.start_time?.slice(0, 5)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-sm">{lesson.subjects?.name || "—"}</p>
                    {lesson.room && <p className="text-xs text-muted-foreground">Каб. {lesson.room}</p>}
                  </div>
                  {lesson.status === "changed" && (
                    <div className="flex items-center gap-1 bg-secondary/20 px-2 py-1 rounded-full">
                      <AlertTriangle className="w-3 h-3 text-secondary" />
                      <span className="text-[10px] font-bold text-secondary">{t("home.replacement")}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("home.noLessons")}</p>
        )}
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-black text-foreground mb-3">{t("home.leaderboard")}</h2>
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            {leaderboard.map((p, i) => (
              <div key={p.id} className={`flex items-center gap-3 px-4 py-3 ${i !== leaderboard.length - 1 ? "border-b border-border" : ""} ${p.id === user.id ? "bg-primary/5" : ""}`}>
                <span className={`text-lg font-black w-6 ${i === 0 ? "text-accent" : i === 1 ? "text-muted-foreground" : i === 2 ? "text-secondary" : "text-muted-foreground"}`}>
                  {i + 1}
                </span>
                <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${p.username}`} alt="" className="w-8 h-8 rounded-full bg-muted" />
                <div className="flex-1">
                  <p className={`text-sm font-bold ${p.id === user.id ? "text-primary" : "text-foreground"}`}>@{p.username}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-accent" />
                  <span className="text-sm font-black text-foreground">{p.xp || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="mb-5">
        <h2 className="text-lg font-black text-foreground mb-3">{t("home.achievements")}</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {["⭐", "🔥", "🏆", "💎", "👋"].map((icon, i) => (
            <motion.div key={i} className="min-w-[60px] h-[60px] bg-card rounded-xl shadow-card flex items-center justify-center text-2xl opacity-30">
              {icon}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
