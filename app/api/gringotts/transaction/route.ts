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
  const taxe = isRetrait ? Math.round(montant * TAXE / 100) : 0;
  const netPoche = isRetrait ? montant - taxe : montant;

  await prisma.$transaction(async (tx) => {
    // Mise à jour du solde : décrément total (net + taxe = brut)
    await tx.gringotts.updateMany({
      data: { solde: { increment: isRetrait ? -montant : montant } },
    });

    // Transaction 1 : ce qui va en poche (net) ou versement
    await tx.transactionGringotts.create({
      data: {
        typeTransaction: type,
        montant: netPoche, // ← net uniquement, plus le brut
        description: description || (isRetrait ? "Retrait manuel" : "Versement manuel"),
        employeId: employe?.id ?? null,
      },
    });

    // Transaction 2 : taxe séparée uniquement sur retrait
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