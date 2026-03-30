import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { I18nProvider } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import SplashScreen from "@/components/SplashScreen";
import Onboarding from "@/components/Onboarding";
import LoginPage from "@/components/LoginPage";
import ApplyPage from "@/components/ApplyPage";
import PostRegOnboarding from "@/components/PostRegOnboarding";
import StudentDashboard from "@/components/StudentDashboard";

type Screen = "splash" | "onboarding" | "login" | "apply" | "postOnboarding" | "dashboard";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("splash");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profile) {
          const userData = { ...profile, email: session.user.email };
          setUser(userData);

          // Check if onboarding is completed
          const { data: onboarding } = await supabase
            .from("onboarding")
            .select("completed")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (onboarding && !onboarding.completed) {
            setScreen("postOnboarding");
          } else {
            setScreen("dashboard");
          }
        }
      } else {
        setUser(null);
        setScreen("splash");
      }
      setLoading(false);
    });

    // Then check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profile) {
          const userData = { ...profile, email: session.user.email };
          setUser(userData);

          const { data: onboarding } = await supabase
            .from("onboarding")
            .select("completed")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (onboarding && !onboarding.completed) {
            setScreen("postOnboarding");
          } else {
            setScreen("dashboard");
          }
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSplashComplete = useCallback(() => {
    if (!user) setScreen("onboarding");
  }, [user]);

  const handleLogin = useCallback(() => setScreen("login"), []);
  const handleApply = useCallback(() => setScreen("apply"), []);
  const handleBack = useCallback(() => setScreen("onboarding"), []);

  const handleLoginSuccess = useCallback((_role: string, userData: any) => {
    setUser(userData);
    if (userData.isNewUser) {
      setScreen("postOnboarding");
    } else {
      setScreen("dashboard");
    }
  }, []);

  const handlePostOnboardingComplete = useCallback(() => {
    setScreen("dashboard");
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
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
        {screen === "postOnboarding" && user && <PostRegOnboarding user={user} onComplete={handlePostOnboardingComplete} />}
        {screen === "dashboard" && user && <StudentDashboard user={user} onLogout={handleLogout} />}
      </div>
    </I18nProvider>
  );
};

export default Index;
