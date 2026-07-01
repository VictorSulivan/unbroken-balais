import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const employe = await prisma.employe.findUnique({
    where: { id: parseInt(id) },
    include: {
      utilisateur: true,
      contrats: true,
      rolesHistorique: { orderBy: { dateChangement: "desc" } },
      ventes: { orderBy: { dateVente: "desc" }, take: 5, include: { client: true } },
    },
  });
  if (!employe) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(employe);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const isPatron = ["patron", "admin"].includes(session.user.role ?? "");
  if (!isPatron) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { role, ...rest } = body;

  const ancien = await prisma.employe.findUnique({ where: { id: parseInt(id) } });

  const employe = await prisma.$transaction(async (tx) => {
    const e = await tx.employe.update({
      where: { id: parseInt(id) },
      data: { ...rest, ...(role ? { role } : {}) },
    });

    if (role && ancien?.role !== role) {
      await tx.historiqueRole.create({
        data: { employeId: e.id, ancienRole: ancien?.role ?? null, nouveauRole: role },
      });
    }

    return e;
  });

  return NextResponse.json(employe);
}
