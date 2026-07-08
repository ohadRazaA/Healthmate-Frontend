import { createContext, useContext, useEffect, useState } from "react";

export const dict = {
  "app.name": { en: "HealthMate", ur: "HealthMate" },
  "app.tagline": {
    en: "Your bilingual health companion",
    ur: "Aap ka bilingual sehat saathi",
  },
  "nav.dashboard": { en: "Dashboard", ur: "Dashboard" },
  "nav.upload": { en: "Upload Report", ur: "Report Upload" },
  "nav.timeline": { en: "Timeline", ur: "Timeline" },
  "nav.vitals": { en: "Add Vitals", ur: "Vitals Add" },
  "nav.settings": { en: "Settings", ur: "Settings" },
  "nav.logout": { en: "Log out", ur: "Log out" },
  "cta.getStarted": { en: "Get started free", ur: "Muft shuru karein" },
  "cta.login": { en: "Log in", ur: "Log in" },
  "cta.signup": { en: "Sign up", ur: "Sign up" },
  "hero.title": {
    en: "Understand your medical reports in plain language.",
    ur: "Apni medical reports ko asaan zubaan mein samjhein.",
  },
  "hero.sub": {
    en: "Upload lab results, X-rays, or prescriptions. HealthMate's AI explains the numbers, flags what matters, and suggests questions for your doctor — in English or Roman Urdu.",
    ur: "Lab results, X-ray ya prescription upload karein. HealthMate ki AI numbers samjhati hai, ahem baaton par nishaan lagati hai, aur doctor ke liye sawalaat suggest karti hai — English ya Roman Urdu mein.",
  },
  "how.title": { en: "How it works", ur: "Ye kaise kaam karta hai" },
  "how.s1.t": { en: "Upload your report", ur: "Apni report upload karein" },
  "how.s1.d": {
    en: "Drag & drop a PDF or photo of your lab / scan / prescription.",
    ur: "PDF ya photo lab / scan / prescription ki drag & drop karein.",
  },
  "how.s2.t": { en: "AI reads it for you", ur: "AI aap ke liye parhti hai" },
  "how.s2.d": {
    en: "We extract values, compare to normal ranges, and flag anomalies.",
    ur: "Hum values nikaltay hain, normal range se compare kartay hain, aur anomalies flag karte hain.",
  },
  "how.s3.t": { en: "Get a simple summary", ur: "Aasan summary hasil karein" },
  "how.s3.d": {
    en: "Plain-language explanation with next steps and questions to ask.",
    ur: "Aasan zubaan mein explanation aur agla step aur sawalaat.",
  },
  "disclaimer.short": {
    en: "AI insights are for understanding only — not medical advice. Always consult your doctor.",
    ur: "AI sirf samajhne ke liye hai — medical advice nahi. Hamesha apne doctor se raabta karein.",
  },
  "dashboard.greeting": { en: "Good to see you", ur: "Aap ko dekh kar khushi hui" },
  "dashboard.reports": { en: "Reports uploaded", ur: "Uploaded reports" },
  "dashboard.latestBp": { en: "Latest BP", ur: "Latest BP" },
  "dashboard.latestSugar": { en: "Latest sugar", ur: "Latest sugar" },
  "dashboard.lastSummary": { en: "Last AI summary", ur: "Aakhri AI summary" },
  "dashboard.recent": { en: "Recent reports", ur: "Recent reports" },
  "dashboard.trend": { en: "Vitals trend", ur: "Vitals trend" },
  "upload.title": { en: "Upload a medical report", ur: "Medical report upload karein" },
  "upload.drop": {
    en: "Drop your file here, or click to browse",
    ur: "File yahan drop karein ya click karke browse karein",
  },
  "upload.types": { en: "PDF, JPG, PNG · up to 20MB", ur: "PDF, JPG, PNG · 20MB tak" },
  "upload.analyzing": { en: "Analyzing with AI…", ur: "AI se analyze ho raha hai…" },
  "vitals.title": { en: "Add manual vitals", ur: "Manual vitals add karein" },
  "vitals.saved": { en: "Vitals saved", ur: "Vitals save ho gaye" },
  "timeline.title": { en: "Your health timeline", ur: "Aap ki sehat timeline" },
  "settings.title": { en: "Settings", ur: "Settings" },
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLangState] = useState("en");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    try {
      const l = localStorage.getItem("hm.lang") || "en";
      const th = localStorage.getItem("hm.theme") || "light";
      setLangState(l);
      setTheme(th);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("hm.theme", theme);
    } catch {}
  }, [theme]);

  const setLang = (l) => {
    setLangState(l);
    try {
      localStorage.setItem("hm.lang", l);
    } catch {}
  };

  const t = (key) => {
    const entry = dict[key];
    if (!entry) return key;
    return entry[lang];
  };

  const toggleTheme = () => setTheme((v) => (v === "light" ? "dark" : "light"));

  return (
    <AppContext.Provider value={{ lang, setLang, t, theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
