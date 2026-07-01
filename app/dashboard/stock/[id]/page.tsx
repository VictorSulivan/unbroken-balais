import { auth } from "@/lib/auth/auth";
import { getAcces } from "@/utils/acces";
import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import EditProduitForm from "@/components/stock/EditProduitForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditProduitPage({ params }: Props) {
  const { id } = await params;
  const [session, produit] = await Promise.all([
    auth(),
    prisma.produit.findUnique({ where: { id: parseInt(id) } }),
  ]);

  if (!produit) notFound();

  const acces = await getAcces(session?.user.employeId ?? null, session?.user.role ?? "");

  return <EditProduitForm produit={produit} canSetIllegal={acces.illegal} />;
}
