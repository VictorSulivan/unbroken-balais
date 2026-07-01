import { prisma } from "@/lib/db/prisma";

const ROLES_ILLEGAL_AUTO = ["patron", "admin", "co_patron"];

export async function getAcces(employeId: string | null, role: string) {
  if (ROLES_ILLEGAL_AUTO.includes(role)) return { illegal: true };
  if (!employeId) return { illegal: false };
  const emp = await prisma.employe.findUnique({
    where: { id: parseInt(employeId) },
    select: { acceesIllegal: true },
  });
  return { illegal: emp?.acceesIllegal ?? false };
}
