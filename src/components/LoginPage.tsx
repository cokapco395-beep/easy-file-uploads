import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { GraduationCap, Users, School, ShieldCheck, ArrowLeft, Eye, EyeOff } from "lucide-react";

type Role = "student" | "parent" | "teacher" | "admin";

interface LoginPageProps {
  onBack: () => void;
  onLoginSuccess: (role: Role, user: any) => void;
}

const LoginPage = ({ onBack, onLoginSuccess }: LoginPageProps) => {
  const { t } = useI18n();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const roles: { key: Role; icon: typeof GraduationCap; label: string; color: string }[] = [
    { key: "student", icon: GraduationCap, label: t("onboard.roles.student"), color: "gradient-primary" },
    { key: "parent", icon: Users, label: t("onboard.roles.parent"), color: "gradient-secondary" },
    { key: "teacher", icon: School, label: t("onboard.roles.teacher"), color: "gradient-accent" },
    { key: "admin", icon: ShieldCheck, label: t("onboard.roles.admin"), color: "gradient-primary" },
  ];

  const updateForm = (key: string, value: string) => setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    if (!selectedRole) return;
    setLoading(true);
    setTimeout(() => {
      const mockUser = {
        id: "mock-user-1",
        username: form.username || form.email?.split("@")[0] || "user",
        email: form.email || "",
        role: selectedRole,
        schoolId: form.schoolId || "SCH001",
        class: form.class || "7А",
        fullName: form.fullName || "Пользователь",
      };
      localStorage.setItem("edusphere-user", JSON.stringify(mockUser));
      setLoading(false);
      onLoginSuccess(selectedRole, mockUser);
    }, 1000);
  };

  const InputField = ({ label, type = "text", field }: { label: string; type?: string; field: string }) => (
    <div className="mb-3">
      <label className="text-sm font-semibold text-muted-foreground mb-1 block">{label}</label>
      <div className="relative">
        <input
          type={type === "password" && showPassword ? "text" : type}
          value={form[field] || ""}
          onChange={(e) => updateForm(field, e.target.value)}
          className="w-full bg-muted border-2 border-border rounded-xl px-4 py-3 text-foreground font-semibold outline-none focus:border-primary transition-colors"
          placeholder={label}
        />
        {type === "password" && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );

  const renderForm = () => {
    if (!selectedRole) return null;

    if (!isRegister) {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <InputField label={t("auth.email")} type="email" field="email" />
          <InputField label={t("auth.password")} type="password" field="password" />
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleSubmit} disabled={loading}
            className="w-full gradient-primary text-primary-foreground font-bold py-3.5 rounded-2xl shadow-button text-lg mt-4 disabled:opacity-50">
            {loading ? "..." : t("auth.login")}
          </motion.button>
          {selectedRole === "student" && (
            <motion.button whileTap={{ scale: 0.95 }} className="w-full bg-card border-2 border-border text-foreground font-bold py-3 rounded-2xl mt-3 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t("auth.google")}
            </motion.button>
          )}
          {selectedRole !== "admin" && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              {t("auth.noAccount")}{" "}
              <button onClick={() => setIsRegister(true)} className="text-primary font-bold">{t("auth.register")}</button>
            </p>
          )}
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {selectedRole === "student" && (
          <>
            <InputField label={t("auth.schoolId")} field="schoolId" />
            <InputField label={t("auth.class")} field="class" />
            <InputField label={t("auth.username")} field="username" />
            <InputField label={t("auth.email")} type="email" field="email" />
            <InputField label={t("auth.password")} type="password" field="password" />
          </>
        )}
        {selectedRole === "parent" && (
          <>
            <InputField label={t("auth.childId")} field="childId" />
            <InputField label={t("auth.fullName")} field="fullName" />
            <InputField label={t("auth.email")} type="email" field="email" />
            <InputField label={t("auth.password")} type="password" field="password" />
          </>
        )}
        {selectedRole === "teacher" && (
          <>
            <InputField label={t("auth.schoolId")} field="schoolId" />
            <InputField label={t("auth.class")} field="class" />
            <InputField label={t("auth.fullName")} field="fullName" />
            <InputField label={t("auth.email")} type="email" field="email" />
            <InputField label={t("auth.password")} type="password" field="password" />
          </>
        )}
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleSubmit} disabled={loading}
          className="w-full gradient-primary text-primary-foreground font-bold py-3.5 rounded-2xl shadow-button text-lg mt-4 disabled:opacity-50">
          {loading ? "..." : t("auth.register")}
        </motion.button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          {t("auth.hasAccount")}{" "}
          <button onClick={() => setIsRegister(false)} className="text-primary font-bold">{t("auth.login")}</button>
        </p>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center px-4 pt-12 pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={selectedRole ? () => setSelectedRole(null) : onBack}>
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </motion.button>
        <h1 className="flex-1 text-center text-xl font-black text-foreground pr-6">
          {isRegister ? t("auth.register") : t("auth.login")}
        </h1>
      </div>

      <div className="px-6 pb-10">
        {!selectedRole ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-center text-muted-foreground font-semibold mb-6">{t("auth.selectRole")}</p>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => (
                <motion.button key={r.key} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}
                  onClick={() => { setSelectedRole(r.key); setIsRegister(false); setForm({}); }}
                  className="bg-card rounded-2xl p-5 shadow-card flex flex-col items-center gap-3">
                  <div className={`w-14 h-14 ${r.color} rounded-xl flex items-center justify-center`}>
                    <r.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-foreground">{r.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div>
            <div className="flex justify-center mb-6">
              {roles.filter(r => r.key === selectedRole).map(r => (
                <div key={r.key} className={`${r.color} text-primary-foreground px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2`}>
                  <r.icon className="w-4 h-4" />
                  {r.label}
                </div>
              ))}
            </div>
            {renderForm()}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
