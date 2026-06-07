import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { employeId, typeContrat, dateDebut, dateFin, salaire, pourcentagePrime, commentaire } = body;

  if (!employeId || !typeContrat || !dateDebut) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  // Désactiver les anciens contrats actifs
  await prisma.contrat.updateMany({
    where: { employeId: parseInt(employeId), estActif: true },
    data: { estActif: false },
  });

  const contrat = await prisma.contrat.create({
    data: {
      employeId: parseInt(employeId),
      typeContrat,
      dateDebut: new Date(dateDebut),
      dateFin: dateFin ? new Date(dateFin) : null,
      salaire: salaire ? parseFloat(salaire) : null,
      pourcentagePrime: pourcentagePrime ? parseFloat(pourcentagePrime) : null,
      commentaire: commentaire || null,
      estActif: true,
    },
  });

  // Mettre à jour le salaire de l'employé si renseigné
  if (salaire) {
    await prisma.employe.update({
      where: { id: parseInt(employeId) },
      data: { salaire: parseFloat(salaire) },
    });
  }

  return NextResponse.json(contrat, { status: 201 });
}
