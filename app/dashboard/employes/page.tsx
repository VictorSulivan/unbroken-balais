import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import EmployeActions from "@/components/employes/EmployeActions";

export default async function EmployesPage() {
  const employes = await prisma.employe.findMany({
    orderBy: { nom: "asc" },
    include: { utilisateur: true },
  });

  const roleColor: Record<string, string> = {
    patron:    "bg-[#2a2250] text-[#c4bbff] border-[#3d3580]",
    co_patron: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    employe:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
    stagiaire: "bg-white/5 text-white/40 border-white/10",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-white">Employés</h1>
          <p className="text-white/40 text-sm mt-1">{employes.filter(e => e.actif).length} actifs</p>
        </div>
        <Link
          href="/dashboard/employes/nouveau"
          className="flex items-center gap-2 bg-[#2a2250] hover:bg-[#342b6e] border border-[#3d3580] text-[#c4bbff] text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nouvel employé
        </Link>
      </div>

      <div className="bg-[#16162a] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Employé</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Rôle</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Compte</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Salaire</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Statut</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {employes.map((e) => (
              <tr key={e.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2a2250] border border-[#3d3580] flex items-center justify-center text-[#a89af9] text-xs font-medium uppercase">
                      {e.prenom[0]}{e.nom[0]}
                    </div>
                    <div>
                      <p className="text-white font-medium">{e.prenom} {e.nom}</p>
                      {e.utilisateur && (
                        <p className="text-white/30 text-xs">@{e.utilisateur.username}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full border ${roleColor[e.role] ?? ""}`}>
                    {e.role.replace("_", " ")}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {e.utilisateur ? (
                    <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full">Actif</span>
                  ) : (
                    <span className="text-xs text-white/20">Aucun</span>
                  )}
                </td>
                <td className="px-5 py-4 text-right text-white/60">
                  {e.salaire ? `${e.salaire.toLocaleString()} Mornilles` : "—"}
                </td>
                <td className="px-5 py-4 text-right">
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    e.actif
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-white/5 text-white/30 border-white/10"
                  }`}>
                    {e.actif ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <EmployeActions id={e.id} actif={e.actif} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {employes.length === 0 && (
          <div className="text-center py-16 text-white/30">
            Aucun employé.
          </div>
        )}
      </div>
    </div>
  );
}
