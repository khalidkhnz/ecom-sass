"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User } from "@/schema/users";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  Settings,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Briefcase,
  Store,
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { CssThemeToggle } from "@/components/css-theme-toggle";
interface AdminSidebarProps {
  user: User;
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const { settings, isLoading } = useSettings();

  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: <Package className="h-5 w-5" />,
    },
    {
      label: "Categories",
      href: "/admin/categories",
      icon: <Tag className="h-5 w-5" />,
    },
    {
      label: "Subcategories",
      href: "/admin/subcategories",
      icon: <Tag className="h-5 w-5" />,
    },
    {
      label: "Brands",
      href: "/admin/brands",
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      label: "Vendors",
      href: "/admin/vendors",
      icon: <Store className="h-5 w-5" />,
    },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: <UserIcon className="h-5 w-5" />,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      label: "Profile",
      href: "/admin/profile",
      icon: <UserIcon className="h-5 w-5" />,
    },
  ];

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-64"
      } transition-all duration-300 bg-background border-r border-gray-200 flex flex-col h-screen sticky top-0`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && !isLoading && (
          <div className="font-bold text-xl">
            {settings?.store?.storeName || "Admin Panel"}
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
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
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md py-2 px-3 transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                collapsed ? "justify-center" : ""
              )}
            >
              {item.icon}
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div
        className={cn("p-4 flex justify-start items-center gap-2", {
          "justify-center": collapsed,
        })}
      >
        <div
          className={cn("flex gap-2", {
            "flex-col": collapsed,
          })}
        >
          <CssThemeToggle />
          <ThemeToggle directToggle={true} />
        </div>
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
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          {!collapsed && (
            <div className="ml-3">
              <div className="font-medium">{user?.name || "Admin"}</div>
              <div className="text-sm text-gray-500 truncate">
                {user?.email}
              </div>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          className={`${collapsed ? "justify-center w-full px-2" : "w-full"}`}
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && "Sign out"}
        </Button>
      </div>
    </div>
  );
}
