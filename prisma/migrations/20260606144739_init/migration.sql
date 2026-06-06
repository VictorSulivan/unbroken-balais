-- CreateEnum
CREATE TYPE "RoleEmploye" AS ENUM ('stagiaire', 'employe', 'co_patron', 'patron');

-- CreateEnum
CREATE TYPE "RoleSite" AS ENUM ('admin', 'patron', 'co_patron', 'employe');

-- CreateEnum
CREATE TYPE "TypeClient" AS ENUM ('particulier', 'entreprise');

-- CreateEnum
CREATE TYPE "CategorieProduit" AS ENUM ('plat', 'boisson');

-- CreateEnum
CREATE TYPE "StatutVente" AS ENUM ('en_cours', 'validee', 'annulee');

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" SERIAL NOT NULL,
    "employeId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "roleSite" "RoleSite" NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entreprise" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Entreprise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntrepriseCliente" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntrepriseCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "typeClient" "TypeClient",
    "nom" TEXT NOT NULL,
    "prenom" TEXT,
    "entrepriseClienteId" INTEGER,
    "entrepriseId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employe" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "role" "RoleEmploye" NOT NULL,
    "dateEmbauche" TIMESTAMP(3),
    "salaire" DOUBLE PRECISION,
    "pourcentagePrime" DOUBLE PRECISION,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contrat" (
    "id" SERIAL NOT NULL,
    "employeId" INTEGER NOT NULL,
    "typeContrat" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3),
    "salaire" DOUBLE PRECISION,
    "pourcentagePrime" DOUBLE PRECISION,
    "commentaire" TEXT,
    "estActif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contrat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produit" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "categorie" "CategorieProduit" NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "prixAchat" DOUBLE PRECISION NOT NULL,
    "prixVente" DOUBLE PRECISION NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Produit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vente" (
    "id" SERIAL NOT NULL,
    "employeId" INTEGER NOT NULL,
    "typeClient" TEXT,
    "clientId" INTEGER NOT NULL,
    "montantTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "statut" "StatutVente" NOT NULL DEFAULT 'en_cours',
    "dateVente" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenteProduit" (
    "id" SERIAL NOT NULL,
    "venteId" INTEGER NOT NULL,
    "produitId" INTEGER NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prixUnitaire" DOUBLE PRECISION NOT NULL,
    "totalLigne" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "VenteProduit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gringotts" (
    "id" SERIAL NOT NULL,
    "entrepriseId" INTEGER NOT NULL,
    "solde" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gringotts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionGringotts" (
    "id" SERIAL NOT NULL,
    "typeTransaction" TEXT,
    "montant" DOUBLE PRECISION,
    "description" TEXT,
    "employeId" INTEGER,
    "venteId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionGringotts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prime" (
    "id" SERIAL NOT NULL,
    "employeId" INTEGER NOT NULL,
    "semestre" INTEGER NOT NULL,
    "annee" INTEGER NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "typePrime" TEXT,
    "commentaire" TEXT,
    "attribueParId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoriqueRole" (
    "id" SERIAL NOT NULL,
    "employeId" INTEGER NOT NULL,
    "ancienRole" TEXT,
    "nouveauRole" TEXT,
    "dateChangement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoriqueRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_employeId_key" ON "Utilisateur"("employeId");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_username_key" ON "Utilisateur"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Gringotts_entrepriseId_key" ON "Gringotts"("entrepriseId");

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_entrepriseClienteId_fkey" FOREIGN KEY ("entrepriseClienteId") REFERENCES "EntrepriseCliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrat" ADD CONSTRAINT "Contrat_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vente" ADD CONSTRAINT "Vente_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vente" ADD CONSTRAINT "Vente_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenteProduit" ADD CONSTRAINT "VenteProduit_venteId_fkey" FOREIGN KEY ("venteId") REFERENCES "Vente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenteProduit" ADD CONSTRAINT "VenteProduit_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gringotts" ADD CONSTRAINT "Gringotts_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionGringotts" ADD CONSTRAINT "TransactionGringotts_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionGringotts" ADD CONSTRAINT "TransactionGringotts_venteId_fkey" FOREIGN KEY ("venteId") REFERENCES "Vente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prime" ADD CONSTRAINT "Prime_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prime" ADD CONSTRAINT "Prime_attribueParId_fkey" FOREIGN KEY ("attribueParId") REFERENCES "Employe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriqueRole" ADD CONSTRAINT "HistoriqueRole_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
