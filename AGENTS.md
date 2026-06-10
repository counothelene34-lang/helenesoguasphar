# AGENTS.md — Site SOGUASPHAR commandes/précommandes (Hélène) — contexte & règles

Tu assistes Hélène **directement dans Codex** (elle ne travaille pas en local sur VSCode).
Mode de travail : **« vibe coding »**. Le code se fait dans Codex, mais le résultat réel se
voit **en ligne après push**, pas dans ton sandbox Codex. La boucle est :
**éditer le code → commit → push sur `main` → le serveur se reconstruit tout seul →
Hélène voit le résultat en ligne sur https://preco.cconseil.click.**

Ton rôle = l'aider à écrire le code et à pousser. Tout l'hébergement (serveur, déploiement,
domaine, persistance) est DÉJÀ en place. Ne lui demande aucun accès, aucune installation,
aucune configuration. Si une info te manque, lis les fichiers du repo (`server.js`,
`app.js`, `package.json`) — ne pose pas la question.

## ❌ Ce que tu ne dois PAS faire
- Ne considère PAS ton sandbox Codex comme le site de production : le vrai site est celui
  en ligne, mis à jour par le push. Ne mets pas en place d'hébergement local ni Docker.
- NE propose PAS d'installer Node, Docker, ni des dépendances npm
  (l'app n'utilise QUE des modules natifs de Node — pas de `node_modules`, garde-la ainsi).
- N'AJOUTE PAS de `Dockerfile`, `docker-compose.yml`, `.env` ni autre fichier d'infra au
  dépôt : l'hébergement est géré **côté serveur**, en dehors du repo. Ajouter ces fichiers
  casserait le déploiement.
- NE lui demande PAS de secrets, de clés, ni de configurer GitHub/Docker/CI.
- NE configure PAS de pipeline : le déploiement existe déjà (webhook, voir plus bas).
La seule chose qui compte côté Hélène : **le code est écrit et poussé**.

## ✅ La boucle de travail
1. Tu modifies les fichiers du projet (`server.js`, `app.js`, `index.html`, `styles.css`…).
2. Commit clair + `git push origin main`.
3. Le webhook serveur fait `git pull` + rebuild + redémarrage automatiquement.
   ~30–90 s après, la modif est visible sur https://preco.cconseil.click (rafraîchir cette
   URL ; ce n'est PAS un localhost).

## ⚠️ Piège : du code invalide = app en panne
Pas d'étape de compilation ici (JavaScript pur), donc pas d'erreur TypeScript — mais si
`server.js` contient une **erreur de syntaxe ou plante au démarrage**, le conteneur ne
démarre pas et le site tombe (ou garde l'ancienne version). Donc :
- Écris du JavaScript **valide** (Node ≥ 18, syntaxe CommonJS `require(...)`).
- N'ajoute pas de dépendance externe : reste sur les modules natifs (`http`, `fs`, `path`…).
- **Avant de pousser**, profite de ton sandbox Codex pour valider la syntaxe :
  `node --check server.js` (et `node --check app.js`). C'est rapide et ça évite de mettre
  le site en panne.
- Après un push, si le site ne répond plus ou n'a pas changé après ~2 min, suppose une
  erreur dans ton dernier changement : relis-le, corrige, repousse.

## Ce que fait l'application
Site SOGUASPHAR de gestion des **commandes / précommandes / sondages** des pharmacies, avec
un espace admin protégé par un **code d'accès** (`ADMIN_CODE`).

## Architecture
- **Node.js pur**, sans framework ni dépendance : serveur HTTP natif dans `server.js`
  (logique applicative dans `app.js`), front statique servi par ce même serveur
  (`index.html`, `styles.css`, images). Démarrage : `node server.js`.
- Écoute sur le port défini par `PORT` (fourni par l'hébergement). Pas de base de données.

## Données (persistance par fichiers)
Les commandes, sondages, réponses et fiches pharmacies sont stockés dans des fichiers JSON
du dossier **`data/`** (`responses.json`, `orders.json`, `polls.json`, `pharmacies.json`…),
créé automatiquement au démarrage.
- Côté serveur, `data/` est un **volume persistant** : les données survivent aux
  redéploiements. Ne casse pas cette logique (garde le dossier `data/` et les chemins).
- `data/` est **gitignoré** (données potentiellement sensibles) : ne commite jamais son
  contenu, et ne t'attends pas à le voir dans le dépôt.

## Variables d'environnement (gérées côté serveur — ne pas recréer)
- `PORT` : fourni par l'hébergement (ne le code pas en dur).
- `ADMIN_CODE` : code d'accès admin (par défaut `SOGUASPHAR2026`), défini côté serveur.
Ne mets jamais de secret en dur dans le code ni dans un commit.

## Déploiement (automatique — ne rien configurer)
Remote : `https://github.com/counothelene34-lang/helenesoguasphar`, branche `main`.
`git push` sur `main` → webhook → `git pull` + rebuild + redémarrage → site à jour sur
https://preco.cconseil.click. Aucune action serveur, aucun SSH, aucun CI à mettre en place.
