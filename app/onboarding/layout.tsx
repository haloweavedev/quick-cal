import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Calendar } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Welcome to QuickCal",
  description: "Set up your account and start organizing your calendar",
};

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  // If not authenticated, redirect to login
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b-2 border-black">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <Calendar className="h-7 w-7" />
            <span className="text-xl font-bold">QuickCal</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          {children}
        </div>
      </main>
      
      <footer className="border-t-2 border-black py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>QuickCal © 2025 • The calendar that thinks it's smarter than you</p>
        </div>
      </footer>
    </div>
  );
}