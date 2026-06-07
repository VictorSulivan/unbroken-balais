-- CreateEnum
CREATE TYPE "TypeEvenement" AS ENUM ('reservation', 'soiree');

-- CreateEnum
CREATE TYPE "StatutEvenement" AS ENUM ('planifie', 'en_cours', 'termine', 'annule');

-- CreateTable
CREATE TABLE "Evenement" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "type" "TypeEvenement" NOT NULL,
    "statut" "StatutEvenement" NOT NULL DEFAULT 'planifie',
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3),
    "description" TEXT,
    "commentaire" TEXT,
    "entrepriseId" INTEGER NOT NULL,
    "responsableId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evenement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvenementEmploye" (
    "id" SERIAL NOT NULL,
    "evenementId" INTEGER NOT NULL,
    "employeId" INTEGER NOT NULL,
    "role" TEXT,

    CONSTRAINT "EvenementEmploye_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvenementClient" (
    "id" SERIAL NOT NULL,
    "evenementId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "nbPersonnes" INTEGER NOT NULL DEFAULT 1,
    "commentaire" TEXT,

    CONSTRAINT "EvenementClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvenementConsommation" (
    "id" SERIAL NOT NULL,
    "evenementId" INTEGER NOT NULL,
    "produitId" INTEGER NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prixUnitaire" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "EvenementConsommation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Evenement" ADD CONSTRAINT "Evenement_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evenement" ADD CONSTRAINT "Evenement_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Employe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvenementEmploye" ADD CONSTRAINT "EvenementEmploye_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "Evenement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvenementEmploye" ADD CONSTRAINT "EvenementEmploye_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvenementClient" ADD CONSTRAINT "EvenementClient_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "Evenement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvenementClient" ADD CONSTRAINT "EvenementClient_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvenementConsommation" ADD CONSTRAINT "EvenementConsommation_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "Evenement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvenementConsommation" ADD CONSTRAINT "EvenementConsommation_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
