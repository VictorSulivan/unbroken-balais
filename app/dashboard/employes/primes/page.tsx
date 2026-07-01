import { prisma } from "@/lib/db/prisma";
import NouvelleprimeForm from "@/components/employes/NouvellePrimeForm";

export default async function PrimesPage() {
  const now = new Date();
  const semestreActuel = now.getMonth() < 6 ? 1 : 2;
  const anneeActuelle = now.getFullYear();
  const semestreDebut = new Date(anneeActuelle, semestreActuel === 1 ? 0 : 6, 1);
  const semestreFin = new Date(anneeActuelle, semestreActuel === 1 ? 6 : 12, 1);

  const [primes, employes, ventesGringotts] = await Promise.all([
    prisma.prime.findMany({
      orderBy: { createdAt: "desc" },
      include: { employe: true, attribuePar: true },
    }),
    prisma.employe.findMany({
      where: { actif: true },
      orderBy: { nom: "asc" },
      select: { id: true, nom: true, prenom: true, pourcentagePrime: true },
    }),
    prisma.vente.findMany({
      where: {
        statut: "validee",
        dateVente: { gte: semestreDebut, lt: semestreFin },
      },
      select: { employeId: true, montantTotal: true },
    }),
  ]);

  // Budget primes = 20% du CA du semestre
  const revenuSemestre = ventesGringotts.reduce((s, v) => s + v.montantTotal, 0);
  const budgetPrimes = revenuSemestre * 0.2;

  // CA par employé sur le semestre courant
  const ventesParEmploye: Record<number, number> = {};
  for (const v of ventesGringotts) {
    ventesParEmploye[v.employeId] = (ventesParEmploye[v.employeId] ?? 0) + v.montantTotal;
  }

  // Primes déjà attribuées ce semestre
  const primesActuelles = primes.filter(
    (p) => p.semestre === semestreActuel && p.annee === anneeActuelle
  );
  const primesAttributes = primesActuelles.reduce((s, p) => s + p.montant, 0);
  const budgetRestant = budgetPrimes - primesAttributes;

  const totalPrimes = primes.reduce((acc, p) => acc + p.montant, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-white">Primes</h1>
          <p className="text-white/40 text-sm mt-1">{primes.length} primes — total ${totalPrimes.toLocaleString()}</p>
        </div>
      </div>

      {/* Budget primes du semestre */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#16162a] border border-white/10 rounded-xl p-4">
          <p className="text-white/40 text-xs mb-1">CA S{semestreActuel}/{anneeActuelle}</p>
          <p className="text-lg font-medium text-white">${revenuSemestre.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-[#16162a] border border-[#3d3580]/60 rounded-xl p-4">
          <p className="text-white/40 text-xs mb-1">Budget primes (20%)</p>
          <p className="text-lg font-medium text-[#c4bbff]">${budgetPrimes.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}</p>
        </div>
        <div className={`bg-[#16162a] border rounded-xl p-4 ${budgetRestant < 0 ? "border-red-500/30" : "border-white/10"}`}>
          <p className="text-white/40 text-xs mb-1">Restant</p>
          <p className={`text-lg font-medium ${budgetRestant < 0 ? "text-red-400" : "text-green-400"}`}>
            ${budgetRestant.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Formulaire */}
        <NouvelleprimeForm
          employes={employes}
          ventesParEmploye={ventesParEmploye}
          semestreActuel={semestreActuel}
          anneeActuelle={anneeActuelle}
        />

        {/* Historique */}
        <div className="bg-[#16162a] border border-white/10 rounded-xl overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-white/10">
            <p className="text-xs text-white/40 uppercase tracking-widest">Historique</p>
          </div>
          <div className="divide-y divide-white/5">
            {primes.map((p) => (
              <div key={p.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2a2250] border border-[#3d3580] flex items-center justify-center text-[#a89af9] text-xs font-medium uppercase shrink-0">
                    {p.employe.prenom[0]}{p.employe.nom[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{p.employe.prenom} {p.employe.nom}</p>
                    <p className="text-white/40 text-xs">
                      S{p.semestre}/{p.annee}
                      {p.commentaire && ` · ${p.commentaire}`}
                    </p>
                    {p.attribuePar && (
                      <p className="text-white/20 text-xs">par {p.attribuePar.prenom} {p.attribuePar.nom}</p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-orange-400 font-medium text-sm">+${p.montant.toFixed(0)}</p>
                  <p className="text-white/20 text-xs">
                    {new Date(p.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                  </p>
                </div>
              </div>
            ))}
            {primes.length === 0 && (
              <div className="text-center py-12 text-white/30 text-sm">Aucune prime attribuée.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
