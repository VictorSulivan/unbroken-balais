import { prisma } from "../lib/db/prisma";

async function main() {
  // Entreprise
  const entreprise = await prisma.entreprise.upsert({
    where: { id: 1 },
    update: {},
    create: { nom: "Les 3 Balais" },
  });

  // Gringotts
  await prisma.gringotts.upsert({
    where: { entrepriseId: entreprise.id },
    update: {},
    create: { entrepriseId: entreprise.id, solde: 50000 },
  });

  // Produits
  await prisma.produit.createMany({
    skipDuplicates: true,
    data: [
      { nom: "Burger Los Santos", categorie: "plat", stock: 50, prixAchat: 5, prixVente: 15 },
      { nom: "Hot Dog Vinewood", categorie: "plat", stock: 30, prixAchat: 3, prixVente: 10 },
      { nom: "Pizza Grove Street", categorie: "plat", stock: 3, prixAchat: 8, prixVente: 20 },
      { nom: "Cola", categorie: "boisson", stock: 100, prixAchat: 1, prixVente: 5 },
      { nom: "Bière Maze Bank", categorie: "boisson", stock: 4, prixAchat: 2, prixVente: 8 },
      { nom: "Eau", categorie: "boisson", stock: 200, prixAchat: 0.5, prixVente: 3 },
    ],
  });

  // Clients
  await prisma.client.createMany({
    skipDuplicates: true,
    data: [
      { nom: "Martin", prenom: "Trevor", typeClient: "particulier", entrepriseId: entreprise.id },
      { nom: "Johnson", prenom: "Michael", typeClient: "particulier", entrepriseId: entreprise.id },
      { nom: "Franklin", prenom: "Clinton", typeClient: "particulier", entrepriseId: entreprise.id },
    ],
  });

  console.log("✅ Seed terminé");
}

main().catch(console.error).finally(() => prisma.$disconnect());
