import Link from "next/link";
import { Calendar } from "lucide-react";
import LoginForm from "@/components/auth/login-form";

export const metadata = {
  title: "Sign In",
  description: "Sign in to QuickCal and prepare to be judged by your calendar",
};

export default function LoginPage() {
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
        <div className="w-full max-w-md">
          <div className="brutalist-box">
            <div className="text-center mb-8">
              <h1 className="heading-md mb-2">Sign In to QuickCal</h1>
              <p>Prepare to have your scheduling choices questioned.</p>
            </div>
            
            <LoginForm />
            
            <div className="mt-8 text-center text-sm">
              <p className="italic">
                By signing in, you agree to let us judge your calendar choices and occasionally make snarky comments about your meeting habits.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t-2 border-black py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>QuickCal © 2025 • The calendar that thinks it&apos;s smarter than you</p>
        </div>
      </footer>
    </div>
  );
}