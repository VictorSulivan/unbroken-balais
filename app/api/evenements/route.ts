import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const evenements = await prisma.evenement.findMany({
    orderBy: { dateDebut: "asc" },
    include: {
      responsable: true,
      employes: { include: { employe: true } },
      clients: { include: { client: true } },
      consommations: { include: { produit: true } },
    },
  });
  return NextResponse.json(evenements);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { titre, type, dateDebut, dateFin, description, responsableId, employeIds, clientIds, consommations } = body;

  if (!titre || !type || !dateDebut) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const entreprise = await prisma.entreprise.findFirst();
  if (!entreprise) return NextResponse.json({ error: "Entreprise introuvable" }, { status: 500 });

  const evenement = await prisma.evenement.create({
    data: {
      titre,
      type,
      dateDebut: new Date(dateDebut),
      dateFin: dateFin ? new Date(dateFin) : null,
      description: description || null,
      entrepriseId: entreprise.id,
      responsableId: responsableId ? parseInt(responsableId) : null,
      employes: {
        create: (employeIds ?? []).map((id: number) => ({ employeId: id })),
      },
      clients: {
        create: (clientIds ?? []).map((c: { clientId: number; nbPersonnes?: number; commentaire?: string }) => ({
          clientId: c.clientId,
          nbPersonnes: c.nbPersonnes ?? 1,
          commentaire: c.commentaire ?? null,
        })),
      },
      consommations: {
        create: (consommations ?? []).map((c: { produitId: number; quantite: number; prixUnitaire: number }) => ({
          produitId: c.produitId,
          quantite: c.quantite,
          prixUnitaire: c.prixUnitaire,
        })),
      },
    },
    include: {
      responsable: true,
      employes: { include: { employe: true } },
      clients: { include: { client: true } },
      consommations: { include: { produit: true } },
    },
  });

  return NextResponse.json(evenement, { status: 201 });
}
