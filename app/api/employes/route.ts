import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const employes = await prisma.employe.findMany({
    orderBy: { nom: "asc" },
    include: { utilisateur: true, contrats: { where: { estActif: true } } },
  });
  return NextResponse.json(employes);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { nom, prenom, role, salaire, dateEmbauche, username, password, roleSite } = body;

  if (!nom || !prenom || !role) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const employe = await prisma.$transaction(async (tx) => {
    const e = await tx.employe.create({
      data: {
        nom, prenom, role,
        salaire: salaire ? parseFloat(salaire) : null,
        dateEmbauche: dateEmbauche ? new Date(dateEmbauche) : null,
      },
    });

    if (username && password) {
      const hash = await bcrypt.hash(password, 10);
      await tx.utilisateur.create({
        data: {
          employeId: e.id,
          username,
          passwordHash: hash,
          roleSite: roleSite ?? "employe",
        },
      });
    }

    await tx.historiqueRole.create({
      data: { employeId: e.id, ancienRole: null, nouveauRole: role },
    });

    return e;
  });

  return NextResponse.json(employe, { status: 201 });
}
