import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const evenement = await prisma.evenement.findUnique({
    where: { id: parseInt(id) },
    include: {
      responsable: true,
      employes: { include: { employe: true } },
      clients: { include: { client: true } },
      consommations: { include: { produit: true } },
    },
  });
  if (!evenement) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(evenement);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const evenement = await prisma.evenement.update({
    where: { id: parseInt(id) },
    data: {
      statut: body.statut,
      commentaire: body.commentaire,
      titre: body.titre,
      description: body.description,
    },
  });
  return NextResponse.json(evenement);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  await prisma.evenement.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
