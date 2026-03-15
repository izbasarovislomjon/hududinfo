import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  MessageSquarePlus,
  BarChart3,
  Menu,
  Plus,
  ClipboardCheck,
  Newspaper,
  Trophy,
  UserCircle2,
  Wallet,
  FileText,
  Shield,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const MORE_PATHS = ["/news", "/budget", "/leaderboard", "/profile", "/my-feedbacks", "/admin"];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, setMode, activateAdminDemo, activateGuestDemo } = useAuth();
  const [fabOpen, setFabOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const navItems = [
    { href: "/", icon: Home, label: t("nav.home") },
    { href: "/feedbacks", icon: MessageSquarePlus, label: t("nav.feedbacks") },
    null,
    { href: "/statistics", icon: BarChart3, label: "Statistika" },
    { href: "__more__", icon: Menu, label: "More" },
  ] as const;

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    if (href === "__more__") return MORE_PATHS.some((path) => location.pathname.startsWith(path));
    return location.pathname.startsWith(href);
  };

  const moreItems = [
    { href: "/news", icon: Newspaper, label: "Yangiliklar" },
    { href: "/leaderboard", icon: Trophy, label: "Reyting" },
    { href: "/profile", icon: UserCircle2, label: "Profil" },
    { href: "/my-feedbacks", icon: FileText, label: "Mening murojaatlarim" },
    { href: "/budget", icon: Wallet, label: "Byudjet" },
    { href: "/admin", icon: Shield, label: "Admin panel", onClick: async () => {
      await activateAdminDemo();
      setMode("admin");
    } },
    { href: "/", icon: UserCircle2, label: "Yangi demo profil", onClick: async () => {
      await activateGuestDemo({ forceNew: true });
      setMode("user");
    } },
  ];

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-[1600] md:hidden"
        style={{
          background: "white",
          borderTop: "1px solid hsl(214 20% 88%)",
          boxShadow: "0 -4px 20px hsl(215 30% 12% / 0.07)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="absolute left-1/2 -translate-x-1/2 z-10" style={{ top: "-24px" }}>
          <button
            onClick={() => setFabOpen(true)}
            className="flex items-center justify-center rounded-full active:scale-95 transition-transform duration-150"
            style={{
              width: 56,
              height: 56,
              background: "hsl(221 83% 47%)",
              boxShadow:
                "0 4px 20px hsl(221 83% 47% / 0.55), 0 2px 8px hsl(221 83% 47% / 0.35)",
            }}
            aria-label="Yangi amal"
          >
            <Plus style={{ width: 26, height: 26, color: "white", strokeWidth: 2.5 }} />
          </button>
        </div>

        <div className="flex items-stretch h-16">
          {navItems.map((item) => {
            if (item === null) return <div key="fab-space" className="flex-1" />;

            const active = isActive(item.href);
            const Icon = item.icon;

            if (item.href === "__more__") {
              return (
                <button
                  key={item.href}
                  onClick={() => setMoreOpen(true)}
                  className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-150 active:scale-95"
                  style={{ color: active ? "hsl(221 83% 47%)" : "hsl(215 14% 52%)" }}
                >
                  <div
                    className="flex items-center justify-center rounded-xl transition-all duration-150"
                    style={{ width: 40, height: 28, background: active ? "hsl(221 83% 47% / 0.1)" : "transparent" }}
                  >
                    <Icon style={{ width: 20, height: 20, strokeWidth: active ? 2.5 : 2 }} />
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: active ? 700 : 500, lineHeight: 1, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-150 active:scale-95"
                style={{ color: active ? "hsl(221 83% 47%)" : "hsl(215 14% 52%)" }}
              >
                <div
                  className="flex items-center justify-center rounded-xl transition-all duration-150"
                  style={{ width: 40, height: 28, background: active ? "hsl(221 83% 47% / 0.1)" : "transparent" }}
                >
                  <Icon style={{ width: 20, height: 20, strokeWidth: active ? 2.5 : 2 }} />
                </div>
                <span style={{ fontSize: "10px", fontWeight: active ? 700 : 500, lineHeight: 1, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <Drawer open={fabOpen} onOpenChange={setFabOpen}>
        <DrawerContent className="max-w-md mx-auto">
          <DrawerHeader>
            <DrawerTitle>Yangi amal</DrawerTitle>
            <DrawerDescription>Avval kerakli yo'nalishni tanlang.</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-5 space-y-3">
            {[
              {
                label: "Tekshiruv",
                description: "Checklist orqali joyida monitoring qiling",
                icon: ClipboardCheck,
                href: "/checklist",
                color: "#1d4ed8",
                bg: "#eff6ff",
              },
              {
                label: "Murojaat",
                description: "Muammo haqida rasmiy xabar yuboring",
                icon: MessageSquarePlus,
                href: "/submit",
                color: "#dc2626",
                bg: "#fef2f2",
              },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.href}
                  onClick={() => {
                    setFabOpen(false);
                    navigate(action.href);
                  }}
                  className="w-full rounded-2xl border border-border bg-white px-4 py-4 text-left transition-all hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: action.bg }}>
                      <Icon className="h-5 w-5" style={{ color: action.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent className="max-w-md mx-auto">
          <DrawerHeader>
            <DrawerTitle>More</DrawerTitle>
            <DrawerDescription>
              {user ? `${user.titleEmoji} ${user.titleLabel}` : "Qo'shimcha bo'limlar va profil"}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-5 space-y-2">
            {moreItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    item.onClick?.();
                    setMoreOpen(false);
                    navigate(item.href);
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-left transition-all hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/60">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.href === "/profile"
                        ? "Profil va ishonchlilik darajasi"
                        : item.href === "/my-feedbacks"
                        ? "Mening yuborgan murojaatlarim"
                        : item.href === "/leaderboard"
                        ? "Fuqarolar reytingi"
                        : item.href === "/budget"
                        ? "Byudjet ko'rinishi"
                        : item.href === "/news"
                        ? "Hudud yangiliklari"
                        : "Admin boshqaruvi"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
