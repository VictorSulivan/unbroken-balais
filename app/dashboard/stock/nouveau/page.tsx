import { auth } from "@/lib/auth/auth";
import { getAcces } from "@/utils/acces";
import NouveauProduitForm from "@/components/stock/NouveauProduitForm";

export default async function NouveauProduitPage() {
  const session = await auth();
  const acces = await getAcces(session?.user.employeId ?? null, session?.user.role ?? "");
  return <NouveauProduitForm canSetIllegal={acces.illegal} />;
}
