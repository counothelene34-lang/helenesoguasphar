# Fiche de l'application : Préco

> Fiche de référence pour l'assistant. À lire avant de chercher dans le code.
> **Tiens-la à jour** : à la fin d'un vrai travail, corrige ou complète la section
> concernée (en particulier « Pièges connus »). Le fichier `AGENTS.md` du dossier
> est ancien (écrit pour Codex, adresses `cconseil.click`) : cette fiche fait foi.

## À quoi elle sert
Site du groupement pour les **pharmacies adhérentes** : précommandes (bons de
commande par opération), sondages, questionnaires de satisfaction, formulaires
d'informations, et **validations de documents** (ex. BAT calendriers 2027).
Espace admin protégé par un code (`ADMIN_CODE`, dans `.env`, jamais dans le code
JavaScript envoyé au navigateur — voir « Sécurité : sessions » ci-dessous).
Propriétaire : Hélène (partagée avec Chantal).

## Où elle vit
| | En ligne | Copie de test |
|---|---|---|
| Adresse | https://preco.soguasphar.fr | https://apps.soguasphar.fr/preco-test/ |
| Dossier | `/opt/apps/soguasphar-preco` | `/opt/apps/soguasphar-preco-test` |
| Git | oui : `git@gh-preco:counothelene34-lang/helenesoguasphar.git`, branche `main` | non |
| Données | `data/` (JSON, volume persistant) | `data/` à part (données de test) |

Déploiement automatique : un push sur `main` → webhook → `git pull` + reconstruction.

## Comment on travaille (IMPORTANT)
1. **Avant de toucher la copie de test**, vérifie qu'elle n'est pas en retard sur le
   site en ligne : `sudo appctl publier preco --essai`. S'il signale des fichiers
   modifiés en ligne après la copie, fais d'abord `sudo appctl rafraichir-test preco`.
2. Travaille et fais valider **sur la copie de test** (`verifier preco-test`).
3. Publie avec `sudo appctl publier preco` (sauvegarde automatique, vérification du site).
   En cas de souci : `sudo appctl annuler-publication preco`.
4. Enregistre dans git (commit + push sur `main`) : Hélène l'a demandé pour toute
   modification terminée. Préviens-la en une phrase.
5. Petite correction urgente directement en ligne : possible, mais pense à
   `rafraichir-test` ensuite, sinon la copie de test prend du retard (c'est arrivé
   le 17/09/2026 : trois fichiers modifiés en ligne après la copie).

## Architecture
- **Node.js pur, sans dépendance** (modules natifs `http`, `fs`, `path`). CommonJS.
  N'ajoute ni framework ni `node_modules`.
- `server.js` (≈1 650 lignes) : serveur HTTP natif, API `/api/*`, lecture/écriture des JSON,
  exports Excel, service des fichiers statiques (`serveStatic`).
- `app.js` (≈6 250 lignes, **aucun commentaire de section**) : toute l'interface
  (pharmacie et admin). Chercher par nom de fonction (voir la carte ci-dessous).
- `index.html`, `styles.css` : page unique. Pas de compilation : **une erreur de
  syntaxe fait tomber le site** → `node --check server.js && node --check app.js` avant
  toute publication (`appctl publier` le fait pour toi).

## Sécurité : sessions (depuis le 09/10/2026)
Avant cette date, le code admin était écrit en clair dans `app.js` et vérifié
côté navigateur (faille critique), et une pharmacie connectée était reconnue
par un simple `pharmacyId`/`pharmacyName` envoyé dans l'adresse (faille IDOR :
une pharmacie pouvait changer cet identifiant pour lire les données d'une autre).
Corrigé par un système de sessions signées côté serveur :
- `ADMIN_CODE` et `SESSION_SECRET` vivent uniquement dans `.env` (jamais dans
  `app.js`/`server.js`, jamais dans git). Les deux sont **différents entre
  `preco` et `preco-test`** (sauf `ADMIN_CODE` volontairement identique pour
  simplifier la vie d'Hélène/Chantal — à reconsidérer si besoin).
- `POST /api/admin-login { code }` et `POST /api/pharmacy-login { password }`
  vérifient côté serveur et posent un cookie `HttpOnly; Secure; SameSite=Lax`
  contenant un jeton signé (HMAC-SHA256 avec `crypto` natif, pas de dépendance) :
  `preco_admin_session` (12 h) et `preco_pharmacy_session` (60 jours).
- Toutes les routes `/api/*` qui exigent l'admin vérifient ce cookie via
  `isAdminAuthenticated(request)` — plus jamais l'en-tête `X-Admin-Code` ni
  `?code=...` dans l'URL des exports.
- Les routes `pharmacy-*` (lecture et dépôt de réponses) utilisent
  `getPharmacySession(request)` : l'identité vient **uniquement** du cookie,
  jamais d'un `pharmacyId`/`pharmacyName` fourni par le client.
- `GET /api/admin-session` permet au front de savoir si une session admin est
  encore valide (utilisé au chargement de la page).
- En-têtes de sécurité (CSP, HSTS, X-Frame-Options, X-Content-Type-Options,
  Referrer-Policy) envoyés sur toutes les réponses, définis en haut du
  gestionnaire de requêtes dans `server.js`. Si un script/police externe est
  ajouté un jour (nouvelle CDN), il faudra l'ajouter à la `Content-Security-Policy`
  sinon le navigateur le bloquera silencieusement (vérifier la console après
  tout ajout de script tiers).
- Fichiers statiques (`app.js`, `styles.css`) servis avec `?v=...` : mise en
  cache longue durée (`immutable`) ; sans `?v=` ou pour `index.html` : toujours
  `no-store` (sinon un ancien `app.js` resterait affiché après publication).
  Compression gzip automatique sur `.html/.js/.css/.json/.svg` si le navigateur
  l'accepte.
- Non corrigé pour l'instant (risque plus faible, à surveiller) : les PDF BAT
  (`/bat-2027/pharmacy-*.pdf`) restent accessibles sans vérifier que la
  pharmacie qui les demande en est bien propriétaire, si on devine le nom de
  fichier. À corriger si ça devient sensible.

## Données (`data/`, jamais dans git, jamais servies au public)
`orders.json` (opérations de précommande), `responses.json` (réponses aux
précommandes), `order-template.json`, `polls.json` + `poll-responses.json`
(sondages), `info-forms.json` + `info-responses.json`, `validation.json` +
`validation-responses.json` (une seule validation active à la fois),
`pharmacies.json` (**mots de passe des pharmacies**), `bat-calendriers-2027/` (PDF).
Avant de modifier des données à la main : copie datée dans `data-backups/`.

## Carte du code (chercher ces noms)
- Accès pharmacie : `loginPharmacy`, `renderPharmacyAccess`, `changePharmacyPassword`
- Précommandes : `campaignCard`, `selectCampaign`, `renderOrderTemplate`, `collectProducts`,
  `validateColisageQuantities`, `renderPrecommandesListPage`
- Import d'un bon de commande (Excel/CSV/PDF) : `parseOrderFile`, `inferTemplateRows`,
  `buildFreeColumnsTemplate` (colonnes libres), `parsePdfOrderText`
- Sondages : `pollCard`, `selectPoll`, `buildPollQuestionsFormMarkup`,
  `applyPollConditionalLogic` (présence → repas), `renderPollResults`, `exportPollToExcel`
- Résultats publics d'un sondage (page consultable par tous, sans code admin, en direct) :
  adresse `preco.soguasphar.fr/?resultats=<id du sondage>` ; fonctions `showPublicPollResults`,
  `refreshPublicPollResults` (rafraîchit toutes les 15 s) dans `app.js` ; route serveur
  publique `GET /api/poll-results/<id>` dans `server.js` — renvoie UNIQUEMENT des comptages
  agrégés par question à choix, exclut toujours les questions `texte_libre` (jamais le texte
  d'un commentaire, ni via cette route ni ailleurs côté public).
- Validations (BAT…) : `batValidationCard`, `selectBat`, `importValidationDocuments`,
  `renderBatResults`, `getValidationSummary`
- Admin : `renderAdmin`, `showAdminSection`, `renderQuantitySummary`,
  `exportQuantitySummaryToPdf`, `exportQuantitySummaryToExcel`, `exportToExcel`
- Lien direct par opération (`?operation=<slug>`) : `slugify`, `normalizeOperationId`,
  `findCampaignByOperationId`, `showRequestedOperationOrMenu`
- Côté serveur : `read*/write*` par fichier, `validationSummary`, `sendExcel`,
  `sendPollExcel`, `sendInfoExcel`, colonnes libres vers la ligne 673 de `server.js`

## Pièges connus
- **`/data/*` est bloqué par Traefik** sur preco.soguasphar.fr (protège
  `pharmacies.json`) : ne jamais retirer ce blocage. Pour servir de gros fichiers,
  utiliser une route dédiée comme `/bat-2027/<fichier>.pdf` dans `server.js`.
- Ne pas stocker de gros documents en base64 dans les JSON (≈90 Mo pour 17 PDF) :
  fichiers dans `data/<dossier>/` + URL.
- Une seule validation active : avant une nouvelle campagne, sauvegarder puis vider
  `validation.json` / `validation-responses.json`.
- Un indicateur « archivé » resté dans le `localStorage` d'un poste peut masquer une
  carte (corrigé le 16/09/2026) : penser au navigateur de la personne quand « ça
  n'apparaît pas chez moi ».
