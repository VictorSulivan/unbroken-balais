import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { nom: "asc" },
    include: {
      entrepriseCliente: true,
      _count: { select: { ventes: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-white">Clients</h1>
          <p className="text-white/40 text-sm mt-1">{clients.length} clients enregistrés</p>
        </div>
        <Link
          href="/dashboard/clients/nouveau"
          className="flex items-center gap-2 bg-[#2a2250] hover:bg-[#342b6e] border border-[#3d3580] text-[#c4bbff] text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nouveau client
        </Link>
      </div>

      <div className="bg-[#16162a] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Client</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Type</th>
              <th className="text-left px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Entreprise</th>
              <th className="text-right px-5 py-3 text-white/30 font-medium text-xs uppercase tracking-wider">Ventes</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1a1a2e] border border-white/10 flex items-center justify-center text-white/50 text-xs font-medium uppercase">
                      {c.prenom?.[0] ?? c.nom[0]}{c.nom[0]}
                    </div>
                    <span className="text-white font-medium">{c.prenom} {c.nom}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    c.typeClient === "entreprise"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : "bg-white/5 text-white/40 border-white/10"
                  }`}>
                    {c.typeClient ?? "particulier"}
                  </span>
                </td>
                <td className="px-5 py-4 text-white/50">
                  {c.entrepriseCliente?.nom ?? "—"}
                </td>
                <td className="px-5 py-4 text-right text-white">{c._count.ventes}</td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/dashboard/clients/${c.id}`}
                    className="text-xs text-white/40 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors"
                  >
                    Voir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clients.length === 0 && (
          <div className="text-center py-16 text-white/30">
            Aucun client. <Link href="/dashboard/clients/nouveau" className="text-[#a89af9] underline">Créer le premier</Link>
          </div>
        )}
      </div>
    </div>
  );
}
