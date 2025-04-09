"use client";

import { ReactNode, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  User,
  ShoppingBag,
  Heart,
  Settings,
  LogOut,
  CreditCard,
  MapPin,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
  collapsed?: boolean;
}

function SidebarItem({
  icon: Icon,
  label,
  href,
  active,
  collapsed,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center rounded-md py-2 px-3 transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
        collapsed ? "justify-center" : ""
      )}
    >
      <Icon className="h-5 w-5" />
      {!collapsed && <span className="ml-3">{label}</span>}
    </Link>
  );
}

export default function UserLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!session || !session.user) {
    redirect("/login");
  }

  const mainNavItems = [
    {
      label: "Dashboard",
      href: "/user/dashboard",
      icon: Home,
    },
    {
      label: "Profile",
      href: "/user/profile",
      icon: User,
    },
    {
      label: "Orders",
      href: "/user/orders",
      icon: ShoppingBag,
    },
    {
      label: "Wishlist",
      href: "/wishlist",
      icon: Heart,
    },
  ];

  const settingsNavItems = [
    {
      label: "Account",
      href: "/user/settings",
      icon: Settings,
    },
    {
      label: "Notifications",
      href: "/user/settings/notifications",
      icon: Bell,
    },
    {
      label: "Addresses",
      href: "/user/settings/addresses",
      icon: MapPin,
    },
    {
      label: "Payment Methods",
      href: "/user/settings/payment-methods",
      icon: CreditCard,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <aside
          className={cn(
            "bg-background border-r border-gray-200 flex flex-col h-screen sticky top-0 transition-all duration-300",
            collapsed ? "w-20" : "w-64"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!collapsed && <div className="font-bold text-xl">My Account</div>}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className={cn("", {
                "ml-auto": !collapsed,
              })}
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="py-4 flex-1">
            <nav className="space-y-1 px-2">
              {!collapsed && (
                <p className="text-xs font-semibold text-muted-foreground mb-2 px-3">
                  MAIN
                </p>
              )}
              {mainNavItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={pathname === item.href}
                  collapsed={collapsed}
                />
              ))}

              {!collapsed && (
                <p className="text-xs font-semibold text-muted-foreground mt-6 mb-2 px-3">
                  SETTINGS
                </p>
              )}
              {settingsNavItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={pathname === item.href}
                  collapsed={collapsed}
                />
              ))}
            </nav>
          </div>

          <div
            className={cn("p-4 flex justify-start items-center gap-2", {
              "justify-center": collapsed,
            })}
          >
            <ThemeToggle directToggle={true} />
            {!collapsed && (
              <>
                <span className="dark:hidden">LIGHT MODE</span>
                <span className="hidden dark:block">DARK MODE</span>
              </>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                {session.user.name?.charAt(0).toUpperCase() ||
                  session.user.email?.charAt(0).toUpperCase() ||
                  "U"}
              </div>
              {!collapsed && (
                <div className="ml-3">
                  <div className="font-medium">
                    {session.user.name || "User"}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {session.user.email}
                  </div>
                </div>
              )}
            </div>
            <form action="/api/auth/signout" method="post">
              <Button
                variant="outline"
                className={cn("w-full", {
                  "justify-center px-2": collapsed,
                })}
                type="submit"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {!collapsed && "Sign out"}
              </Button>
            </form>
          </div>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
