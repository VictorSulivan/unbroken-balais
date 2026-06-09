import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

const TAXE = 20;

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user as any;
  const body = await req.json();
  const { type, montant, description } = body;

  if (!type || !montant) return NextResponse.json({ error: "Données manquantes" }, { status: 400 });

  const employe = await prisma.employe.findFirst({
    where: { utilisateur: { id: parseInt(user.id) } },
  });

  const isRetrait = type === "retrait";

  // Versement = +montant, Retrait = -montant (brut)
  const impact = isRetrait ? -montant : montant;
  const taxe = isRetrait ? Math.round(montant * TAXE / 100) : 0;

  await prisma.$transaction(async (tx) => {
    // Mise à jour du solde
    await tx.gringotts.updateMany({
      data: { solde: { increment: impact } },
    });

    // Transaction principale
    await tx.transactionGringotts.create({
      data: {
        typeTransaction: type,
        montant,
        description: description || (isRetrait ? "Retrait manuel" : "Versement manuel"),
        employeId: employe?.id ?? null,
      },
    });

    // Taxe séparée uniquement sur retrait
    if (isRetrait && taxe > 0) {
      await tx.transactionGringotts.create({
        data: {
          typeTransaction: "taxe",
          montant: taxe,
          description: `Taxe Gringotts ${TAXE}% sur retrait`,
          employeId: employe?.id ?? null,
        },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
