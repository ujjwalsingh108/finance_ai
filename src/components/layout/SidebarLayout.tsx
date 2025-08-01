"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isMobile = useIsMobile();

  return (
    <div className="flex">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Mobile Backdrop */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Mobile Hamburger Menu */}
      {isMobile && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed top-4 left-4 z-40 p-2 rounded-md bg-muted/80 hover:bg-muted transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
      )}

      <main
        className={`transition-all duration-300 flex-1 ${
          isMobile ? "ml-0" : isCollapsed ? "ml-[64px]" : "ml-[240px]"
        }`}
      >
        <div className="min-h-screen p-6">{children}</div>
      </main>
    </div>
  );
}
