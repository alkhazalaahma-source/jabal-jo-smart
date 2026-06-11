import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LocationBanner } from "./LocationBanner";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <LocationBanner />
      <main className="flex-1 animate-fade-in">{children}</main>
      <Footer />
    </div>
  );
}
