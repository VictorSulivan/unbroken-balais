import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { getAcces } from "@/utils/acces";
import Link from "next/link";

type Props = { searchParams: Promise<{ vue?: string }> };

export default async function VentesPage({ searchParams }: Props) {
  const session = await auth();
  const acces = await getAcces(session?.user.employeId ?? null, session?.user.role ?? "");
  const { vue } = await searchParams;

  const vueActive = acces.illegal ? (vue ?? "tous") : "legal";

  const whereIllegal =
    !acces.illegal ? { illegal: false }
    : vueActive === "legal" ? { illegal: false }
    : vueActive === "illegal" ? { illegal: true }
    : {};

  const ventes = await prisma.vente.findMany({
    where: whereIllegal,
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
          <p className="text-white/40 text-sm mt-1">{ventes.length} ventes affichées</p>
        </div>
        <div className="flex items-center gap-3">
          {acces.illegal && (
            <div className="flex rounded-lg border border-white/10 overflow-hidden text-xs">
              {[
                { key: "tous", label: "Toutes" },
                { key: "legal", label: "Légales" },
                { key: "illegal", label: "Illégales" },
              ].map(({ key, label }) => (
                <Link
                  key={key}
                  href={`/dashboard/ventes?vue=${key}`}
                  className={`px-3 py-1.5 transition-colors ${
                    vueActive === key
                      ? "bg-[#2a2250] text-[#c4bbff]"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
          <Link
            href="/dashboard/ventes/nouvelle"
            className="flex items-center gap-2 bg-[#2a2250] hover:bg-[#342b6e] border border-[#3d3580] text-[#c4bbff] text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            + Nouvelle vente
          </Link>
        </div>
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
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white/30">#{v.id}</span>
                    {acces.illegal && v.illegal && (
                      <span className="text-xs px-1.5 py-0.5 rounded border bg-red-500/10 text-red-400 border-red-500/20">
                        illégal
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-white">{v.client.prenom} {v.client.nom}</td>
                <td className="px-5 py-4 text-white/60">{v.employe.prenom} {v.employe.nom}</td>
                <td className="px-5 py-4 text-white/60">
                  {v.produits.map((p) => `${p.produit.nom} ×${p.quantite}`).join(", ")}
                </td>
                <td className="px-5 py-4 text-right text-white font-medium">${v.montantTotal.toFixed(0)}</td>
                <td className="px-5 py-4 text-right text-white/40 text-xs">
                  {new Date(v.dateVente).toLocaleDateString("fr-FR", {
                    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                    timeZone: "Europe/Paris",
                  })}
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
