-- CreateTable
CREATE TABLE "Restock" (
    "id" SERIAL NOT NULL,
    "employeId" INTEGER NOT NULL,
    "dateRestock" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valeurTotale" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Restock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestockProduit" (
    "id" SERIAL NOT NULL,
    "restockId" INTEGER NOT NULL,
    "produitId" INTEGER NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prixAchatUnitaire" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RestockProduit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Restock" ADD CONSTRAINT "Restock_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestockProduit" ADD CONSTRAINT "RestockProduit_restockId_fkey" FOREIGN KEY ("restockId") REFERENCES "Restock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestockProduit" ADD CONSTRAINT "RestockProduit_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
