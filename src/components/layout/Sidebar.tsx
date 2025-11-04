"use client";

import { Home, Settings, X, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const links = [
  { label: "Home", href: "/home", icon: <Home /> },
  { label: "AI Screener", href: "/screener", icon: <Zap /> },
];

const settingsLink = {
  label: "Settings",
  href: "/settings",
  icon: <Settings />,
};

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  return (
    <aside
      onMouseEnter={() => !isMobile && setIsCollapsed(false)}
      onMouseLeave={() => !isMobile && setIsCollapsed(true)}
      className={cn(
        "fixed top-0 left-0 h-screen border-r bg-muted/90 transition-all duration-300 ease-in-out flex flex-col justify-between z-50",
        isMobile
          ? isCollapsed
            ? "-translate-x-full"
            : "translate-x-0 w-[240px]"
          : isCollapsed
          ? "w-[64px]"
          : "w-[240px]"
      )}
    >
      {/* Top section with Logo and Main Links */}
      <div>
        {/* Logo and Mobile Close Button */}
        <div className="flex items-center justify-between h-[60px] px-4">
          <Image
            src="/images/aigoat_logo_trans.svg"
            alt="Logo"
            width={isMobile ? 120 : isCollapsed ? 32 : 120}
            height={40}
            priority
          />
          {isMobile && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-2 rounded-md hover:bg-muted transition-colors"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Main Nav */}
        <nav className="space-y-1 px-2 mt-4">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-md p-3 transition-all duration-200 w-full min-h-[44px] relative",
                  isCollapsed
                    ? "justify-center hover:bg-muted/50"
                    : "hover:bg-muted hover:text-primary",
                  isActive && "bg-primary/10 text-primary"
                )}
              >
                <div className="flex items-center gap-3 w-full">
                  <div
                    className={cn(
                      "transition-colors",
                      isActive && "text-primary"
                    )}
                  >
                    {link.icon}
                  </div>
                  {!isCollapsed && (
                    <span
                      className={cn(
                        "flex-1",
                        isActive && "text-primary font-medium"
                      )}
                    >
                      {link.label}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section with Settings link */}
      <nav className="space-y-1 px-2 mb-4">
        {(() => {
          const isActive = pathname === settingsLink.href;
          return (
            <Link
              href={settingsLink.href}
              className={cn(
                "flex items-center gap-3 rounded-md p-3 transition-all duration-200 w-full min-h-[44px] relative",
                isCollapsed
                  ? "justify-center hover:bg-muted/50"
                  : "hover:bg-muted hover:text-primary",
                isActive && "bg-primary/10 text-primary"
              )}
            >
              <div className="flex items-center gap-3 w-full">
                <div
                  className={cn(
                    "transition-colors",
                    isActive && "text-primary"
                  )}
                >
                  {settingsLink.icon}
                </div>
                {!isCollapsed && (
                  <span
                    className={cn(
                      "flex-1",
                      isActive && "text-primary font-medium"
                    )}
                  >
                    {settingsLink.label}
                  </span>
                )}
              </div>
            </Link>
          );
        })()}
      </nav>
    </aside>
  );
}
