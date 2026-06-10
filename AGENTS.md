# AGENTS.md - Site SOGUASPHAR commandes/precommandes - contexte et regles

Tu assistes Helene directement dans Codex. Elle ne travaille pas en local sur VSCode.
Mode de travail : "vibe coding". Le code se fait dans Codex, mais le resultat reel se voit en ligne apres push, pas dans ton sandbox Codex.

La boucle est :
editer le code -> commit -> push sur `main` -> le serveur se reconstruit tout seul -> Helene voit le resultat en ligne sur https://preco.cconseil.click.

Ton role = l'aider a ecrire le code et a pousser. Tout l'hebergement, le serveur, le deploiement, le domaine et la persistance sont deja en place. Ne lui demande aucun acces, aucune installation, aucune configuration. Si une info te manque, lis les fichiers du repo (`server.js`, `app.js`, `package.json`) et ne pose pas la question.

## Ce que tu ne dois PAS faire

- Ne considere PAS ton sandbox Codex comme le site de production : le vrai site est celui en ligne, mis a jour par le push.
- Ne mets pas en place d'hebergement local ni Docker.
- NE propose PAS d'installer Node, Docker, ni des dependances npm.
- L'app n'utilise QUE des modules natifs de Node. Pas de `node_modules`, garde-la ainsi.
- N'AJOUTE PAS de `Dockerfile`, `docker-compose.yml`, `.env` ni autre fichier d'infra au depot.
- L'hebergement est gere cote serveur, en dehors du repo. Ajouter ces fichiers casserait le deploiement.
- NE lui demande PAS de secrets, de cles, ni de configurer GitHub, Docker ou CI.
- NE configure PAS de pipeline : le deploiement existe deja.

La seule chose qui compte cote Helene : le code est ecrit et pousse.

## Boucle de travail

1. Tu modifies les fichiers du projet (`server.js`, `app.js`, `index.html`, `styles.css`, etc.).
2. Tu fais un commit clair puis `git push origin main`.
3. Le webhook serveur fait `git pull` + rebuild + redemarrage automatiquement.
4. 30 a 90 secondes apres, la modification est visible sur https://preco.cconseil.click. Il faut rafraichir cette URL, pas un localhost.

## Piege : du code invalide = app en panne

Pas d'etape de compilation ici. C'est du JavaScript pur. Si `server.js` contient une erreur de syntaxe ou plante au demarrage, le conteneur ne demarre pas et le site tombe, ou garde l'ancienne version.

Donc :

- Ecris du JavaScript valide pour Node >= 18.
- Garde la syntaxe CommonJS `require(...)`.
- N'ajoute pas de dependance externe : reste sur les modules natifs (`http`, `fs`, `path`, etc.).
- Avant de pousser, valide la syntaxe dans le sandbox Codex :
  `node --check server.js` et `node --check app.js`.
- Apres un push, si le site ne repond plus ou n'a pas change apres environ 2 minutes, suppose une erreur dans ton dernier changement : relis-le, corrige, repousse.

## Ce que fait l'application

Site SOGUASPHAR de gestion des commandes, precommandes et sondages des pharmacies, avec un espace admin protege par un code d'acces (`ADMIN_CODE`).

## Architecture

- Node.js pur, sans framework ni dependance.
- Serveur HTTP natif dans `server.js`.
- Logique applicative front dans `app.js`.
- Front statique servi par ce meme serveur : `index.html`, `styles.css`, images.
- Demarrage : `node server.js`.
- Ecoute sur le port defini par `PORT`, fourni par l'hebergement.
- Pas de base de donnees.

## Donnees et persistance

Les commandes, sondages, reponses et fiches pharmacies sont stockes dans des fichiers JSON du dossier `data/` :
`responses.json`, `orders.json`, `polls.json`, `pharmacies.json`, etc.

- Cote serveur, `data/` est un volume persistant : les donnees survivent aux redeploiements.
- Ne casse pas cette logique. Garde le dossier `data/` et les chemins existants.
- `data/` est gitignore car il peut contenir des donnees sensibles.
- Ne commite jamais son contenu.
- Ne t'attends pas a voir les donnees de production dans le depot.

## Variables d'environnement

Elles sont gerees cote serveur. Ne les recree pas.

- `PORT` : fourni par l'hebergement. Ne le code pas en dur.
- `ADMIN_CODE` : code d'acces admin, par defaut `SOGUASPHAR2026`, defini cote serveur.

Ne mets jamais de secret en dur dans le code ni dans un commit.

## Deploiement

Remote : `https://github.com/counothelene34-lang/helenesoguasphar`
Branche : `main`

`git push` sur `main` -> webhook -> `git pull` + rebuild + redemarrage -> site a jour sur https://preco.cconseil.click.

Aucune action serveur, aucun SSH, aucun CI a mettre en place.
