import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Globe, Moon, Sun, ShoppingCart, User, LogOut, Menu, X, Sparkles } from "lucide-react";
import logo from "@/assets/jabal-logo.png";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/use-auth";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const { count } = useCart();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const nav = [
    { to: "/", label: t("nav_home") },
    { to: "/marketplace", label: t("nav_market") },
    { to: "/services", label: t("nav_services") },
    { to: "/companies", label: t("nav_companies") },
    { to: "/ai-chat", label: t("nav_ai") },
    { to: "/about", label: t("nav_about") },
    { to: "/contact", label: t("nav_contact") },
  ] as const;

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="JABAL" className="h-10 w-auto" />
          <span className="hidden sm:block font-bold text-lg">
            JABAL <span className="text-orange-grad">جبل</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent/10 hover:text-accent transition-colors"
              activeProps={{ className: "text-accent" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setLang(lang === "ar" ? "en" : "ar")} title="Language">
            <Globe className="h-5 w-5" />
            <span className="sr-only">Lang</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={toggle} title="Theme">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-grad text-[10px] font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center text-accent-foreground">
                  {count}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.navigate({ to: "/orders" })}>{t("nav_orders")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.navigate({ to: "/profile" })}>{t("nav_profile")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" /> {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="hidden sm:block">
              <Button className="bg-orange-grad text-accent-foreground hover:opacity-90">
                <Sparkles className="h-4 w-4 mr-1.5" /> {t("login")}
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t glass">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="px-3 py-2 rounded-md hover:bg-accent/10">
                {n.label}
              </Link>
            ))}
            {!user && (
              <Link to="/auth" onClick={() => setOpen(false)}>
                <Button className="w-full bg-orange-grad text-accent-foreground">{t("login")}</Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
