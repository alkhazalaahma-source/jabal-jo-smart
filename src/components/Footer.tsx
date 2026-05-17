import { Link } from "@tanstack/react-router";
import { Phone, Mail, MessageCircle, MapPin } from "lucide-react";
import logo from "@/assets/jabal-logo.png";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t, lang } = useI18n();
  return (
    <footer className="border-t bg-steel mt-20">
      <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
        <div className="space-y-3">
          <img src={logo} alt="JABAL" className="h-12" />
          <p className="text-sm text-muted-foreground">
            {lang === "ar"
              ? "أكبر منصة رقمية لمواد البناء والخدمات الهندسية في الأردن."
              : "Jordan's largest digital platform for construction materials & engineering services."}
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-3">{t("nav_market")}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/marketplace" className="hover:text-accent">{t("nav_market")}</Link></li>
            <li><Link to="/services" className="hover:text-accent">{t("nav_services")}</Link></li>
            <li><Link to="/companies" className="hover:text-accent">{t("nav_companies")}</Link></li>
            <li><Link to="/ai-chat" className="hover:text-accent">{t("nav_ai")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-3">{lang === "ar" ? "روابط" : "Links"}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-accent">{t("nav_about")}</Link></li>
            <li><Link to="/contact" className="hover:text-accent">{t("nav_contact")}</Link></li>
            <li><Link to="/complaints" className="hover:text-accent">{t("complaints")}</Link></li>
            <li><Link to="/faq" className="hover:text-accent">{t("faq")}</Link></li>
            <li><Link to="/privacy" className="hover:text-accent">{t("privacy")}</Link></li>
            <li><Link to="/terms" className="hover:text-accent">{t("terms")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-3">{t("contact_us")}</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" /> +962 7 9000 0000</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" /> info@jabal.jo</li>
            <li>
              <a href="https://wa.me/962790000000" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-accent">
                <MessageCircle className="h-4 w-4 text-accent" /> {t("whatsapp")}
              </a>
            </li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> {lang === "ar" ? "عمّان، الأردن" : "Amman, Jordan"}</li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="container mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} JABAL.jo — {t("footer_rights")} · {t("footer_built")}
        </div>
      </div>
    </footer>
  );
}
