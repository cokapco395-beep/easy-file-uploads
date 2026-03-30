import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { I18nProvider } from "@/lib/i18n";
import SplashScreen from "@/components/SplashScreen";
import Onboarding from "@/components/Onboarding";
import LoginPage from "@/components/LoginPage";
import ApplyPage from "@/components/ApplyPage";
import StudentDashboard from "@/components/StudentDashboard";

type Screen = "splash" | "onboarding" | "login" | "apply" | "dashboard";

const Index = () => {
  const [screen, setScreen] = useState<Screen>(() => {
    const user = localStorage.getItem("edusphere-user");
    return user ? "dashboard" : "splash";
  });
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem("edusphere-user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleSplashComplete = useCallback(() => setScreen("onboarding"), []);
  const handleLogin = useCallback(() => setScreen("login"), []);
  const handleApply = useCallback(() => setScreen("apply"), []);
  const handleBack = useCallback(() => setScreen("onboarding"), []);

  const handleLoginSuccess = useCallback((_role: string, userData: any) => {
    setUser(userData);
    setScreen("dashboard");
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("edusphere-user");
    setUser(null);
    setScreen("onboarding");
  }, []);

  return (
    <I18nProvider>
      <div className="max-w-lg mx-auto min-h-screen bg-background relative overflow-hidden">
        <AnimatePresence mode="wait">
          {screen === "splash" && <SplashScreen key="splash" onComplete={handleSplashComplete} />}
        </AnimatePresence>
        {screen === "onboarding" && <Onboarding onComplete={() => {}} onLogin={handleLogin} onApply={handleApply} />}
        {screen === "login" && <LoginPage onBack={handleBack} onLoginSuccess={handleLoginSuccess} />}
        {screen === "apply" && <ApplyPage onBack={handleBack} />}
        {screen === "dashboard" && user && <StudentDashboard user={user} onLogout={handleLogout} />}
      </div>
    </I18nProvider>
  );
};

export default Index;
