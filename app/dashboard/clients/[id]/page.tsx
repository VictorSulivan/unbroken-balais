import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import ClientEditForm from "@/components/clients/ClientEditForm";
import { fmtDate } from "@/utils/formatDate";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) },
    include: {
      entrepriseCliente: true,
      ventes: {
        orderBy: { dateVente: "desc" },
        take: 10,
        include: { employe: true, produits: { include: { produit: true } } },
      },
    },
  });

  if (!client) notFound();

  const totalVentes = await prisma.vente.aggregate({
    where: { clientId: client.id, statut: "validee" },
    _sum: { montantTotal: true },
    _count: true,
  });

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-[#1a1a2e] border border-white/10 flex items-center justify-center text-white/50 text-lg font-medium uppercase">
          {client.prenom?.[0] ?? client.nom[0]}{client.nom[0]}
        </div>
        <div>
          <h1 className="text-2xl font-medium text-white">{client.prenom} {client.nom}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full border ${
              client.typeClient === "entreprise"
                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                : "bg-white/5 text-white/40 border-white/10"
            }`}>
              {client.typeClient ?? "particulier"}
            </span>
            {client.entrepriseCliente && (
              <span className="text-white/30 text-xs">{client.entrepriseCliente.nom}</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Commandes",  value: totalVentes._count.toString() },
          { label: "Total dépensé", value: `${(totalVentes._sum.montantTotal ?? 0).toFixed(0)}Mornilles` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#16162a] border border-white/10 rounded-xl p-4">
            <p className="text-xl font-medium text-white">{value}</p>
            <p className="text-white/40 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Formulaire édition */}
      <ClientEditForm client={{
        id: client.id,
        nom: client.nom,
        prenom: client.prenom,
        typeClient: client.typeClient,
      }} />

      {/* Historique ventes */}
      {client.ventes.length > 0 && (
        <div className="bg-[#16162a] border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <p className="text-xs text-white/40 uppercase tracking-widest">Historique des commandes</p>
          </div>
          <div className="divide-y divide-white/5">
            {client.ventes.map((v) => (
              <div key={v.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-white text-sm">
                    {v.produits.map((p) => `${p.produit.nom} ×${p.quantite}`).join(", ")}
                  </p>
                  <p className="text-white/30 text-xs mt-0.5">par {v.employe.prenom} {v.employe.nom}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white font-medium text-sm">${v.montantTotal.toFixed(0)}</p>
                  <p className="text-white/30 text-xs">
                    {fmtDate(v.dateVente, { day: "2-digit", month: "short" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
