"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/dashboard",                 label: "Dashboard",  icon: "⬡" },
  { href: "/dashboard/ventes",          label: "Ventes",     icon: "💰" },
  { href: "/dashboard/stock",           label: "Stock",      icon: "📦" },
  { href: "/dashboard/clients",         label: "Clients",    icon: "👥" },
  { href: "/dashboard/gringotts",       label: "Gringotts",  icon: "🏦" },
  { href: "/dashboard/calendrier",      label: "Calendrier", icon: "📅" },
];

const RH_NAV = [
  { href: "/dashboard/employes",                label: "Employés",  icon: "👷" },
  { href: "/dashboard/employes/primes",         label: "Primes",    icon: "🏆" },
];

const ADMIN_NAV = [
  { href: "/admin", label: "Admin", icon: "⚙️" },
];

type Props = {
  user: { username: string; role: string; name?: string | null };
};

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
        active
          ? "bg-[#2a2250] text-[#c4bbff] border border-[#3d3580]"
          : "text-white/50 hover:text-white hover:bg-white/5"
      }`}
    >
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  );
}

export default function Sidebar({ user }: Props) {
  const pathname = usePathname();
  const isAdmin = user.role === "admin" || user.role === "patron";

  // Détecte si on est sur une fiche employé pour afficher les sous-liens
  const employeMatch = pathname.match(/^\/dashboard\/employes\/(\d+)/);
  const employeId = employeMatch?.[1];

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-[#16162a] border-r border-white/10 h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-[#2a2250] border border-[#3d3580] rounded-lg flex items-center justify-center text-[#a89af9] text-sm">
          ⬡
        </div>
        <div>
          <p className="text-white font-medium text-sm leading-none">GTA RP</p>
          <p className="text-white/40 text-xs mt-0.5">Manager</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => <NavLink key={item.href} {...item} />)}

        <div className="pt-3 pb-1 px-3">
          <p className="text-white/20 text-xs uppercase tracking-widest">RH</p>
        </div>
        {RH_NAV.map((item) => <NavLink key={item.href} {...item} />)}

        {/* Sous-menu employé si on est sur une fiche */}
        {employeId && (
          <div className="ml-3 pl-3 border-l border-white/10 space-y-1">
            {[
              { href: `/dashboard/employes/${employeId}`,          label: "Fiche",     icon: "👤" },
              { href: `/dashboard/employes/${employeId}/contrats`, label: "Contrats",  icon: "📄" },
            ].map(({ href, label, icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                    active
                      ? "bg-[#2a2250] text-[#c4bbff] border border-[#3d3580]"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}>
                  <span>{icon}</span>
                  {label}
                </Link>
              );
            })}
          </div>
        )}

        {isAdmin && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-white/20 text-xs uppercase tracking-widest">Admin</p>
            </div>
            {ADMIN_NAV.map((item) => <NavLink key={item.href} {...item} />)}
          </>
        )}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#2a2250] border border-[#3d3580] flex items-center justify-center text-[#a89af9] text-xs font-medium uppercase">
            {user.username?.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user.username}</p>
            <p className="text-white/30 text-xs capitalize">{user.role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
        >
          ← Déconnexion
        </button>
      </div>
    </aside>
  );
}
