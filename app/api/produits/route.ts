import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const produits = await prisma.produit.findMany({
    orderBy: { nom: "asc" },
  });
  return NextResponse.json(produits);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { nom, stock, prixAchat, prixVente, description, illegal } = body;

  if (!nom || prixAchat == null || prixVente == null) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const produit = await prisma.produit.create({
    data: { nom, stock: stock ?? 0, prixAchat, prixVente, description, illegal: illegal ?? false },
  });
  return NextResponse.json(produit, { status: 201 });
}