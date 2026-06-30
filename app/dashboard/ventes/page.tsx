import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { fmtDate } from "@/utils/formatDate";

export default async function VentesPage() {
  const ventes = await prisma.vente.findMany({
    orderBy: { dateVente: "desc" },
    take: 50,
    include: {
      client: true,
      employe: true,
      produits: { include: { produit: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-white">Ventes</h1>
          <p className="text-white/40 text-sm mt-1">{ventes.length} dernières ventes</p>
        </div>
        <Link
          href="/dashboard/ventes/nouvelle"
          className="flex items-center gap-2 bg-[#2a2250] hover:bg-[#342b6e] border border-[#3d3580] text-[#c4bbff] text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nouvelle vente
        </Link>
      </div>

      <div className="bg-[#16162a] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">#</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Client</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Employé</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Produits</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Total</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {ventes.map((v) => (
              <tr key={v.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-5 py-4 text-white/30">#{v.id}</td>
                <td className="px-5 py-4 text-white">{v.client.prenom} {v.client.nom}</td>
                <td className="px-5 py-4 text-white/60">{v.employe.prenom} {v.employe.nom}</td>
                <td className="px-5 py-4 text-white/60">
                  {v.produits.map((p) => `${p.produit.nom} ×${p.quantite}`).join(", ")}
                </td>
                <td className="px-5 py-4 text-right text-white font-medium">${v.montantTotal.toFixed(0)}</td>
                <td className="px-5 py-4 text-right text-white/40 text-xs">
                  {fmtDate(v.dateVente, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ventes.length === 0 && (
          <div className="text-center py-16 text-white/30">
            Aucune vente. <Link href="/dashboard/ventes/nouvelle" className="text-[#a89af9] underline">Créer la première</Link>
          </div>
        )}
      </div>
    </div>
  );
}
