"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Menu, Presentation, Home } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/screener", label: "AI Screener", icon: Presentation },
];

const bottomLink = { href: "/settings", label: "Settings", icon: Settings };

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-64 p-4 flex flex-col justify-between"
          >
            {/* Logo */}
            <div>
              <div className="text-2xl font-bold mb-8">AIGOAT</div>

              <nav className="space-y-2">
                {sidebarLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors",
                      pathname === href ? "bg-gray-200" : ""
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Bottom Settings Link */}
            <nav className="space-y-2 mt-4">
              <Link
                href={bottomLink.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors",
                  pathname === bottomLink.href ? "bg-gray-200" : ""
                )}
              >
                <bottomLink.icon className="mr-2 h-4 w-4" />
                {bottomLink.label}
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-64 p-4 border-r bg-white z-40 flex-col justify-between">
        {/* Top section: Logo + Links */}
        <div>
          <div className="text-2xl font-bold mb-8 px-2">AIGOAT</div>
          <nav className="space-y-2">
            {sidebarLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors",
                  pathname === href ? "bg-gray-200" : ""
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom section: Settings */}
        <nav className="space-y-2 mt-4">
          <Link
            href={bottomLink.href}
            className={cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors",
              pathname === bottomLink.href ? "bg-gray-200" : ""
            )}
          >
            <bottomLink.icon className="mr-2 h-4 w-4" />
            {bottomLink.label}
          </Link>
        </nav>
      </aside>
    </>
  );
}
