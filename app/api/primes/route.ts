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

const TAXE = 20;

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user;
  const body = await req.json();
  const { employeId, montant, typePrime, commentaire, semestre, annee } = body;

  if (!employeId || !montant || !semestre || !annee) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const montantBrut = parseFloat(montant);
  const taxe = Math.round(montantBrut * TAXE / 100);
  const netPrime = montantBrut - taxe;

  const attribueur = await prisma.employe.findFirst({
    where: { utilisateur: { id: parseInt(user.id) } },
  });

  const prime = await prisma.$transaction(async (tx) => {
    const p = await tx.prime.create({
      data: {
        employeId: parseInt(employeId),
        montant: netPrime,
        typePrime: typePrime ?? "manuel",
        commentaire,
        semestre: parseInt(semestre),
        annee: parseInt(annee),
        attribueParId: attribueur?.id ?? null,
      },
    });

    // Débiter Gringotts du brut entier
    await tx.gringotts.updateMany({
      data: { solde: { decrement: montantBrut } },
    });

    // Transaction : prime nette versée à l'employé
    await tx.transactionGringotts.create({
      data: {
        typeTransaction: "prime",
        montant: netPrime,
        description: `Prime S${semestre}/${annee} — employé #${employeId}`,
        employeId: attribueur?.id ?? null,
      },
    });

    // Transaction : taxe Gringotts 20% sur la prime
    await tx.transactionGringotts.create({
      data: {
        typeTransaction: "taxe",
        montant: taxe,
        description: `Taxe Gringotts ${TAXE}% sur prime S${semestre}/${annee}`,
        employeId: attribueur?.id ?? null,
      },
    });

    return p;
  });

  return NextResponse.json(prime, { status: 201 });
}
