// Exemple : app/dashboard/ventes/nouvelle/page.tsx
import { prisma } from "@/lib/db/prisma";
import NouvelleVenteForm from "@/components/ventes/NouvelleVenteForm"; // Ajuste le chemin

export default async function NouvelleVentePage() {
  // 1. Récupère les données brutes depuis Prisma
  const clientsRaw = await prisma.client.findMany({
    orderBy: { nom: "asc" },
  });

  const produitsRaw = await prisma.produit.findMany({
    orderBy: { nom: "asc" },
    // Optionnel : ne prendre que les produits actifs pour la vente
    where: { actif: true } 
  });

  // 2. Sérialise les types complexes (Prisma.Decimal -> number)
  const produits = produitsRaw.map(p => ({
    id: p.id,
    nom: p.nom,
    // .toNumber() convertit le Decimal de Prisma en un Number standard JS
    prixVente: typeof p.prixVente === 'object' && p.prixVente !== null && 'toNumber' in p.prixVente
      ? (p.prixVente as any).toNumber() 
      : Number(p.prixVente),
    stock: p.stock,
    categorie: p.categorie
  }));

  const clients = clientsRaw.map(c => ({
    id: c.id,
    nom: c.nom,
    prenom: c.prenom,
  }));

  // 3. Passe les données nettoyées au composant Client
  return (
    <div className="p-6">
      <h1 className="text-xl font-medium text-white mb-6">Nouvelle Vente</h1>
      <NouvelleVenteForm clients={clients} produits={produits} />
    </div>
  );
}