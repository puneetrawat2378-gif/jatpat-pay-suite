import { type ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FloatingActions } from "./FloatingActions";
import { ScrollProgress } from "./ScrollProgress";
import { WebsiteAssistant } from "./WebsiteAssistant";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ScrollProgress />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingActions />
      <WebsiteAssistant />
    </div>
  );
}
