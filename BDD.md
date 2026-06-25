---
## 1. Mettre à jour les variables d'environnement (`.env`)

Avant de lancer la moindre commande Prisma, assurez-vous que votre fichier `.env` (ou `.env.local`) pointe bien sur la base de données de l'entreprise cible (ici, Zonko).

```env
DATABASE_URL="postgresql://user:password@localhost:5432/zonko_db"

```

---

## 2. Procédure pour déployer sur une NOUVELLE base de données (Ex: Zonko)

Si la base `zonko_db` est vide ou vient d'être créée, et que vous voulez injecter la structure actuelle ainsi que l'historique de migration :

```bash
# 1. Assurez-vous d'être sur la bonne branche et à jour
git checkout zonko

# 2. Appliquer l'historique des migrations existantes sur la BDD Zonko
npx prisma migrate deploy

# 3. (Optionnel) Générer le client Prisma si nécessaire
npx prisma generate

```

> **Pourquoi `migrate deploy` ?** > Cette commande est cruciale pour la production ou les bases de données distinctes. Elle lit le dossier `prisma/migrations` et applique toutes les migrations qui n'ont pas encore été exécutées sur la base ciblée par `DATABASE_URL`, sans chercher à créer de nouveaux fichiers de migration.

---

## 3. Procédure si vous modifiez le schéma (Évolution du code)

Si vous devez ajouter une table ou un champ commun à tous les commerces, voici le workflow recommandé pour ne pas emmêler vos branches :

### Étape 1 : Créer la migration sur la branche commune (`main`)

Il est fortement conseillé de centraliser les changements de structure sur `main` (ou `feat-...`) pour éviter les conflits d'historique Prisma.

```bash
git checkout main
# 1. Modifiez votre fichier prisma/schema.prisma
# 2. Générez le fichier de migration (en pointant temporairement sur une BDD de dev globale ou 3 balais)
npx prisma migrate dev --name ajoute_champ_unifie

```

*Cette commande crée un nouveau dossier dans `prisma/migrations/` et met à jour la base de dev.*

### Étape 2 : Reporter et déployer sur les branches des entreprises

Une fois la migration générée et commitée sur `main`, vous la récupérez sur vos branches spécifiques.

```bash
# Aller sur la branche Zonko et récupérer la modification du schéma + le fichier de migration
git checkout zonko
git merge main

# Appliquer cette nouvelle migration sur la BDD Zonko
npx prisma migrate deploy

```

---

## 4. Cas particulier : "Copie" d'une ancienne structure sans historique (Si besoin de repartir à zéro)

Si un jour vous créez un commerce et que vous voulez ignorer l'historique passé pour créer une migration unique "initiale" dédiée à cette BDD :

```bash
# 1. Vider le dossier prisma/migrations (sur une branche dédiée pour ne pas casser main)
rm -rf prisma/migrations

# 2. Créer une migration initiale basée sur le schema.prisma actuel
npx prisma migrate dev --name init_zonko

```

*Note : Cette méthode est moins recommandée si les commerces doivent rester synchronisés sur le long terme.*

---

