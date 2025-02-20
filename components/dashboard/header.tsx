"use client";

import { useState } from "react";
import { Session } from "next-auth";
import { Calendar, Menu, X, Bell, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { signOutUser } from "@/actions/signout";

interface HeaderProps {
  user: Session["user"];
}

export default function Header({ user }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };
  
  return (
    <header className="border-b-2 border-black">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Calendar className="h-7 w-7" />
              <span className="text-xl font-bold hidden sm:inline-block">QuickCal</span>
            </Link>
            
            <span className="hidden md:inline-block text-sm px-2 py-0.5 ml-3 bg-black text-white font-bold">
              BETA
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/dashboard/calendar" className="brutalist-nav-link">
                Calendar
              </Link>
              <Link href="/dashboard/tasks" className="brutalist-nav-link">
                Tasks
              </Link>
              <Link href="/dashboard/accounts" className="brutalist-nav-link">
                Accounts
              </Link>
            </nav>
            
            <div className="flex items-center gap-4">
              <button
                className="relative"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center">
                  0
                </span>
              </button>
              
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center gap-2"
                  aria-label="User menu"
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full border-2 border-black"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center font-bold">
                      {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </div>
                  )}
                </button>
                
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 brutalist-box z-10 bg-white">
                    <div className="mb-2 pb-2 border-b-2 border-black">
                      <p className="font-bold truncate">{user.name}</p>
                      <p className="text-sm truncate">{user.email}</p>
                    </div>
                    <ul className="space-y-1">
                      <li>
                        <Link
                          href="/dashboard/settings"
                          className="flex items-center gap-2 px-2 py-1.5 hover:bg-black hover:text-white transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                      </li>
                      <li>
                        <form action={signOutUser}>
                          <button
                            type="submit"
                            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-black hover:text-white transition-colors text-left"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign out
                          </button>
                        </form>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <nav className="md:hidden border-t-2 border-black">
          <div className="container mx-auto px-4 py-2">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard/calendar"
                  className="block py-2 hover:bg-black hover:text-white transition-colors font-bold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Calendar
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/tasks"
                  className="block py-2 hover:bg-black hover:text-white transition-colors font-bold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tasks
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/accounts"
                  className="block py-2 hover:bg-black hover:text-white transition-colors font-bold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Accounts
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
}