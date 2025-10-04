"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Header from "@/components/layout/header/Header";

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isMobile = useIsMobile();

  // Dynamically set sidebar width for header alignment
  const sidebarWidth = isMobile ? 0 : isCollapsed ? 64 : 240;

  return (
    <div className="flex">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main content area */}
      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: isMobile ? 0 : sidebarWidth }}
      >
        <Header sidebarWidth={sidebarWidth} />
        <main className="pt-16 min-h-screen p-6">{children}</main>
      </div>

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
    </div>
  );
}
