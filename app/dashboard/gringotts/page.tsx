import { prisma } from "@/lib/db/prisma";

export default async function GringottsPage() {
  const [gringotts, transactions] = await Promise.all([
    prisma.gringotts.findFirst({ include: { entreprise: true } }),
    prisma.transactionGringotts.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { employe: true, vente: { include: { client: true } } },
    }),
  ]);

  const solde = gringotts?.solde ?? 0;

  const aujourd = new Date();
  aujourd.setHours(0, 0, 0, 0);

  const revenusJour = transactions
    .filter((t) => t.typeTransaction === "vente" && new Date(t.createdAt) >= aujourd)
    .reduce((acc, t) => acc + (t.montant ?? 0), 0);

  const depensesJour = transactions
    .filter((t) => t.typeTransaction !== "vente" && new Date(t.createdAt) >= aujourd)
    .reduce((acc, t) => acc + (t.montant ?? 0), 0);

  const stats = [
    { label: "Solde actuel",       value: `$${solde.toLocaleString("fr-FR")}`,        color: "text-white" },
    { label: "Revenus aujourd'hui", value: `+$${revenusJour.toFixed(0)}`,             color: "text-green-400" },
    { label: "Dépenses aujourd'hui",value: `-$${depensesJour.toFixed(0)}`,            color: "text-red-400" },
    { label: "Transactions",        value: transactions.length.toString(),             color: "text-white" },
  ];

  const typeColor: Record<string, string> = {
    vente:   "bg-green-500/10 text-green-400 border-green-500/20",
    salaire: "bg-red-500/10 text-red-400 border-red-500/20",
    prime:   "bg-orange-500/10 text-orange-400 border-orange-500/20",
    achat:   "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-white">Gringotts</h1>
        <p className="text-white/40 text-sm mt-1">Économie des {gringotts?.entreprise.nom ?? "l'entreprise"}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-[#16162a] border border-white/10 rounded-xl p-5">
            <p className={`text-2xl font-medium ${color}`}>{value}</p>
            <p className="text-white/40 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Historique transactions */}
      <div className="bg-[#16162a] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-white/40 text-xs uppercase tracking-widest">Historique des transactions</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Type</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Description</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Employé</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Montant</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full border ${typeColor[t.typeTransaction ?? ""] ?? "bg-white/5 text-white/40 border-white/10"}`}>
                    {t.typeTransaction ?? "—"}
                  </span>
                </td>
                <td className="px-5 py-4 text-white/60">{t.description ?? "—"}</td>
                <td className="px-5 py-4 text-white/60">
                  {t.employe ? `${t.employe.prenom} ${t.employe.nom}` : "—"}
                </td>
                <td className={`px-5 py-4 text-right font-medium ${
                  t.typeTransaction === "vente" ? "text-green-400" : "text-red-400"
                }`}>
                  {t.typeTransaction === "vente" ? "+" : "-"}${t.montant?.toFixed(0) ?? "0"}
                </td>
                <td className="px-5 py-4 text-right text-white/40 text-xs">
                  {new Date(t.createdAt).toLocaleDateString("fr-FR", {
                    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {transactions.length === 0 && (
          <div className="text-center py-16 text-white/30">
            Aucune transaction pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
