import { prisma } from "@/lib/db/prisma";
import NouvelleVenteForm from "@/components/ventes/NouvelleVenteForm";

export default async function NouvelleVentePage() {
  const [clients, produits] = await Promise.all([
    prisma.client.findMany({ orderBy: { nom: "asc" } }),
    prisma.produit.findMany({ where: { actif: true, stock: { gt: 0 } }, orderBy: { nom: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-white">Nouvelle vente</h1>
        <p className="text-white/40 text-sm mt-1">Créer une commande client</p>
      </div>
      <NouvelleVenteForm clients={clients} produits={produits} />
    </div>
  );
}
