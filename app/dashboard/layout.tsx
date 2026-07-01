import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { getAcces } from "@/utils/acces";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const acces = await getAcces(session.user.employeId, session.user.role);

  return (
    <div className="flex h-screen bg-[#0f0f1a] text-white overflow-hidden">
      <Sidebar user={session.user} acces={acces} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}