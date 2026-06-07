import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const ventes = await prisma.vente.findMany({
    orderBy: { dateVente: "desc" },
    take: 50,
    include: {
      client: true,
      employe: true,
      produits: { include: { produit: true } },
    },
  });
  return NextResponse.json(ventes);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user as any;
  const body = await req.json();
  const { clientId, lignes } = body;
  // lignes = [{ produitId, quantite, prixUnitaire }]

  if (!clientId || !lignes?.length) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  const montantTotal = lignes.reduce(
    (acc: number, l: any) => acc + l.quantite * l.prixUnitaire,
    0
  );

  const employe = await prisma.employe.findFirst({
    where: { utilisateur: { id: parseInt(user.id) } },
  });

  if (!employe) return NextResponse.json({ error: "Employé introuvable" }, { status: 400 });

  // Transaction Prisma : tout ou rien
  const vente = await prisma.$transaction(async (tx) => {
    // 1. Créer la vente
    const v = await tx.vente.create({
      data: {
        employeId: employe.id,
        clientId: parseInt(clientId),
        montantTotal,
        statut: "validee",
        produits: {
          create: lignes.map((l: any) => ({
            produitId: l.produitId,
            quantite: l.quantite,
            prixUnitaire: l.prixUnitaire,
            totalLigne: l.quantite * l.prixUnitaire,
          })),
        },
      },
    });

    // 2. Diminuer le stock de chaque produit
    for (const l of lignes) {
      await tx.produit.update({
        where: { id: l.produitId },
        data: { stock: { decrement: l.quantite } },
      });
    }

    // 3. Créditer Gringotts
    await tx.gringotts.updateMany({
      data: { solde: { increment: montantTotal } },
    });

    // 4. Créer la transaction financière
    await tx.transactionGringotts.create({
      data: {
        typeTransaction: "vente",
        montant: montantTotal,
        description: `Vente #${v.id}`,
        employeId: employe.id,
        venteId: v.id,
      },
    });

    return v;
  });

  return NextResponse.json(vente, { status: 201 });
}
