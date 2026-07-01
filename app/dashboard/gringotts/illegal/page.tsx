import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { getAcces } from "@/utils/acces";
import { redirect } from "next/navigation";
import Link from "next/link";

const POSITIF = ["vente", "versement"];

export default async function GringottsIllegalPage() {
  const session = await auth();
  const acces = await getAcces(session?.user.employeId ?? null, session?.user.role ?? "");
  if (!acces.illegal) redirect("/dashboard");

  const transactions = await prisma.transactionGringotts.findMany({
    where: { vente: { illegal: true } },
    orderBy: { createdAt: "desc" },
    include: {
      employe: true,
      vente: { include: { client: true, produits: { include: { produit: true } } } },
    },
  });

  const totalIllegal = transactions
    .filter((t) => POSITIF.includes(t.typeTransaction ?? ""))
    .reduce((acc, t) => acc + (t.montant ?? 0), 0);

  // Midnight today in Europe/Paris expressed as a UTC timestamp
  const now = new Date();
  const parisOffsetMs = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Paris" })).getTime() - now.getTime();
  const todayParis = now.toLocaleDateString("sv", { timeZone: "Europe/Paris" }); // "YYYY-MM-DD"
  const aujourd = new Date(new Date(todayParis + "T00:00:00Z").getTime() - parisOffsetMs);

  const revenusJour = transactions
    .filter((t) => POSITIF.includes(t.typeTransaction ?? "") && new Date(t.createdAt) >= aujourd)
    .reduce((acc, t) => acc + (t.montant ?? 0), 0);

  const nbVentesIllegales = new Set(transactions.map((t) => t.venteId).filter(Boolean)).size;

  const stats = [
    { label: "Revenus illégaux (total)",  value: `${totalIllegal.toLocaleString("fr-FR")} Mornilles`, color: "text-red-400" },
    { label: "Revenus aujourd'hui",       value: `+${revenusJour.toFixed(0)} Mornilles`,              color: "text-orange-400" },
    { label: "Ventes illégales",          value: nbVentesIllegales.toString(),                        color: "text-white" },
    { label: "Transactions enregistrées", value: transactions.length.toString(),                      color: "text-white" },
  ];

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-1 rounded-full border bg-red-500/10 text-red-400 border-red-500/20">
              Accès restreint
            </span>
          </div>
          <h1 className="text-2xl font-medium text-white">Gringotts — Activité illégale</h1>
          <p className="text-white/40 text-sm mt-1">Relevé des gains issus des ventes illégales</p>
        </div>
        <Link
          href="/dashboard/gringotts"
          className="flex items-center gap-2 text-xs text-[#a89af9] hover:text-[#bcafff] border border-[#a89af9]/20 hover:border-[#a89af9]/40 bg-[#a89af9]/5 hover:bg-[#a89af9]/10 rounded-lg px-3 py-2 transition-all"
        >
          ← Gringotts légal
        </Link>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-[#16162a] border border-red-500/10 rounded-xl p-5">
            <p className={`text-2xl font-medium ${color}`}>{value}</p>
            <p className="text-white/40 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#16162a] border border-red-500/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-white/40 text-xs uppercase tracking-widest">Transactions illégales</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Vente</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Client</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Produits</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Employé</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Montant</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-5 py-4 text-white/30">#{t.venteId ?? "—"}</td>
                <td className="px-5 py-4 text-white">
                  {t.vente?.client ? `${t.vente.client.prenom} ${t.vente.client.nom}` : "—"}
                </td>
                <td className="px-5 py-4 text-white/60 text-xs">
                  {t.vente?.produits.map((p) => `${p.produit.nom} ×${p.quantite}`).join(", ") ?? "—"}
                </td>
                <td className="px-5 py-4 text-white/60">
                  {t.employe ? `${t.employe.prenom} ${t.employe.nom}` : "—"}
                </td>
                <td className="px-5 py-4 text-right font-medium text-red-400">
                  +${t.montant?.toFixed(0) ?? "0"}
                </td>
                <td className="px-5 py-4 text-right text-white/40 text-xs">
                  {new Date(t.createdAt).toLocaleDateString("fr-FR", {
                    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                    timeZone: "Europe/Paris",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <div className="text-center py-16 text-white/30">Aucune transaction illégale enregistrée.</div>
        )}
      </div>
    </div>
  );
}
