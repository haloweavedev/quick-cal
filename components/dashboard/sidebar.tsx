"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ListTodo,
  Users,
  BarChart2,
  Settings,
  HelpCircle,
  Zap,
  UserPlus,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };
  
  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart2,
    },
    {
      name: "Calendar",
      href: "/dashboard/calendar",
      icon: CalendarDays,
    },
    {
      name: "Tasks",
      href: "/dashboard/tasks",
      icon: ListTodo,
    },
    {
      name: "Accounts",
      href: "/dashboard/accounts",
      icon: Users,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];
  
  const secondaryNavigation = [
    {
      name: "Invite Friends",
      href: "/dashboard/invite",
      icon: UserPlus,
    },
    {
      name: "Upgrade Plan",
      href: "/dashboard/upgrade",
      icon: Zap,
    },
    {
      name: "Help & Support",
      href: "/dashboard/help",
      icon: HelpCircle,
    },
  ];
  
  return (
    <aside className="w-full md:w-64 border-r-2 border-black shrink-0">
      <div className="flex flex-col h-full p-4">
        <nav className="space-y-1 flex-grow">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`brutalist-nav-link ${
                  active ? "bg-black text-white" : ""
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-8 pt-4 border-t-2 border-black">
          <div className="brutalist-box bg-[#f4f4f4] mb-4">
            <p className="text-sm font-bold mb-2">Free Plan</p>
            <div className="w-full bg-white h-2 border border-black mb-2">
              <div className="bg-black h-full" style={{ width: "30%" }}></div>
            </div>
            <p className="text-xs">3/10 connections used</p>
          </div>
          
          <nav className="space-y-1">
            {secondaryNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="brutalist-nav-link text-sm"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}