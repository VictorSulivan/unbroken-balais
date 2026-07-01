import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { getAcces } from "@/utils/acces";

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

  const body = await req.json();
  type Ligne = { produitId: number; quantite: number; prixEtudiant?: boolean; prixEmploye?: boolean };
  type Extra = { label: string; montant: number };
  const { clientId, lignes, extras }: { clientId: number; lignes: Ligne[]; extras: Extra[] } = body;

  if (!clientId || (!lignes?.length && !extras?.length)) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  const employe = await prisma.employe.findFirst({
    where: { utilisateur: { id: parseInt(session.user.id) } },
  });
  if (!employe) return NextResponse.json({ error: "Employé introuvable" }, { status: 400 });

  const acces = await getAcces(session.user.employeId ?? null, session.user.role ?? "");

  try {
    const vente = await prisma.$transaction(async (tx) => {
      let totalProduitsCalculs = 0;
      const produitsCreatePayload = [];
      let venteIllegale: boolean = false;

      for (const l of lignes ?? []) {
        const produitBDD = await tx.produit.findUnique({
          where: { id: l.produitId }
        });

        if (!produitBDD) {
          throw new Error(`Produit #${l.produitId} introuvable en base.`);
        }

        if (produitBDD.illegal) venteIllegale = true;

        const prixVenteDeBase = Number(produitBDD.prixVente);
        const prixAchatDeBase = Number(produitBDD.prixAchat);

        // Détermination du prix final unitaire selon l'option choisie
        let prixUnitaireFinal = prixVenteDeBase;

        if (l.prixEmploye) {
          prixUnitaireFinal = prixAchatDeBase; // Prix d'achat direct
        } else if (l.prixEtudiant) {
          prixUnitaireFinal = Math.round((prixVenteDeBase * 0.84) * 100) / 100; // Tarif étudiant (-16%)
        }

        const totalLigne = l.quantite * prixUnitaireFinal;
        totalProduitsCalculs += totalLigne;

        produitsCreatePayload.push({
          produitId: l.produitId,
          quantite: l.quantite,
          prixUnitaire: prixUnitaireFinal,
          totalLigne: totalLigne,
        });
      }

      if (venteIllegale && !acces.illegal) {
        throw new Error("Accès refusé : vente de produits illégaux non autorisée");
      }

      const totalExtras = (extras ?? []).reduce((acc, e) => acc + e.montant, 0);

      const montantTotal = totalProduitsCalculs + totalExtras;

      // Création de l'enregistrement de vente
      const v = await tx.vente.create({
        data: {
          employeId: employe.id,
          clientId: Number(clientId),
          montantTotal,
          statut: "validee",
          illegal: Boolean(venteIllegale),
          produits: {
            create: produitsCreatePayload,
          },
        },
      });

      // Diminuer le stock
      for (const l of lignes ?? []) {
        await tx.produit.update({
          where: { id: l.produitId },
          data: { stock: { decrement: l.quantite } },
        });
      }

      // Créditer Gringotts
      await tx.gringotts.updateMany({
        data: { solde: { increment: montantTotal } },
      });

      // Création du reçu comptable de l'opération
      const extrasDesc = (extras ?? []).length > 0
        ? ` + extras: ${(extras ?? []).map((e) => `${e.label} (${e.montant}) Mornilles`).join(", ")}`
        : "";

      await tx.transactionGringotts.create({
        data: {
          typeTransaction: "vente",
          montant: montantTotal,
          description: `Vente #${v.id}${extrasDesc} (Tarification ajustée)`,
          employeId: employe.id,
          venteId: v.id,
        },
      });

      return v;
    });

    return NextResponse.json(vente, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur lors de la transaction";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}