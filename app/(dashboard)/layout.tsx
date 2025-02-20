import { auth } from "@/auth";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header user={session.user} />
      
      <div className="flex-grow flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-grow p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}