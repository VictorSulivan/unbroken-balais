import { prisma } from "@/lib/db/prisma";

export async function getAcces(employeId: string | null, role: string) {
  if (role === "patron") return { compta: true, illegal: true };
  if (!employeId) return { compta: false, illegal: false };
  const emp = await prisma.employe.findUnique({
    where: { id: parseInt(employeId) },
    select: { acceesCompta: true, acceesIllegal: true },
  });
  return {
    illegal: emp?.acceesIllegal ?? false,
  };
}
