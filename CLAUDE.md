# Fiche de l'application : Préco

> Fiche de référence pour l'assistant. À lire avant de chercher dans le code.
> **Tiens-la à jour** : à la fin d'un vrai travail, corrige ou complète la section
> concernée (en particulier « Pièges connus »). Le fichier `AGENTS.md` du dossier
> est ancien (écrit pour Codex, adresses `cconseil.click`) : cette fiche fait foi.

## À quoi elle sert
Site du groupement pour les **pharmacies adhérentes** : précommandes (bons de
commande par opération), sondages, questionnaires de satisfaction, formulaires
d'informations, et **validations de documents** (ex. BAT calendriers 2027).
Espace admin protégé par un code (`ADMIN_CODE`, défini côté serveur, jamais dans le code).
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
- **09/10/2026 : toutes les précommandes avaient disparu en ligne.** Cause : un test
  d'import fait par erreur directement sur `data/orders.json` du site EN LIGNE (pas sur
  la copie de test), qui l'a remplacé par un contenu vide. Restauré depuis la copie de
  sécurité automatique `data-backups/...before-test...` (toujours faite avant un test
  risqué). **Leçon : ne jamais tester une manipulation de données sur `/opt/apps/soguasphar-preco/data/`,
  toujours sur `/opt/apps/soguasphar-preco-test/data/`.**
- Le code admin (`ADMIN_CODE`) de la copie de test est indépendant de celui du site en
  ligne (fichiers `.env` séparés) ; `app.js` contient le code en dur côté client
  (`const ADMIN_CODE = "..."`) qui doit correspondre au `.env` du même dossier. S'il y a
  un décalage (ex. après une régénération de `.env`), l'admin de test « semble » accepter
  le code mais toutes les sauvegardes échouent en silence (401). Après avoir corrigé un
  `.env`, utiliser `sudo appctl rebuild <app>` (pas juste `restart`) : les variables
  d'environnement de `docker-compose.yml` ne sont relues qu'à la recréation du conteneur.
- **13/10/2026 : `appctl publier preco` a failli effacer une fonctionnalité en ligne**
  (création de comptes administrateurs). Cause : une correction avait été faite en
  modifiant directement les fichiers du site EN LIGNE (pas la copie de test), puis
  copiée partiellement vers la copie de test (un seul fichier sur trois) ; publier a
  ensuite tout resynchronisé depuis cette copie de test incomplète, écrasant en ligne
  ce qui n'y était pas. Repéré tout de suite grâce à la sauvegarde automatique prise
  par `appctl publier` avant d'écraser, et corrigé à partir d'elle. **Leçon : toujours
  modifier le code dans la copie de test, jamais directement dans le dossier en
  ligne**, même pour une petite correction — sinon la copie de test n'est plus une
  image fidèle de ce qui sera publié.
- **13/10/2026 : route `/api/orders/:id/image` manquante.** Soguaspilot affiche la vraie
  photo de chaque précommande en appelant `GET /api/orders/:id/image` sur Préco (pour ne
  pas charger tout `GET /api/orders`, lourd avec les images en base64 dans `imageData`/
  `imageData2`). Cette route avait été prévue côté Soguaspilot mais jamais créée côté
  Préco (toutes les photos apparaissaient vides) : ajoutée dans `server.js` (décode le
  `data:...;base64,...` stocké et le sert avec le bon `Content-Type`). Si une autre
  application affiche un jour les photos des opérations, réutiliser cette route plutôt
  que de redemander tout `GET /api/orders`.
