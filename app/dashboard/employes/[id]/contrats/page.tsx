import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import NouveauContratForm from "@/components/employes/NouveauContratForm";
import ContratActions from "@/components/employes/ContratActions";
import Link from "next/link";

export default async function ContratsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const employe = await prisma.employe.findUnique({
    where: { id: parseInt(id) },
    include: { contrats: { orderBy: { dateDebut: "desc" } } },
  });

  if (!employe) notFound();

  const typeColor: Record<string, string> = {
    CDI:       "bg-green-500/10 text-green-400 border-green-500/20",
    "Co-Patron":       "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Stage:     "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Patron: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/dashboard/employes/${id}`}
          className="text-white/30 hover:text-white text-sm transition-colors">
          ← {employe.prenom} {employe.nom}
        </Link>
        <span className="text-white/20">/</span>
        <h1 className="text-2xl font-medium text-white">Contrats</h1>
      </div>

      <NouveauContratForm employeId={employe.id} />

      <div className="bg-[#16162a] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-xs text-white/40 uppercase tracking-widest">Historique des contrats</p>
        </div>

        {employe.contrats.length === 0 ? (
          <div className="text-center py-12 text-white/30 text-sm">Aucun contrat enregistré.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {employe.contrats.map((c) => (
              <div key={c.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${typeColor[c.typeContrat] ?? "bg-white/5 text-white/40 border-white/10"}`}>
                        {c.typeContrat}
                      </span>
                      {c.estActif && (
                        <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full">
                          Actif
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span>
                        {new Date(c.dateDebut).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                        {c.dateFin && ` → ${new Date(c.dateFin).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      {c.salaire && <span className="text-white">${c.salaire.toLocaleString()}/mois</span>}
                      {c.pourcentagePrime && <span className="text-[#a89af9]">{c.pourcentagePrime}% prime</span>}
                    </div>
                    {c.commentaire && (
                      <p className="text-white/30 text-xs">{c.commentaire}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/dashboard/employes/${id}/contrats/${c.id}`}
                      className="text-xs text-[#a89af9] hover:underline px-2 py-1 rounded transition-colors"
                    >
                      Voir PDF
                    </Link>
                    <ContratActions id={c.id} estActif={c.estActif} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
