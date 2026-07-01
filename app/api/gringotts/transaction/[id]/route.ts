import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

const TYPES_POSITIFS = ["vente", "versement"];

function signMontant(type: string, montant: number) {
  return TYPES_POSITIFS.includes(type) ? montant : -montant;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const isAdmin = ["patron", "admin", "co_patron"].includes(session.user.role ?? "");
  if (!isAdmin) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { typeTransaction, montant, description } = body;

  const existing = await prisma.transactionGringotts.findUnique({
    where: { id: parseInt(id) },
  });
  if (!existing) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const newType = typeTransaction ?? existing.typeTransaction ?? "versement";
  const newMontant = montant != null ? parseFloat(montant) : (existing.montant ?? 0);

  // Effet sur le solde : annuler l'ancien + appliquer le nouveau
  const ancienEffet = signMontant(existing.typeTransaction ?? "versement", existing.montant ?? 0);
  const nouvelEffet = signMontant(newType, newMontant);
  const delta = nouvelEffet - ancienEffet;

  await prisma.$transaction(async (tx) => {
    await tx.transactionGringotts.update({
      where: { id: parseInt(id) },
      data: {
        typeTransaction: newType,
        montant: newMontant,
        description: description ?? existing.description,
      },
    });

    if (delta !== 0) {
      await tx.gringotts.updateMany({
        data: { solde: { increment: delta } },
      });
    }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const isAdmin = ["patron", "admin", "co_patron"].includes(session.user.role ?? "");
  if (!isAdmin) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;

  const existing = await prisma.transactionGringotts.findUnique({
    where: { id: parseInt(id) },
  });
  if (!existing) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  // Inverser l'effet sur le solde avant de supprimer
  const effet = signMontant(existing.typeTransaction ?? "versement", existing.montant ?? 0);

  await prisma.$transaction(async (tx) => {
    await tx.transactionGringotts.delete({ where: { id: parseInt(id) } });
    await tx.gringotts.updateMany({ data: { solde: { increment: -effet } } });
  });

  return NextResponse.json({ ok: true });
}
