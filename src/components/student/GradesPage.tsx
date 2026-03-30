import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";

const GradesPage = () => {
  const { lang } = useI18n();

  const subjects = [
    { name: lang === "kz" ? "Математика" : "Математика", grades: [5, 4, 5, 3, 5, 4], avg: 4.3 },
    { name: lang === "kz" ? "Қазақ тілі" : "Русский язык", grades: [4, 4, 5, 4, 5], avg: 4.4 },
    { name: lang === "kz" ? "Ағылшын тілі" : "Английский язык", grades: [5, 5, 4, 5, 5], avg: 4.8 },
    { name: lang === "kz" ? "Тарих" : "История", grades: [3, 4, 4, 5, 4], avg: 4.0 },
    { name: lang === "kz" ? "Физика" : "Физика", grades: [4, 5, 4, 4, 5, 3], avg: 4.2 },
    { name: lang === "kz" ? "Биология" : "Биология", grades: [5, 5, 5, 4, 5], avg: 4.8 },
  ];

  const gradeColor = (g: number) => {
    if (g === 5) return "bg-accent text-accent-foreground";
    if (g === 4) return "bg-secondary text-secondary-foreground";
    if (g === 3) return "bg-primary/60 text-primary-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  return (
    <div className="px-4 pt-12">
      <h1 className="text-2xl font-black text-foreground mb-6">
        {lang === "kz" ? "📊 Бағалар" : "📊 Оценки"}
      </h1>

      <div className="space-y-3">
        {subjects.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-foreground text-sm">{s.name}</h3>
              <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${s.avg >= 4.5 ? "bg-accent/20 text-accent" : s.avg >= 4 ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"}`}>
                {s.avg.toFixed(1)}
              </span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {s.grades.map((g, j) => (
                <span key={j} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${gradeColor(g)}`}>
                  {g}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GradesPage;
