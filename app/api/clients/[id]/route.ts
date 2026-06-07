import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) },
    include: {
      entrepriseCliente: true,
      ventes: {
        orderBy: { dateVente: "desc" },
        take: 10,
        include: { employe: true, produits: { include: { produit: true } } },
      },
    },
  });
  if (!client) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(client);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { nom, prenom, typeClient } = body;

  const client = await prisma.client.update({
    where: { id: parseInt(id) },
    data: { nom, prenom: prenom || null, typeClient },
  });
  return NextResponse.json(client);
}
