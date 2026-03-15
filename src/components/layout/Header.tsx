import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  MessageSquarePlus,
  BarChart3,
  User,
  FileText,
  Shield,
  Newspaper,
  Wallet,
  ChevronDown,
  Trophy,
  Globe,
  Check,
  Bell,
  CheckCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { uz } from "date-fns/locale";
import logo from "@/assets/logo.png";

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "uz", label: "O'zbek" },
  { code: "ru", label: "Русский" },
  { code: "cy", label: "Ўзбек (кирилл)" },
];

const NOTIF_ICONS: Record<string, string> = {
  news: "📰",
  feedback_status: "📋",
  feedback_response: "💬",
  feedback_removed: "🗑️",
};

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, mode, setMode, activateAdminDemo, activateGuestDemo } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  const navItems = [
    { href: "/", label: t("nav.home"), icon: Home },
    { href: "/feedbacks", label: t("nav.feedbacks"), icon: MessageSquarePlus },
    { href: "/news", label: t("nav.news"), icon: Newspaper },
    { href: "/budget", label: t("nav.budget"), icon: Wallet },
    { href: "/statistics", label: t("nav.statistics"), icon: BarChart3 },
    { href: "/leaderboard", label: "Reyting", icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border shadow-sm">
      <div className="container-gov flex h-14 items-center justify-between gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img
            src={logo}
            alt="HududInfo.uz"
            className="h-8 md:h-9 w-auto"
            draggable={false}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={[
                    "gap-1.5 h-8 text-sm font-medium rounded-lg",
                    isActive
                      ? "bg-primary/10 text-primary hover:bg-primary/15"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Right-side actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Mode switcher */}
          <div className="hidden md:flex items-center bg-muted rounded-lg p-0.5">
            <button
              onClick={async () => {
                await activateGuestDemo();
                setMode('user');
                navigate('/');
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${mode === 'user' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Fuqaro
              </span>
            </button>
            <button
              onClick={async () => {
                await activateAdminDemo();
                setMode('admin');
                navigate('/admin');
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${mode === 'admin' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Admin
              </span>
            </button>
          </div>

          {/* Notification Bell */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-0.5">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="font-semibold text-sm">Bildirishnomalar</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Barchasini o'qish
                  </button>
                )}
              </div>
              <ScrollArea className="max-h-80">
                {notifications.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">
                    Bildirishnomalar yo'q
                  </p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex gap-3 px-3 py-2.5 border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors ${!notif.read ? "bg-primary/5" : ""}`}
                      onClick={() => {
                        markRead(notif.id);
                        if (notif.link) navigate(notif.link);
                      }}
                    >
                      <span className="text-lg shrink-0 mt-0.5">
                        {NOTIF_ICONS[notif.type] ?? "🔔"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${!notif.read ? "font-semibold" : "font-medium"}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[11px] text-muted-foreground/70 mt-1">
                          {formatDistanceToNow(notif.createdAt, { addSuffix: true, locale: uz })}
                        </p>
                      </div>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-sm font-medium border-border"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {user?.full_name ?? "Kirish"}
                </span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {user ? (
                <>
                  <DropdownMenuLabel className="pb-1">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-foreground">{user.full_name}</span>
                      <span className="text-[11px]" style={{ color: user.titleColor }}>
                        {user.titleEmoji} {user.titleLabel} · {user.reputationPoints} ball
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="h-4 w-4 mr-2 text-primary" />
                    {t("nav.profile")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/my-feedbacks")}>
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    {t("nav.my_feedbacks")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      await activateGuestDemo({ forceNew: true });
                      navigate('/');
                    }}
                  >
                    <User className="h-4 w-4 mr-2 text-primary" />
                    Yangi demo profil
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={async () => {
                  await activateGuestDemo({ forceNew: true });
                  navigate('/');
                }}>
                  <User className="h-4 w-4 mr-2 text-primary" />
                  Demo profil yaratish
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center gap-1.5 text-xs text-muted-foreground font-normal pb-1">
                <Globe className="h-3.5 w-3.5" />
                Til / Язык
              </DropdownMenuLabel>
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm">{lang.label}</span>
                  {language === lang.code && (
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
