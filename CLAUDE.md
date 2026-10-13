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
| Adresse | https://preco.soguasphar.fr | https://apps.soguasphar.fr/preco-test/ (**en pause depuis le 13/10/2026**, voir ci-dessous) |
| Dossier | `/opt/apps/soguasphar-preco` | `/opt/apps/soguasphar-preco-test` |
| Git | oui : `git@gh-preco:counothelene34-lang/helenesoguasphar.git`, branche `main` | non |
| Données | `data/` (JSON, volume persistant) | `data/` à part (données de test) |

Déploiement automatique : un push sur `main` → webhook → `git pull` + reconstruction.

## Comment on travaille (IMPORTANT — changé le 13/10/2026)
Hélène a demandé d'arrêter d'utiliser la copie de test publique (elle a été mise en
pause avec `sudo appctl stop preco-test` : conteneur arrêté, dossier et données
conservés). Désormais on publie directement sur le site en ligne. Pour garder un
minimum de filet de sécurité (vu les incidents de septembre-octobre 2026 ci-dessous) :
1. Modifie le code dans `/opt/apps/soguasphar-preco` (le dossier en ligne — plus de
   copie de test à part). Vérifie la syntaxe avant toute publication :
   `node --check server.js && node --check app.js`.
2. Avant une manipulation risquée sur les données (`data/*.json`), fais une copie
   datée dans `data-backups/` (la sauvegarde nocturne ne suffit pas pour une
   manip en cours de journée).
3. Publie/relance avec `sudo appctl rebuild preco` si besoin (ou laisse le
   déploiement automatique faire son travail après un push sur `main`), puis
   vérifie avec `verifier preco`.
4. Enregistre dans git (commit + push sur `main`) à la fin de tout vrai travail et
   préviens Hélène en une phrase.
5. En cas de souci, il n'y a plus de `appctl publier`/`annuler-publication` à
   utiliser (ça ne marche qu'avec une copie de test active) : restaure depuis une
   sauvegarde (`sauvegardes liste|diff|restaurer preco`) ou depuis `data-backups/`.
6. Si un vrai filet de test redevient nécessaire (gros changement, données
   sensibles) : redémarrer la copie avec `sudo appctl start preco-test`, et bien
   penser à `rafraichir-test` avant de l'utiliser (elle a pu prendre du retard
   pendant la pause).

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
- **13/10/2026 : tableau admin « Dernière connexion » affichait "Jamais connecté" pour
  tout le monde.** Cause : quand une personne crée son mot de passe via le lien reçu par
  e-mail (route `/api/auth/reset-password`), elle est connectée automatiquement, mais
  cette route n'enregistrait pas `lastLoginAt` (seule la route `/api/auth/login`, utilisée
  au 2ᵉ login, le faisait). Corrigé : `/api/auth/reset-password` enregistre maintenant
  aussi `lastLoginAt`. Les 12 comptes déjà activés le 13/10 mais mal marqués ont été
  corrigés à la main dans `data/users.json` (sauvegarde avant dans `data-backups/`).
  **Suite (même jour) :** même corrigé, le suivi restait incomplet car l'espace admin
  pouvait aussi s'ouvrir avec l'ancien **code administrateur partagé** ("SOGUASPHAR2026",
  onglet Admin, formulaire `#adminCode`), qui ne demande pas qui tape le code — donc
  cette personne n'apparaît jamais dans le suivi. Fermé à la demande d'Hélène : ce
  formulaire ne compare plus le code et ouvre directement l'écran de connexion
  personnelle (`showNewAuthScreen()`), seule porte d'entrée désormais pour les
  administrateurs SOGUASPHAR. Le code `ADMIN_CODE` reste utilisé tel quel comme secret
  technique entre le navigateur et le serveur (en-tête `X-Admin-Code` envoyé sur de
  nombreuses routes admin, en plus de la session personnelle) : ce n'est pas un
  renforcement de sécurité complet (le code reste visible dans `app.js` public), juste
  la fermeture du raccourci "taper le code → accès anonyme". Si un vrai renforcement est
  nécessaire un jour, il faudrait remplacer les vérifications `requireAdminCode` côté
  serveur par `requireAuth(["soguasphar_admin"])` — chantier plus large, pas fait ici.
- **13/10/2026 : ancien accès pharmacie (mot de passe unique par pharmacie) fermé**
  à la demande d'Hélène, pour que "Dernière connexion" soit fiable partout (pas
  seulement côté admin). Routes désactivées dans `server.js` (répondent 410) :
  `/api/pharmacy-login`, `/api/pharmacy-password`, `/api/pharmacy-password-reset-request`.
  Seul reste utilisable le compte personnel (e-mail + mot de passe,
  `/api/auth/*`). **Attention :** au moment de la fermeture, 32 pharmacies sur 44
  n'avaient pas encore activé leur compte personnel (lien d'invitation jamais
  ouvert) — elles ne peuvent plus du tout se connecter tant qu'elles n'ont pas
  cliqué ce lien. Si une pharmacie signale qu'elle ne peut plus entrer, renvoyer
  son lien d'activation (bouton "Renvoyer l'invitation" dans Paramètres > vue
  d'ensemble des pharmacies) plutôt que de rouvrir l'ancien système.
