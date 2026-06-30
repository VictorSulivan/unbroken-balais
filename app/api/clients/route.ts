import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const clients = await prisma.client.findMany({
    orderBy: { nom: "asc" },
    include: {
      entrepriseCliente: true,
      _count: { select: { ventes: true } },
    },
  });
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { nom, prenom, typeClient, entrepriseClienteNom } = body;

  if (!nom) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  const entreprise = await prisma.entreprise.findFirst();
  if (!entreprise) return NextResponse.json({ error: "Entreprise introuvable" }, { status: 500 });

  let entrepriseClienteId: number | undefined;
  if (typeClient === "entreprise" && entrepriseClienteNom) {
    await prisma.entrepriseCliente.upsert({
      where: { id: 0 },
      update: {},
      create: { nom: entrepriseClienteNom },
    }).catch(() => null);

    const existing = await prisma.entrepriseCliente.findFirst({
      where: { nom: entrepriseClienteNom },
    });
    if (existing) {
      entrepriseClienteId = existing.id;
    } else {
      const created = await prisma.entrepriseCliente.create({
        data: { nom: entrepriseClienteNom },
      });
      entrepriseClienteId = created.id;
    }
  }

  const client = await prisma.client.create({
    data: {
      nom,
      prenom: prenom || null,
      typeClient: typeClient ?? "particulier",
      entrepriseId: entreprise.id,
      entrepriseClienteId: entrepriseClienteId ?? null,
    },
  });

  return NextResponse.json(client, { status: 201 });
}
