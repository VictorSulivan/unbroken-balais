import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const primes = await prisma.prime.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      employe: true,
      attribuePar: true,
    },
  });
  return NextResponse.json(primes);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user as any;
  const body = await req.json();
  const { employeId, montant, typePrime, commentaire, semestre, annee } = body;

  if (!employeId || !montant || !semestre || !annee) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const attribueur = await prisma.employe.findFirst({
    where: { utilisateur: { id: parseInt(user.id) } },
  });

  const prime = await prisma.$transaction(async (tx) => {
    const p = await tx.prime.create({
      data: {
        employeId: parseInt(employeId),
        montant: parseFloat(montant),
        typePrime: typePrime ?? "manuel",
        commentaire,
        semestre: parseInt(semestre),
        annee: parseInt(annee),
        attribueParId: attribueur?.id ?? null,
      },
    });

    // Débiter Gringotts
    await tx.gringotts.updateMany({
      data: { solde: { decrement: parseFloat(montant) } },
    });

    // Transaction financière
    await tx.transactionGringotts.create({
      data: {
        typeTransaction: "prime",
        montant: parseFloat(montant),
        description: `Prime S${semestre}/${annee} — employé #${employeId}`,
        employeId: attribueur?.id ?? null,
      },
    });

    return p;
  });

  return NextResponse.json(prime, { status: 201 });
}
