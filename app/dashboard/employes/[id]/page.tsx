import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import EmployeEditForm from "@/components/employes/EmployeEditForm";

export default async function EmployePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const employe = await prisma.employe.findUnique({
    where: { id: parseInt(id) },
    include: {
      utilisateur: true,
      rolesHistorique: { orderBy: { dateChangement: "desc" } },
      ventes: {
        orderBy: { dateVente: "desc" },
        take: 5,
        include: { client: true },
      },
      primes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!employe) notFound();

  const totalVentes = await prisma.vente.aggregate({
    where: { employeId: employe.id, statut: "validee" },
    _sum: { montantTotal: true },
    _count: true,
  });

  const roleColor: Record<string, string> = {
    patron:    "bg-[#2a2250] text-[#c4bbff] border-[#3d3580]",
    co_patron: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    employe:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
    stagiaire: "bg-white/5 text-white/40 border-white/10",
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-[#2a2250] border border-[#3d3580] flex items-center justify-center text-[#a89af9] text-lg font-medium uppercase">
          {employe.prenom[0]}{employe.nom[0]}
        </div>
        <div>
          <h1 className="text-2xl font-medium text-white">{employe.prenom} {employe.nom}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full border ${roleColor[employe.role] ?? ""}`}>
              {employe.role.replace("_", " ")}
            </span>
            {employe.utilisateur && (
              <span className="text-xs text-white/30">@{employe.utilisateur.username}</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Ventes réalisées", value: totalVentes._count.toString() },
          { label: "CA généré",        value: `$${(totalVentes._sum.montantTotal ?? 0).toFixed(0)}` },
          { label: "Salaire",          value: employe.salaire ? `$${employe.salaire.toLocaleString()}` : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#16162a] border border-white/10 rounded-xl p-4">
            <p className="text-xl font-medium text-white">{value}</p>
            <p className="text-white/40 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Formulaire édition */}
      <EmployeEditForm employe={{ id: employe.id, nom: employe.nom, prenom: employe.prenom, role: employe.role, salaire: employe.salaire, notes: employe.notes }} />

      {/* Historique rôles */}
      {employe.rolesHistorique.length > 0 && (
        <div className="bg-[#16162a] border border-white/10 rounded-xl p-5">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Historique des rôles</p>
          <div className="space-y-3">
            {employe.rolesHistorique.map((h) => (
              <div key={h.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-white/60">
                  {h.ancienRole ? (
                    <>
                      <span>{h.ancienRole.replace("_", " ")}</span>
                      <span className="text-white/20">→</span>
                      <span className="text-white">{h.nouveauRole?.replace("_", " ")}</span>
                    </>
                  ) : (
                    <span className="text-white">Embauche — {h.nouveauRole?.replace("_", " ")}</span>
                  )}
                </div>
                <span className="text-white/30 text-xs">
                  {new Date(h.dateChangement).toLocaleDateString("fr-FR", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dernières ventes */}
      {employe.ventes.length > 0 && (
        <div className="bg-[#16162a] border border-white/10 rounded-xl p-5">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Dernières ventes</p>
          <div className="space-y-2">
            {employe.ventes.map((v) => (
              <div key={v.id} className="flex items-center justify-between text-sm">
                <span className="text-white/60">{v.client.prenom} {v.client.nom}</span>
                <div className="flex items-center gap-4">
                  <span className="text-white">${v.montantTotal.toFixed(0)}</span>
                  <span className="text-white/30 text-xs">
                    {new Date(v.dateVente).toLocaleDateString("fr-FR", {
                      day: "2-digit", month: "short",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
