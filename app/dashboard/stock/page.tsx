import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import StockActions from "@/components/stock/StockActions";

export default async function StockPage() {
  const produits = await prisma.produit.findMany({
    orderBy: { nom: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-white">Stock & Produits</h1>
          <p className="text-white/40 text-sm mt-1">{produits.length} produits au total</p>
        </div>
        <Link
          href="/dashboard/stock/nouveau"
          className="flex items-center gap-2 bg-[#2a2250] hover:bg-[#342b6e] border border-[#3d3580] text-[#c4bbff] text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nouveau produit
        </Link>
      </div>

      <div className="bg-[#16162a] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Produit</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Catégorie</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Stock</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Prix achat</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Prix vente</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Statut</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {produits.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-5 py-4 text-white font-medium">{p.nom}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    p.categorie === "plat"
                      ? "bg-[#1a2a1a] text-green-400 border-green-500/30"
                      : "bg-[#1a1a2a] text-blue-400 border-blue-500/30"
                  }`}>
                    {p.categorie}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className={`font-medium ${p.stock <= 5 ? "text-orange-400" : "text-white"}`}>
                    {p.stock}
                    {p.stock <= 5 && <span className="ml-1 text-xs">⚠️</span>}
                  </span>
                </td>
                <td className="px-5 py-4 text-right text-white/60">${p.prixAchat.toFixed(0)}</td>
                <td className="px-5 py-4 text-right text-white">${p.prixVente.toFixed(0)}</td>
                <td className="px-5 py-4 text-right">
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    p.actif
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-white/5 text-white/30 border-white/10"
                  }`}>
                    {p.actif ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <StockActions id={p.id} actif={p.actif} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {produits.length === 0 && (
          <div className="text-center py-16 text-white/30">
            Aucun produit. <Link href="/dashboard/stock/nouveau" className="text-[#a89af9] underline">Créer le premier</Link>
          </div>
        )}
      </div>
    </div>
  );
}
