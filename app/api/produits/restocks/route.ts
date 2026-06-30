import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user;
  const body = await req.json();
  const { lignes } = body; // lignes: Array<{ produitId: number, quantite: number }>

  if (!lignes || lignes.length === 0) {
    return NextResponse.json({ error: "Aucun produit à restocker" }, { status: 400 });
  }

  const employe = await prisma.employe.findFirst({
    where: { utilisateur: { id: parseInt(user.id) } },
  });
  if (!employe) return NextResponse.json({ error: "Employé introuvable" }, { status: 400 });

  try {
    const resultat = await prisma.$transaction(async (tx) => {
      let valeurTotaleRestock = 0;
      const lignesCombinees = [];

      // 1. Première boucle pour valider les produits et calculer le coût total indicatif
      for (const ligne of lignes) {
        const produit = await tx.produit.findUnique({
          where: { id: parseInt(ligne.produitId) },
        });

        if (!produit) {
          throw new Error(`Produit #${ligne.produitId} introuvable`);
        }

        const coutLigne = ligne.quantite * produit.prixAchat;
        valeurTotaleRestock += coutLigne;

        lignesCombinees.push({
          produitId: produit.id,
          quantite: ligne.quantite,
          prixAchatUnitaire: produit.prixAchat,
        });
      }

      // 2. Création de l'historique principal (Restock) et de ses détails (RestockProduit)
      const nouveauRestock = await tx.restock.create({
        data: {
          employeId: employe.id,
          valeurTotale: valeurTotaleRestock,
          produits: {
            create: lignesCombinees.map((l) => ({
              produitId: l.produitId,
              quantite: l.quantite,
              prixAchatUnitaire: l.prixAchatUnitaire,
            })),
          },
        },
        include: {
          produits: true,
        },
      });

      // 3. Incrémentation des stocks physiques
      for (const l of lignesCombinees) {
        await tx.produit.update({
          where: { id: l.produitId },
          data: { stock: { increment: l.quantite } },
        });
      }

      return nouveauRestock;
    });

    return NextResponse.json({ success: true, restock: resultat }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur lors du restock";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}