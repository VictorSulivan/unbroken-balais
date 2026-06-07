import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const produit = await prisma.produit.update({
    where: { id: parseInt(id) },
    data: body,
  });
  return NextResponse.json(produit);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;

  await prisma.produit.update({
    where: { id: parseInt(id) },
    data: { actif: false },
  });
  return NextResponse.json({ ok: true });
}


export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const produit = await prisma.produit.findUnique({ where: { id: parseInt(id) } });
  if (!produit) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(produit);
}
