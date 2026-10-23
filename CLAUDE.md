# Fiche de l'application : Préco

> Fiche de référence pour l'assistant. À lire avant de chercher dans le code.
> **Tiens-la à jour** : à la fin d'un vrai travail, corrige ou complète la section
> concernée (en particulier « Pièges connus »). Le fichier `AGENTS.md` du dossier
> est ancien (écrit pour Codex, adresses `cconseil.click`) : cette fiche fait foi.

## À quoi elle sert
Site du groupement pour les **pharmacies adhérentes** : précommandes (bons de
commande par opération), sondages, questionnaires de satisfaction, formulaires
d'informations, et **validations de documents** (ex. BAT calendriers 2027,
attestation d'engagement 2027). Espace admin protégé par un code (`ADMIN_CODE`,
défini côté serveur, jamais dans le code). Propriétaire : Hélène (partagée avec Chantal).

## Attestation d'engagement SOGUASPHAR 2027 (lancée le 13/10/2026)
Document de signature en ligne (44 pharmacies, SIREN/représentant pré-remplis,
cotisation 3 000 €/1 500 €) fusionné dans la tuile **« Document en attente »**
(avec le BAT calendriers) côté pharmacie. Points clés :
- Données : `data/attestations.json` (config + liste des 44 pharmacies, `draft`/
  `archived` pour ouvrir/fermer la campagne), `data/attestation-responses.json`
  (qui a signé), PDF signés dans `data/attestations-2027/<pharmacyId>.pdf`
  (générés à la volée via le service commun PDF, servis par la route
  `/attestations-2027/<fichier>.pdf` dans `server.js` — même piège que `/bat-2027`,
  `/data` étant bloqué par Traefik).
- Pharmacie : doit cliquer « Voir le document complet avant de signer » (aperçu
  PDF généré à la volée, route `/api/attestation/preview`) avant que le bouton de
  signature se débloque — champ `attestationDocumentViewed` côté client.
  **14/10/2026** : ce lien ouvre désormais le PDF dans une fenêtre DANS le site
  (modale `#pdfPreviewModal`, `<iframe id="pdfPreviewFrame">`, fonctions
  `openPdfPreview()`/`closePdfPreview()` dans `app.js`) au lieu de naviguer
  directement vers l'URL du PDF — naviguer directement déclenchait un
  téléchargement dans le dossier Téléchargements du navigateur (réglage Chrome
  "toujours télécharger les PDF"), même avec `Content-Disposition: inline`
  côté serveur. Testé avec Playwright (iframe + cookie de session) : aucun
  événement `download` déclenché. **Si un autre PDF doit un jour s'afficher
  en direct (pas juste être téléchargé), réutiliser `openPdfPreview()`** plutôt
  qu'un lien `<a href>` classique vers la route PDF.
  **Même jour** : après signature (`POST /api/attestation/sign`), la pharmacie
  reçoit automatiquement une copie du PDF signé par e-mail (adresse normale
  `helene.counot@soguasphar.com`, **pas** `ne_pas_repondre@...` — elle doit
  pouvoir répondre). A nécessité de corriger `sendMail()` : les pièces jointes
  étaient toujours ré-encodées en base64 depuis du texte UTF-8
  (`Buffer.from(content, "utf8")`), ce qui aurait corrompu un PDF binaire déjà
  en base64. Ajouté un flag `encoding: "base64"` par pièce jointe pour l'envoyer
  telle quelle. Testé isolément (sans toucher aux vraies signatures) en
  envoyant un PDF factice en pièce jointe vers une adresse de test — reçu
  correctement.
- Carte affichée à DEUX endroits dans `app.js` : `renderPendingDocumentsListPage()`
  (page dédiée « Document en attente ») ET `renderCampaignPickers()` (colonne de
  gauche du menu principal, à la place de « Aucun document en attente pour le
  moment », fonctions `attestationCard()` / `isAttestationVisibleForPharmacy()`).
  Les deux doivent rester synchronisées si la carte évolue.
- **Piège de timing** : `refreshAttestationVisibility()` (appelée par
  `setHeroVisible(true)` sans `await`) doit, une fois les données chargées,
  rappeler **à la fois** `renderPendingDocumentsListPage()` ET
  `renderCampaignPickers()` (sinon la carte reste absente du menu principal au
  premier chargement, corrigé le 13/10/2026).
- Développé et vérifié sur la copie de test (`preco-test`, redémarrée pour
  l'occasion), puis publié avec `appctl publier preco`. **La donnée n'est jamais
  copiée par `publier`** : le fichier `data/attestations.json` (44 pharmacies) a
  dû être copié à la main vers `/opt/apps/soguasphar-preco/data/`, volontairement
  **sans** `attestation-responses.json` ni le dossier `attestations-2027/` de la
  copie de test (qui ne contenaient qu'une signature de TEST, pas une vraie).
- **14/10/2026 : tampon SOGUASPHAR + texte de l'e-mail finalisés.** Image du
  tampon/signature du gérant récupérée via le connecteur Dropbox commun
  (`POST /fetch` sur sogua-connectors) et enregistrée dans le dossier de l'app :
  `tampon-soguasphar.png` (racine, à côté de `logo-soguasphar.png`). Intégrée
  côté serveur dans `buildAttestationHtml()` via `getAttestationStampDataUrl()`
  (même principe de cache base64 que `getAttestationLogoDataUrl()`), affichée
  dans la section « Pour SOGUASPHAR / Mandat accepté » du PDF — vérifié
  visuellement (conversion PDF → image avec `pdftoppm`) que le tampon est bien
  placé. **Si ce fichier image doit un jour être remplacé**, il suffit d'écraser
  `tampon-soguasphar.png` et de redémarrer (`appctl rebuild preco`) — le cache
  base64 est en mémoire du processus, pas sur disque.
  Texte de l'e-mail envoyé à la pharmacie après signature (route
  `POST /api/attestation/sign`) revu avec Hélène : **pas** de phrase « Pour
  toute question, vous pouvez nous répondre... » ni de signature e-mail en bas
  (juste « Bien cordialement, L'équipe SOGUASPHAR ») — demande explicite du
  14/10/2026, ne pas les rajouter. Expéditeur toujours `helene.counot@soguasphar.com`
  (jamais `compta@...`, voir mémoire). Confirmé que l'envoi n'a lieu que si la
  pharmacie a fourni une signature/tampon valide (la route renvoie 400 avant
  tout sinon) et que la date « Le : » se remplit automatiquement à la signature
  (`signedAt`, calculé côté serveur) — ces deux points étaient déjà corrects
  dans le code, pas de changement nécessaire, juste vérifiés.
  Testé avec un vrai envoi (mail à `helene.counot@soguasphar.com`, étiqueté
  « [TEST] » en clair dans le sujet et dans le corps, aucune vraie pharmacie
  concernée) avant publication.

## Aperçu "voir comme pharmacie" pour les administrateurs (ajouté le 13/10/2026)
Un compte administrateur SOGUASPHAR (rôle `soguasphar_admin`) peut, sur l'onglet
« Formulaire », choisir une pharmacie dans un menu déroulant (`#adminPreviewSelect`,
`renderAdminPreviewPharmacyOptions()` dans `app.js`) pour voir exactement ce que
voit cette pharmacie — sans créer de compte pharmacie de test. Points clés :
- Réutilise `currentPharmacy` (tout l'affichage existant marche donc tel quel),
  avec un marqueur `isAdminPreview: true` qui déclenche `isAdminPreviewMode()`.
  **Jamais persisté dans `localStorage`** (sinon l'admin se retrouverait avec
  une fausse session pharmacie au rechargement de page).
- **Lecture seule, à deux niveaux** : les boutons d'envoi/signature sont grisés
  visuellement (CSS `body.admin-preview-mode`, ciblé sur les formulaires
  `#requestForm`/`#pollForm`/`#profileUpdateForm`/`#batValidationForm`/
  `#attestationForm` uniquement, jamais sur les formulaires d'admin qui vivent
  aussi dans `#formView`), ET bloqués dans le code (`blockIfAdminPreview()` en
  tout début de chaque gestionnaire `submit`) — vérifié qu'un envoi forcé par
  JavaScript (contournant le bouton grisé) n'atteint jamais le serveur.
- **Piège évité** : le bouton « Changer de pharmacie » (`logoutPharmacyBtn`)
  appelait `/api/auth/logout` pour une vraie pharmacie — ça aurait déconnecté
  le compte ADMIN lui-même en mode aperçu. Corrigé : cet appel est sauté quand
  `isAdminPreviewMode()` est vrai.
- **Piège évité (attestation)** : `getAttestation()` n'envoyait jamais le
  `pharmacyId` au serveur (il comptait sur la session pharmacie réelle, que
  l'admin n'a pas) — la carte attestation restait invisible en aperçu. Corrigé
  en passant `?pharmacyId=<currentPharmacy.id>` explicitement. Si un nouveau
  type de document/réponse est ajouté un jour, vérifier que sa route de lecture
  accepte bien un `pharmacyId` explicite (les autres routes `/api/pharmacy-*`
  l'acceptaient déjà, aucune n'exige d'authentification côté serveur).
- `renderAdminPreviewPharmacyOptions()` doit être appelée à CHAQUE chemin de
  connexion admin qui charge `pharmacies` (il y en a 4 : rechargement de page
  dans `init()`, connexion par e-mail, après changement de mot de passe
  obligatoire, après réinitialisation de mot de passe) — sinon le menu
  déroulant reste vide pour ce chemin-là.

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

## Clôture automatique des précommandes en retard (ajouté le 19/10/2026)
Jusqu'ici, une précommande ne se clôturait **que** si un admin cliquait sur
« Clôturer » (ce qui déclenche `notifyCampaignClosed()` → e-mail récapitulatif
quantités + détail par pharmacie à `ARCHIVE_NOTIFY_EMAILS`). Résultat : un
vendredi, 4 précommandes dont la date de clôture était passée sont restées
« ouvertes » faute de clic, et personne n'a reçu l'e-mail. Corrigé en ajoutant
une vraie clôture automatique :
- `autoCloseExpiredCampaigns()` (`server.js`, juste avant les relances
  automatiques) : chaque jour à 8h heure Guadeloupe (même créneau que
  `checkReminders()`), repère les précommandes non `draft`, non déjà `closed`,
  dont la date de clôture (`closingDateForOrder`) est dépassée, les passe à
  `closed: true` et appelle `notifyCampaignClosed()` pour chacune — exactement
  comme un clic manuel. **Toujours actif** (contrairement aux relances
  pharmacies, qui restent derrière `ENABLE_AUTO_REMINDERS`).
- **Garde-fou anti-surprise rétroactive** : `AUTO_CLOSE_START_DATE` (`.env` +
  `docker-compose.yml`, posé à `2026-10-19` à la mise en service) — toute
  précommande dont la date de clôture est *antérieure* à cette date est
  ignorée par la clôture automatique et reste à traiter à la main comme avant.
  Sans ce garde-fou, la première exécution aurait clôturé d'un coup (et envoyé
  un e-mail pour) toutes les précommandes déjà en retard à l'activation — au
  19/10/2026 il y en avait encore 5 (LISOPAINE, opération GUIGOZ novembre,
  OXYPROLANE/CURCUMA, BEURER, BLEDIDEJ mois du bébé), volontairement laissées
  de côté, pas forcément en retard "par erreur" (un admin a pu les laisser
  ouvertes exprès pour des réponses tardives). **Si Hélène veut un jour
  clôturer rétroactivement l'une d'elles, le faire à la main (bouton
  « Clôturer ») plutôt que de reculer `AUTO_CLOSE_START_DATE`** — reculer
  cette date rouvrirait le risque d'un envoi en masse non souhaité.
- Les 4 précommandes manquées du 16/10/2026 (Gourde personnalisée SOGUASPHAR
  1,2L, NATIYE, Culottes menstruelles, Thermomètre digital) ont été clôturées
  à la main ce jour-là (via l'API, sauvegarde avant dans `data-backups/`),
  les 4 e-mails récap sont bien partis.
- Si un nouveau type d'opération avec quantités a besoin du même traitement
  un jour, réutiliser ce même principe (vérif quotidienne + garde-fou de date
  de démarrage) plutôt que d'en recréer un autre.
- **19/10/2026 : expéditeur du mail de clôture corrigé.** `notifyCampaignClosed()`
  ne précisait pas d'expéditeur et retombait donc sur le défaut de `sendMail()`
  (`helene.counot@soguasphar.com`) — repéré par Hélène après l'envoi. Cet
  e-mail récap (quantités + dispatch, vers `ARCHIVE_NOTIFY_EMAILS`) n'attend
  aucune réponse : corrigé pour partir depuis `ne_pas_repondre@soguasphar.com`
  (comme les relances pharmacies), jamais `helene.counot@soguasphar.com`.
  **Toujours préciser `from`/`fromName` explicitement dans tout nouvel appel à
  `sendMail()`, ne jamais compter sur le défaut.**

## Espace SOGUASPHAR Awards pour les pharmacies — EN LIGNE depuis le 23/10/2026
Nouveau bouton menu pharmacie « 🏆 SOGUASPHAR Awards » (`#viewAwards`, hero-menu), ouvre une
fenêtre DANS le site (modale `#awardsModal`/iframe `#awardsModalFrame`, même motif que
`openPdfPreview()`/`closePdfPreview()` — fonctions `openAwardsSpace()`/`closeAwardsSpace()`,
juste après dans `app.js`) chargeant la fiche invité de l'app **SOGUASPHAR Awards**
(`/opt/apps/soguasphar-awards`), sans aucune nouvelle identification pour la pharmacie.
- **Pont SSO** : route `GET /api/awards-link` (server.js, juste après `/api/auth/me`) —
  réservée aux comptes pharmacie connectés (`getAuthenticatedPrincipal().pharmacyId`), signe
  un JWT HS256 **fait à la main** (`signShortAwardsToken()`, juste après les constantes en
  tête de fichier — ce projet est volontairement sans dépendance npm, donc pas de lib
  `jsonwebtoken` ; le format produit est un vrai JWT standard, vérifiable tel quel côté Awards
  avec `jsonwebtoken`, testé par vérification croisée) contenant
  `{type:"pharmacy", login:pharmacyId, name, aud:"awards"}`, expirant en **60 secondes**
  (jeton d'échange immédiat, jamais stocké). Secret partagé `AWARDS_SSO_SECRET` (même valeur
  que le `.env` d'Awards), présent dans `.env` et `docker-compose.yml` des DEUX dossiers
  (`soguasphar-preco-test` ET `soguasphar-preco`, production).
- Côté Awards, nouvelle route `GET /api/auth/sso-link-pharmacy` (server.js, juste avant
  `/api/auth/logout`) vérifie ce JWT, retrouve ou crée la fiche « guest » (table `guests`,
  `type='pharmacy'`) de façon stable par `login` (index unique partiel
  `guests_pharmacy_login_idx`, upsert atomique — jamais de doublon même en cas de double-clic),
  génère son jeton personnel pérenne (`access_token`, même mécanisme que les liens labo/
  partenaire) si absent, puis redirige vers `/awards/invite?t=<token>` — **toujours avec le
  préfixe `/awards` dans le `Location` d'une vraie redirection HTTP** (contrairement au champ
  JSON `redirect` du portail labo, consommé en JS côté client qui est déjà sous `/awards/...`).
- **CSP `frame-ancestors`** côté Awards (`server.js`) inclut désormais `https://preco.soguasphar.fr`
  EN PLUS de `https://soguaspilot.soguasphar.fr` (ajouté le 23/10/2026 pour la mise en prod) —
  `preco-test` n'en a pas besoin séparément (même origine `apps.soguasphar.fr` que Awards).
- **Piège rencontré et corrigé le 23/10/2026, à la mise en prod** : le logo affiché dans le bloc
  (`<img src="https://apps.soguasphar.fr/awards/award-logo.png">`) ne se chargeait pas depuis
  `preco.soguasphar.fr` (`ERR_BLOCKED_BY_RESPONSE.NotSameOrigin`) — invisible en TEST car
  `preco-test` et `awards` partagent la même origine (`apps.soguasphar.fr`), donc jamais
  déclenché là-bas. Cause : helmet pose par défaut `Cross-Origin-Resource-Policy: same-origin`
  sur TOUTES les réponses d'Awards, qui bloque le chargement d'une image par une page d'une
  AUTRE origine (`preco.soguasphar.fr` est un domaine différent d'`apps.soguasphar.fr`).
  Corrigé côté Awards (`server.js`, config `helmet(...)`) avec
  `crossOriginResourcePolicy: { policy: "cross-origin" }`. **Si un jour une autre ressource
  statique d'Awards doit être chargée depuis une page d'une origine différente (logo, image...),
  ce réglage couvre déjà tous les cas — rien à refaire.**
- Bouton visible uniquement pour une vraie session pharmacie (`isNewSystemPharmacy`), jamais
  pour une administratrice ni en mode « voir comme pharmacie » (aperçu lecture seule).
- **Vérifié le 23/10/2026** (Playwright, 2 comptes pharmacie de test créés dans
  `data/users.json` de `preco-test` — `test-awards-azar@soguasphar.fr` / `test-awards-bamb@
  soguasphar.fr`, mot de passe `TestAwards2026!`, sauvegarde de `users.json` faite avant dans
  `data-backups/`) : ouverture directe sans nouvelle connexion, chaque pharmacie voit SA
  propre fiche (noms différents, jamais mélangés), présence/vote/Soguas'talks s'enregistrent
  chacun indépendamment et persistent après rechargement, les deux fiches apparaissent bien
  dans l'admin Awards (`type='pharmacy'`), isolation stricte vérifiée (jetons distincts et non
  devinables, jamais transmis en clair — un identifiant/nom seul dans l'URL n'aurait jamais
  suffi), rendu correct en desktop et mobile (iframe redimensionnée
  `.awards-preview-dialog`/`#awardsModalFrame`, styles.css).
- **Mise en production le 23/10/2026** : les mêmes changements (serveur + écran) ont été portés
  à la main dans `/opt/apps/soguasphar-preco` (PAS via `appctl publier preco`, qui aurait écrasé
  ces modifications avec l'ancienne copie de test — `preco-test` a divergé entre-temps avec
  d'autres chantiers non liés, pré-cadencier notamment, à ne jamais porter en prod avec ceci).
  Déployé par `sudo appctl rebuild preco` (reconstruction directe du dossier prod, pas un
  `publier`). Revue de sécurité ciblée faite avant publication (jeton 60s à usage immédiat,
  signature HMAC vérifiée côté Awards avec `jsonwebtoken`, `pharmacyId` toujours tiré de la
  session serveur jamais d'un paramètre client, aucune route admin sans contrôle d'auth) :
  aucun point bloquant, juste `AWARDS_SSO_SECRET` à copier dans le `.env` prod (fait).
  Vérifié en production par des contrôles non destructifs (jamais de connexion avec un vrai
  identifiant pharmacie, pour ne toucher aucune donnée réelle) : page d'accueil et écran de
  connexion intacts (agent `verificateur`), route `/api/awards-link` refuse bien sans session
  pharmacie (403, testé sans cookie et avec un cookie invalide, jamais de 500), CSP et en-tête
  anti-blocage d'image vérifiés en direct sur `https://apps.soguasphar.fr/awards/` depuis
  l'extérieur. Le parcours complet pharmacie (ouverture réelle de la modale, vote, Soguas'talks)
  n'a pas été rejoué avec un vrai compte en production (pour ne créer aucune fausse donnée ni
  usurper une vraie pharmacie) — il repose sur le fait que c'est EXACTEMENT le même code que
  celui déjà vérifié de bout en bout sur `preco-test` (2 comptes dédiés, voir ci-dessus), à
  l'exception du secret/domaine (revérifiés identiques/corrects) et du correctif CORP
  ci-dessus (propre à la prod, maintenant corrigé et revérifié). **Si un souci apparaît malgré
  tout une fois de vraies pharmacies connectées, revenir en arrière avec `git checkout --
  app.js server.js index.html styles.css docker-compose.yml` dans ce dossier (travail non
  commité au moment du déploiement) puis `sudo appctl rebuild preco`.**

## Pré-cadencier (ex: Roche Diabète 2027) — code manquant en prod réparé le 23/10/2026
L'opération « Pré-cadencier Roche Diabète 2027 » (9 produits, colonnes `Qantités LIV 1`
à `Qantités LIV 4` + `total  unités annuelles` dans `data/orders.json`) avait été
**publiée sur le site en ligne le 19/10/2026 sans le code qui sait afficher/traiter ce
type de colonnes** : le code correspondant n'avait été développé et validé que dans
`soguasphar-preco-test`, jamais commité/porté en prod (contrairement à l'habitude —
voir la section « Comment on travaille », abandonnée depuis le 13/10 au profit d'une
modif directe en prod). Résultat signalé par Hélène le 23/10/2026 : les pharmacies ne
pouvaient pas saisir une quantité par livraison ni leur date de livraison souhaitée.
**Corrigé** en portant depuis `soguasphar-preco-test` UNIQUEMENT ce qui concerne le
pré-cadencier (le reste de la copie de test avait divergé avec d'autres chantiers —
attestation 2027, Awards — déjà portés séparément en prod à leur époque, donc pas
touché) :
- Détection par convention sur le nom de colonne (`app.js`, juste avant
  `isPriceColumn`) : `isQuantitySubColumn()` (colonne `LIV <n>`) et
  `isComputedTotalColumn()` (colonne `total ... annuel`) — aucune configuration à
  stocker, n'affecte aucune autre opération.
- `renderOrderTemplate()` : une colonne `LIV n` devient un champ de saisie
  (`.quantity-sub-input`), la colonne `Total annuel` devient un champ calculé en
  lecture seule (`.row-total-input`, classe `recomputeRowTotal()`) qui remplace la
  colonne « Quantité » générique le temps qu'il reste masqué/affiché.
- Section « Dates de livraison souhaitées » (`#deliveryDatesSection` dans
  `index.html`, un champ date par colonne LIV) affichée sous le tableau, saisie
  envoyée dans `response.deliveryDates` (`server.js`, route `POST /api/responses`) et
  reprise à l'export (`buildDispatchWorkbookHtml()`, colonnes « Date livraison N »).
- CSS ajouté dans `styles.css` (largeur des colonnes LIV/total, grille des champs date).
Vérifié avec Playwright en production (sans soumettre de vraie réponse) : les 4
colonnes LIV sont saisissables, le total se recalcule en direct, la section dates de
livraison s'affiche, aucune erreur JavaScript. **Si une autre opération « pré-cadencier »
est créée un jour**, il suffit de nommer ses colonnes selon la même convention
(`LIV <n>` / `Total ... annuel`) — rien à coder en plus. **Et surtout : la prochaine
fois qu'un développement est validé sur `preco-test`, bien penser à le porter en prod
avant de publier la donnée qui en dépend** (ici la précommande a été mise en ligne 4
jours avant que quiconque ne remarque que le code manquait).

## Pièges connus
- **23/10/2026 (audit après mise en prod) : aperçu admin SOGUASPHAR Awards bloquant pour
  42/44 pharmacies + 2 fiches de test réelles trouvées en base Awards (AZAR, BAMBOU
  VERT).** Cause 1 : `GET /api/awards-link-preview` ne transmettait QUE l'identifiant
  (`pharmacy.id`), jamais le nom/titulaire — côté Awards, `GET /api/preview/pharmacy`
  faisait un simple `SELECT` et renvoyait un 404 bloquant dès qu'aucune fiche
  n'existait encore (seule une VRAIE connexion pharmacie via `/api/awards-link` crée la
  fiche, jamais un aperçu admin). Corrigé : cette route transmet désormais `name` +
  `titulaireFirstName`/`titulaireLastName` (même source que `/api/awards-link`), et
  Awards construit un aperçu virtuel en lecture seule (aucune écriture en base) à
  partir de ces infos quand la fiche n'existe pas encore — voir la fiche CLAUDE.md
  d'Awards pour le détail côté serveur. Cause 2 : les 2 seules fiches en base
  (créées le 23/10/2026 pendant les tests de mise en prod) contenaient des noms de
  test non nettoyés ("Jeanne TESTAZAR", "Marie DUPONT-VERIF", "Paul MARTIN-VERIF",
  votes factices) — sauvegardées dans `/opt/apps/soguasphar-awards/backups-manuels/`
  puis supprimées (la prochaine vraie connexion pharmacie recrée une fiche propre,
  comportement déjà correct, rien à changer là). Vérifié par appel direct à l'API
  (jeton signé manuellement) sur AZAR, BAMBOU VERT et un login inexistant : les 3
  renvoient un aperçu virtuel propre (nom correct, aucune donnée inventée), plus de
  404. **Rattachement Préco↔Soguaspilot vérifié à 44/44 (bilan chiffré), 5 cas « DE
  LA … » distingués seulement par l'ordre alphabétique identique des deux côtés (pas
  de CIP commun) — à sécuriser un jour avec un identifiant croisé si l'ordre venait à
  diverger entre les deux bases.**
- **19/10/2026 : relances pharmacies ET clôture auto jamais déclenchées en
  pratique (0 relance envoyée en 5 jours sur 44 pharmacies, repéré par
  Hélène).** `checkReminders()` et `autoCloseExpiredCampaigns()` étaient
  programmées uniquement via `setTimeout`/`setInterval` ancrés sur la durée de
  vie du conteneur (prochain passage à 8h00 heure Guadeloupe). Problème :
  Préco est redéployé très souvent (plusieurs fois par jour parfois) et
  CHAQUE redémarrage annule ce minuteur et le reprogramme ~24h plus tard à
  partir de l'instant du redémarrage — si aucun redémarrage ne tombe
  "par hasard" sur le bon créneau un jour donné, la vérification de ce
  jour-là est silencieusement sautée. Corrigé en ajoutant un appel immédiat
  des deux fonctions à CHAQUE démarrage du serveur, en plus du créneau
  quotidien habituel (`server.js`, juste après leur schedule respectif) :
  sans danger même avec des redémarrages fréquents, car les deux fonctions
  sont idempotentes (elles ne ré-agissent jamais sur ce qui a déjà été
  traité — `remindersSent` déjà posé, ou `closed: true` déjà posé). Testé en
  conditions réelles au redémarrage : 18 relances envoyées immédiatement pour
  PHYTOXIL (clôture le 20/10, J-1 ce jour-là). **Reste un angle mort assumé** :
  les 2 précommandes qui clôturaient CE jour-là (ORAL-B, cartes de fidélité)
  avaient leur fenêtre J-1 la veille (18/10), déjà manquée avant le correctif
  — pas de rattrapage automatique rétroactif pour un jour déjà passé (décision
  cohérente avec celle du 13/10 sur les relances : "aucun rattrapage
  rétroactif des opérations dont le J-1 est déjà passé"). **Toute nouvelle
  vérification programmée à l'avenir (quotidienne ou autre) doit reprendre ce
  même principe (appel immédiat au démarrage + créneau quotidien) plutôt que
  de compter sur un minuteur qui survit rarement assez longtemps dans ce
  projet.**
- **15/10/2026 : garde-fou anti-régression ajouté (`runStartupSecurityChecks`,
  server.js, juste avant `server.listen`).** Suite aux DEUX régressions
  silencieuses ci-dessous (fermeture de l'ancien accès pharmacie effacée, puis
  `lastLoginAt` sur `/api/auth/reset-password` effacé — toutes deux par le même
  commit `644f5c1` du 13/10 sans que personne ne s'en rende compte), le serveur
  relit désormais son propre code source **à chaque démarrage** (donc à chaque
  déploiement, manuel ou via le webhook GitHub) et vérifie que :
  1) `/api/pharmacy-login`, `/api/pharmacy-password`,
     `/api/pharmacy-password-reset-request` répondent bien 410 ;
  2) `/api/auth/login` et `/api/auth/reset-password` mettent bien à jour
     `lastLoginAt`.
  Si l'une de ces règles n'est plus respectée, une alerte e-mail part
  automatiquement à `helene.counot@soguasphar.com` (depuis
  `ne_pas_repondre@soguasphar.com`) + un message bien visible dans les logs
  (`docker logs soguasphar-preco`). Testé pour de vrai en simulant les deux
  régressions dans une copie du fichier (hors conteneur) : les deux sont
  détectées correctement, zéro faux positif sur le code sain.
  **Si une nouvelle route de sécurité/suivi est fermée ou corrigée à l'avenir
  et qu'elle mérite la même protection, ajouter sa vérification dans cette
  même fonction plutôt que de compter sur la mémoire humaine.**
- **15/10/2026 : dates affichées sur la fiche d'une opération.** Ajouté (entre le
  descriptif et la photo) `.delivery-date-info` (« Livraison prévisionnelle le... »)
  et `.period-closing-info` (« Clôture précommande le... »), déjà présentes dans le
  menu principal (`campaignCard`) mais absentes de la fiche détaillée
  (`renderOrderTemplate` / fonctions autour de la ligne 5436 de `app.js`). Texte
  et taille (16px, CSS `styles.css`) choisis avec Hélène. Si un nouvel endroit
  affiche une opération, penser à reprendre ces deux lignes pour rester cohérent.
- **15/10/2026 : ouverture de l'application lente — photos des précommandes
  envoyées en entier à chaque chargement.** `GET /api/orders` (appelé par
  `getCampaigns()` à CHAQUE ouverture de l'appli, pour les 44 pharmacies et
  l'admin) renvoyait tout `data/orders.json`, **y compris les photos en
  base64** (2,5 Mo sur 3,4 Mo au moment du diagnostic, jusqu'à 210 Ko par
  photo) — alors que la plupart ne sont jamais regardées à l'ouverture. Même
  principe que le correctif déjà fait pour Soguaspilot (route
  `/api/orders/:id/image`, créée le 13/10/2026) mais Préco lui-même ne
  l'utilisait pas encore pour son propre affichage.
  **Corrigé** : `GET /api/orders` renvoie maintenant `imageData`/`imageData2`
  sous forme de petites adresses (`/api/orders/<id>/image` et
  `/api/orders/<id>/image2`, la 2ᵉ route est nouvelle) au lieu du base64
  complet ; le navigateur ne va chercher la vraie photo que lorsqu'elle est
  réellement affichée (mise en cache 1h côté navigateur). Résultat mesuré :
  liste passée de ~3,4 Mo à ~56 Ko pour 26 commandes.
  **Piège évité (le plus important)** : `PUT /api/orders` envoie TOUJOURS le
  tableau COMPLET des commandes (même pour modifier une seule), reconstitué
  côté client à partir de ce que `GET /api/orders` a renvoyé. Si on n'avait pas
  fait attention, chaque enregistrement admin aurait réécrit `imageData` avec
  la petite adresse au lieu de la vraie photo → **toutes les photos auraient
  disparu au 1er enregistrement suivant**. Corrigé côté serveur : si le champ
  reçu est exactement `/api/orders/<id>/image` (ou `/image2`), on garde la
  vraie photo déjà enregistrée au lieu de l'écraser ; une vraie nouvelle photo
  (`data:image/...`) ou une suppression explicite (`""`) sont bien prises en
  compte. Testé par un aller-retour complet (GET → PUT sans rien changer →
  relecture de `data/orders.json`) : photo intacte, même longueur qu'avant.
  Côté affichage (`app.js`), ces petites adresses doivent passer par
  `resolveBatDocumentUrl()` (comme les documents BAT) pour fonctionner aussi
  sur la copie de test (`/preco-test/...`) — oublié une 1ʳᵉ fois, corrigé
  (4 endroits : `campaignCard`, `archivedOperationCard`,
  `refreshCampaignImagePreview`).
  **Au passage** : les 2 blocs de chargement au démarrage (`init()` dans
  `app.js`, plus les 4 rafraîchissements après connexion pharmacie/admin,
  répétés à 7 endroits) attendaient chaque information l'une après l'autre
  (`await` en série) alors qu'elles sont indépendantes — remplacé par
  `Promise.all([...])` partout où c'était le cas, pour ne pas cumuler les
  temps de réponse réseau à l'ouverture.
  **Si un nouveau champ image est ajouté un jour** (sur les sondages par
  exemple, `poll.imageData`, pas encore optimisé — 126 Ko seulement au moment
  du diagnostic, jugé pas prioritaire) : reproduire ce même principe (route
  dédiée + préservation au `PUT` + `resolveBatDocumentUrl()` à l'affichage)
  plutôt que d'improviser un autre mécanisme.
- **15/10/2026 : fenêtre "Mon équipe" (ajout d'une personne) inutilisable sur
  petit écran**, bouton "Créer l'accès" inaccessible sans réduire la fenêtre du
  navigateur. Cause : `.image-preview-dialog` (styles.css, classe partagée par
  la modale équipe, l'aperçu image et l'aperçu PDF) avait `max-height: 92vh`
  mais **aucun `overflow-y`** — le contenu qui dépasse était simplement coupé,
  sans ascenseur. Corrigé en ajoutant `overflow-y: auto` sur `.image-preview-dialog`
  (une seule ligne, s'applique automatiquement à toutes les modales qui
  partagent cette classe). Vérifié avec Playwright à 1024×350 px (plus petit
  qu'un écran réel) : le bouton devient atteignable par défilement. **Si une
  nouvelle modale basée sur `.image-preview-dialog` déborde un jour, ne pas
  recréer un correctif à part : c'est déjà géré par cette règle commune.**
- **15/10/2026 : pas d'œil pour voir le mot de passe** lors de la création du
  mot de passe après l'e-mail d'invitation (`#resetPasswordForm` /
  `#resetPasswordNew`), ni lors du changement d'un mot de passe provisoire
  (`#newAuthPasswordChangeForm`). Seul le formulaire de connexion normale avait
  ce bouton (`#toggleNewAuthPassword`). Corrigé en généralisant le mécanisme :
  tout bouton avec l'attribut `data-toggle-password="<id du champ>"` active
  automatiquement l'affichage/masquage (app.js, juste après le handler de
  `toggleNewAuthPassword`). **Pour tout nouveau champ mot de passe à l'avenir**,
  réutiliser cet attribut plutôt que redévelopper un bouton à la main.
- **15/10/2026 : prix à plus de 2 décimales dans les précommandes** (ex : opération
  ORAL-B, "22.965300000000003" ou "15.326" au lieu de "22,97"/"15,33"). Cause :
  import Excel — `XLSX.utils.sheet_to_json()` renvoie des cellules de prix comme
  nombres JS bruts (parfois « cassés » par l'arithmétique flottante, parfois
  réellement saisis à 3+ décimales côté fournisseur), et `cleanTemplateCell()`
  (app.js) faisait `String(value)` sans arrondir. **Règle stricte et définitive,
  ne plus jamais y toucher : un prix affiché = 2 décimales maximum, jamais plus.**
  Corrigé à deux niveaux : 1) `cleanTemplateCell()` arrondit désormais tout nombre
  JS à 2 décimales dès l'import (les entiers comme CIP/EAN ne sont pas affectés,
  `Number.isInteger` reste vrai) ; 2) filet de sécurité à l'affichage dans
  `displayColumnValue()`/`roundPriceText()` qui arrondit aussi toute valeur texte
  à plus de 2 décimales dans une colonne « prix/tarif/PU », au cas où une
  mauvaise donnée existerait déjà ou arriverait par un autre chemin (ne pas
  retirer ce filet, c'est la 2ᵉ ligne de défense). Données déjà importées de
  l'opération ORAL-B corrigées à la main dans `data/orders.json` et
  `data/responses.json` (24 + 4 valeurs, sauvegarde avant dans `data-backups/`).
  **Même jour, suite :** la colonne s'appelait à tort « Prix vente pharmacie »
  alors que ce sont des prix d'achat (voir la description de l'opération :
  « le prix d'achat réel est inférieur une fois la RFA de 7 % déduite »).
  Renommée en « Prix d'achat » (colonne + toutes les valeurs des 30 lignes du
  template, et dans les réponses déjà enregistrées) directement dans
  `data/orders.json` et `data/responses.json` (script Python ponctuel, montants
  non touchés, sauvegarde avant dans `data-backups/`) — aucun redémarrage
  nécessaire, ces fichiers sont relus à chaque requête (`readOrders()`,
  pas de cache mémoire).
  **Si un nouveau cas de prix à 3+ décimales est signalé un jour**, vérifier
  d'abord que ces deux arrondis sont toujours en place avant de chercher ailleurs.
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
- **14/10/2026 : « Accès refusé » (403) sur l'aperçu PDF de l'attestation 2027**
  (`GET /api/attestation/preview`, cliqué via « Voir le document complet avant
  de signer »). Cause : exactement le piège déjà noté plus haut (section
  « Aperçu voir comme pharmacie ») — cette route n'acceptait que les rôles
  pharmacie (`PHARMACY_SESSION_ROLES`), jamais `soguasphar_admin`, et lisait
  uniquement `user.pharmacyId` (vide pour un admin) au lieu d'un `pharmacyId`
  explicite en paramètre. Donc un admin en mode « aperçu pharmacie » (ou testant
  l'URL directement avec son propre compte admin) se faisait systématiquement
  rejeter. Corrigé en alignant la route sur `/api/attestation` : rôle admin
  accepté + `pharmacyId` lu en paramètre (`requireSamePharmacy`), et côté
  client `updateAttestationPreviewLink()` / le lien initial ajoutent
  `?pharmacyId=<currentPharmacy.id>` quand `isAdminPreviewMode()` est vrai.
  **À vérifier systématiquement sur toute nouvelle route de lecture d'un
  document/réponse** (le même oubli s'est produit deux fois sur l'attestation).
  **Suite (même jour) : ce correctif seul n'a pas suffi, le problème persistait**
  (Rémi, toujours "Accès refusé" puis en creusant l'erreur CONNECTORS_API_KEY
  reproduisait). Vraie cause additionnelle : `CONNECTORS_API_KEY` avait bien été
  ajoutée dans `.env` lors d'un 1er correctif plus tôt le 14/10, mais **jamais
  déclarée dans `docker-compose.yml`** (`environment:`) — ce fichier liste
  explicitement les variables transmises au conteneur, le reste de `.env` est
  ignoré (`env_file:` n'est pas utilisé ici). Donc `docker exec ... env` ne
  montrait pas la clé même après `appctl rebuild`. Corrigé en ajoutant
  `CONNECTORS_URL`/`CONNECTORS_API_KEY` dans `docker-compose.yml`. **Testé pour
  de vrai cette fois** : session admin injectée temporairement dans
  `data/sessions.json` (supprimée après coup) + `curl` sur la route avec
  `pharmacyId`, PDF `%PDF-1.4` bien reçu (67 Ko). **Leçon : toute nouvelle
  variable `.env` doit AUSSI être ajoutée dans `docker-compose.yml` pour
  arriver jusqu'au conteneur — vérifier avec `docker exec <conteneur> env` et
  pas seulement en lisant `.env` avant de dire "c'est corrigé".**
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
  **15/10/2026 : cette fermeture avait été effacée par erreur** par le commit
  qui a ajouté l'attestation 2027 (`644f5c1`, le 13/10 en fin de journée) — le
  code complet de l'ancien système (mot de passe unique, encore valable pour
  les 44 pharmacies) était redevenu actif sans que personne ne s'en rende
  compte, pendant un contrôle de sécurité. Refermé (3 routes → 410 à nouveau),
  republié et vérifié par `curl` en direct. **Leçon : une fermeture de route
  « protection par sécurité » peut être silencieusement annulée par un merge/
  une réécriture de bloc de code sur un gros `server.js` sans dépôt de test
  automatisé — si un futur contrôle de sécurité est fait, revérifier par un
  vrai appel (`curl -X POST .../api/pharmacy-login`) que les routes fermées le
  sont VRAIMENT, ne pas se fier au commit qui les a fermées un jour.**
- **15/10/2026 : "Jamais connecté" affiché à tort pour des comptes qui s'étaient
  pourtant déjà connectés** (titulaires ET comptes équipe) — signalé par Hélène
  pour le compte équipe de DU GOSIER (Pascale DONGAL), qu'elle avait vu se
  connecter elle-même. Même cause que le point juste au-dessus : le correctif
  du 13/10 sur `/api/auth/reset-password` (mise à jour de `lastLoginAt` au tout
  premier login via le lien d'invitation, pas seulement à `/api/auth/login`)
  avait disparu du code — très probablement effacé par le même commit `644f5c1`.
  Recorrigé (`lastLoginAt: new Date().toISOString()` ajouté dans le bloc de
  `/api/auth/reset-password`, server.js ~ligne 2607), republié.
  **Conséquence concrète découverte en vérifiant** : avant de corriger, une
  recherche sur toutes les pharmacies a trouvé **4 titulaires qui avaient déjà
  créé leur mot de passe mais apparaissaient "jamais connecté"** à cause de ce
  bug (DORVILLE, EBOUE, GIRARD DUGAMIN, LA LICORNE) — la relance d'activation
  envoyée le 15/10 au soir (voir plus bas) les a donc ciblées par erreur et a
  **invalidé leur mot de passe déjà créé** (nouveau lien envoyé, mot de passe
  précédent remplacé par un aléatoire). Pas grave en soi (il leur suffit de
  cliquer le nouveau lien reçu pour recréer leur mot de passe), mais à
  mentionner si l'une d'elles signale une confusion ("j'avais déjà un compte").
  Le compte équipe DU GOSIER a été corrigé à la main (lastLoginAt mis à la
  date du jour, date exacte réelle inconnue — approximation assumée, comme les
  12 comptes corrigés le 13/10).
  **Leçon pour toute relance future : avant d'envoyer un e-mail basé sur
  `lastLoginAt === null`, vérifier d'abord qu'aucun compte n'a `resetTokenHash`
  vide + `mustChangePassword: false` + `lastLoginAt` vide en même temps (signe
  que le compte a bien fini sa création mais que l'enregistrement a raté) —
  sinon on peut réinviter / invalider le mot de passe de quelqu'un qui est déjà
  inscrit.** Le script de relance du lundi 19/10 (`data/relance-lundi.js`,
  programmé via cron le 15/10) recalcule `lastLoginAt` en direct au moment de
  l'envoi, donc profite automatiquement de ce correctif.
- **15/10/2026 (suite, corrigé pour de bon) : un nouveau lien d'invitation ne doit
  JAMAIS invalider un mot de passe déjà créé.** Suite au point ci-dessus (4
  titulaires déjà actives invalidées par erreur par la relance du 15/10 au
  soir), corrigé à la racine : `issueAccountPasswordLink()` (`server.js`,
  utilisée par le bouton admin « Renvoyer l'invitation » ET par tout envoi de
  lien à la création d'un compte) n'écrase plus `passwordHash`/
  `mustChangePassword` quand le compte a déjà `mustChangePassword === false`
  (= la personne a déjà elle-même choisi son mot de passe) : seul un nouveau
  jeton de lien est posé, le mot de passe actuel continue de fonctionner tant
  qu'elle n'a pas cliqué ce nouveau lien et choisi un mot de passe elle-même.
  Même garde-fou ajouté dans `data/relance-lundi.js` (script programmé pour
  le 19/10) : le filtre des cibles exclut maintenant aussi
  `mustChangePassword !== false`, en plus de `!lastLoginAt`, et une double
  vérification au moment d'écrire les données passe un compte déjà actif
  sans y toucher même si le filtre changeait un jour. **Toute nouvelle
  fonctionnalité qui renvoie/régénère un lien de mot de passe doit réutiliser
  `issueAccountPasswordLink()` plutôt que de recopier la logique à la main —
  c'est exactement cette duplication (le script de relance avait sa propre
  copie du code) qui avait permis au bug de passer inaperçu une fois corrigé
  ailleurs.**
  **Réparation des 4 comptes déjà touchés** : avant le correctif, DORVILLE,
  EBOUE, GIRARD DUGAMIN et LA LICORNE avaient reçu la relance du 15/10 au soir
  et leur mot de passe avait déjà été invalidé. Restauré `passwordHash` /
  `mustChangePassword` / `resetTokenHash` / `resetTokenExpiresAt` de leurs 4
  comptes titulaires dans `data/users.json` à partir de la sauvegarde prise
  juste avant cette relance (`data-backups/users-before-relance-20261015-013714.json`),
  sans toucher aux autres comptes (sauvegarde de sécurité prise avant dans
  `data-backups/users-before-restore-4-pharmacies-*.json`). Résultat : leur
  ancien mot de passe fonctionne à nouveau, le nouveau lien envoyé par erreur
  est annulé. Un e-mail d'excuse (« erreur d'envoi, ignorez le lien, votre mot
  de passe actuel fonctionne toujours ») leur a été envoyé depuis
  `helene.counot@soguasphar.com` pour qu'elles ne refassent pas la procédure.
  **Si une autre pharmacie signale le même souci** (lien reçu alors qu'elle
  avait déjà un mot de passe actif), même traitement : restaurer depuis la
  sauvegarde la plus récente d'avant l'incident plutôt que de lui faire
  recréer un mot de passe.
- **19/10/2026 : l'ancien code administrateur partagé ("Code administrateur
  incorrect") était réapparu, Hélène ne pouvait plus entrer dans
  l'Administration.** Avait pourtant été fermé le 13/10/2026 (commit
  `36d442f`) : le formulaire `#adminLogin` ne devait plus comparer de code,
  juste rediriger vers la connexion personnelle (e-mail + mot de passe).
  Régression silencieuse (même famille que les deux autres déjà documentées
  plus bas, attribuées au commit `644f5c1` du 13/10 en fin de journée) : le
  code de comparaison (`if (code !== ADMIN_CODE) ...`) était redevenu actif
  dans `app.js` sans que `runStartupSecurityChecks` ne le détecte (cette
  vérification ne couvre que les routes pharmacie et `lastLoginAt`, pas ce
  formulaire). Refermé à l'identique du correctif d'origine, **avec un
  complément** : le formulaire `#adminLogin` vit dans l'onglet
  "Administration" mais l'écran de connexion personnelle (`#newAuthGate`)
  vit dans l'onglet "Formulaire" (`.view` caché si pas `.active`) — appeler
  `showNewAuthScreen()` sans d'abord basculer sur l'onglet "Formulaire"
  laissait l'écran invisible (ce défaut existait probablement déjà dans le
  correctif du 13/10, jamais remarqué). Le nouveau handler bascule donc
  d'abord sur l'onglet "Formulaire" avant d'appeler `showNewAuthScreen()`.
  Vérifié avec Playwright : taper n'importe quoi dans le code administrateur
  affiche bien l'écran e-mail + mot de passe (avec « Mot de passe oublié »)
  au lieu du message d'erreur. **Si ce formulaire réapparaît une 3ᵉ fois**,
  ajouter sa vérification dans `runStartupSecurityChecks()` (comme les deux
  autres) plutôt que de compter sur un signalement d'Hélène.
  **Même jour, dans la foulée (demande d'Hélène) :** le bouton "Administration"
  (barre du haut, à côté de "Formulaire") restait visible pour tout le monde
  avant connexion, et ne menait qu'à ce même écran déroutant — retiré tant
  qu'on n'est pas connectée avec un compte admin personnel. Logique
  centralisée dans `renderPharmacyAccess()` (app.js, juste après le calcul de
  `isAdmin`) : le bouton `.switch-btn[data-view="adminView"]` est caché par
  défaut (`hidden` posé aussi dans `index.html` pour éviter un flash au
  chargement de la page) et seulement ré-affiché quand
  `currentUser.role === "soguasphar_admin"`. Si on perd les droits admin
  (déconnexion, session expirée) en étant sur l'onglet Administration, on
  revient automatiquement sur "Formulaire". Vérifié avec Playwright en
  navigation anonyme : seul "Formulaire" visible, aucune erreur JS. **Si un
  autre bouton/lien mène un jour vers une zone réservée aux administrateurs,
  reprendre ce même principe (caché par défaut dans le HTML + ré-affiché par
  `renderPharmacyAccess()` selon le rôle) plutôt que de compter sur la
  destination elle-même pour refuser l'accès.**
- **19/10/2026 : copie de l'attestation signée envoyée à tort à un compte
  équipe.** `activePharmacyEmails()` envoie à TOUS les comptes actifs d'une
  pharmacie (titulaire `pharmacy_admin` + comptes équipe
  `pharmacy_collaborator`, sans distinction) — utilisé par erreur pour la
  copie du PDF signé, qui doit rester strictement entre SOGUASPHAR et le
  titulaire. Corrigé : nouvelle fonction `titulaireEmailsForPharmacy()`
  (server.js, juste après `activePharmacyEmails()`) qui ne garde que les
  comptes `role === "pharmacy_admin"` (repli sur `pharmacy.email` si aucun
  compte titulaire actif). **Au passage, expéditeur changé en
  `ne_pas_repondre@soguasphar.com`** (demande explicite d'Hélène le même jour)
  — **attention, ceci contredit la règle posée le 14/10/2026** ("expéditeur
  attestation = exclusivement helene.counot@soguasphar.com, jamais
  ne_pas_repondre, car la pharmacie doit pouvoir répondre") : la règle du
  19/10 est la plus récente et prévaut, mais si une pharmacie dit un jour
  "je n'arrive pas à vous répondre par e-mail sur l'attestation", c'est la
  cause probable — en reparler avec Hélène avant de retoucher ce from.
  **Si un autre document officiel (signature, validation) est ajouté un
  jour et ne doit partir qu'au titulaire, réutiliser
  `titulaireEmailsForPharmacy()`** plutôt que `activePharmacyEmails()`.
- **15/10/2026 (suite, dans l'après-midi) : EBOUE, GIRARD DUGAMIN et LA
  LICORNE réapparaissaient "Jamais connecté" dans l'export Excel admin**,
  malgré la restauration de leur mot de passe le matin même. Cause : la
  restauration du matin n'avait remis que `passwordHash` / `mustChangePassword`
  / `resetTokenHash` / `resetTokenExpiresAt` — pas `lastLoginAt`, qui était
  déjà `null` dans TOUTES les sauvegardes disponibles (y compris celle d'avant
  la relance foireuse) puisque le bug du 15/10 ci-dessus ne l'avait jamais
  enregistré pour elles. DORVILLE, elle, avait un `lastLoginAt` valide (login
  après le correctif) donc n'était pas concernée. Corrigé à la main dans
  `data/users.json` (sauvegarde avant dans `data-backups/users-before-fix-
  lastlogin-3-pharmacies-*.json`) : `lastLoginAt` posé à la date/heure du
  correctif (15/10 après-midi), **date exacte réelle inconnue — approximation
  assumée**, même principe que DU GOSIER et les 12 comptes du 13/10 (ces
  pharmacies s'étaient réellement déjà connectées avant, seul le champ était
  resté vide). Pas de redémarrage nécessaire (`data/users.json` relu à chaque
  requête). **Si un autre compte signale le même écart** (export Excel dit
  "jamais connecté" alors que la pharmacie confirme s'être déjà connectée) :
  vérifier d'abord `mustChangePassword === false` + `lastLoginAt` vide dans
  `data/users.json` (signe du même bug), pas la peine de chercher plus loin.
- **23/10/2026 : bloc SOGUASPHAR Awards invisible en aperçu administrateur
  « voir comme pharmacie » — corrigé (deuxième volet du pont Awards du même
  jour).** Le premier pont (pharmacie vraiment connectée, `/api/awards-link`)
  marchait déjà ; en aperçu admin, `isNewSystemPharmacy` est TOUJOURS faux
  (`currentUser` reste l'admin pendant tout l'aperçu, seul `currentPharmacy`
  change — voir `app.js` ~7458) donc le bloc restait cond. masqué. Corrigé
  SANS créer de session pharmacie pour l'admin (risque identifié et refusé :
  4 routes d'écriture Préco — commandes/sondages/infos/validations — ne
  vérifient aujourd'hui AUCUNE session, voir item juste en dessous) :
  - Nouvelle route Préco `GET /api/awards-link-preview?pharmacyId=` (server.js,
    juste après `/api/awards-link`), protégée par `requireAuth(["soguasphar_admin"])`
    — signe un jeton très court (60s, `signShortAwardsToken`, même secret
    `AWARDS_SSO_SECRET`) avec `{type:"pharmacy_preview", login:pharmacy.id,
    aud:"awards_preview"}`, vers `${AWARDS_BASE_URL}/invite?pt=<jeton>`.
  - Côté Awards (`/opt/apps/soguasphar-awards/server.js`), nouvelle route
    `GET /api/preview/pharmacy?token=` — vérifie le jeton (audience dédiée
    `awards_preview`, jamais confondue avec le pont pharmacie normal ni avec
    le pont admin Soguaspilot/`ADMIN_LOGINS`), renvoie la fiche RÉELLE de la
    pharmacie (participants/votes/talk/powerpoint, pas des données vidées
    comme l'ancien `/api/admin/preview/:type` générique) avec
    `preview:true, previewReal:true`, **ne crée jamais de session ni de
    jeton personnel invité** — donc aucune route d'écriture `/api/me/*`
    (toutes protégées par `requireGuest`, qui exige ce jeton personnel)
    n'est accessible depuis cet écran : lecture seule garantie par
    construction, pas seulement par des boutons désactivés.
  - `public/invite.js` : nouveau paramètre d'URL `?pt=` (distinct de `?t=`
    pharmacie et `?preview=pharmacy|labo` générique Soguaspilot), bannière
    "Aperçu administrateur — lecture seule, rien n'est enregistré." si
    `previewReal`, tous les champs/boutons déjà désactivés via
    `disabledAttr(d)` (`d.closed || d.preview`, préexistant).
  - `app.js` (Préco) : `awardsPromoBlock` visible aussi en aperçu admin ;
    `openAwardsSpace()` choisit `/api/awards-link-preview` au lieu de
    `/api/awards-link` quand `isAdminPreviewMode()` est vrai ; bandeau
    "Aperçu administrateur — lecture seule" ajouté dans la modale
    (`#awardsModalPreviewNote`, index.html, juste après le titre).
  - Vérifié par Playwright (agent dédié, compte admin de test créé puis
    supprimé dans `data/users.json`, `data-backups/` avant/après identiques) :
    les deux parcours fonctionnent, pas de fuite entre pharmacies (AZAR vs
    BAMBOU VERT), tentatives directes `PUT /api/me/presence`/`POST
    /api/me/vote` depuis l'iframe d'aperçu → 401 (aucun jeton exploitable).
  - **Faille préexistante signalée, PAS corrigée (hors périmètre de ce
    chantier, à traiter séparément avec Hélène)** : `POST /api/responses`,
    `/api/poll-responses`, `/api/info-responses`, `/api/validation-responses`
    (commandes/sondages/infos/validations) ne vérifient AUJOURD'HUI aucune
    session serveur — ils font confiance à un `pharmacyId` envoyé par
    l'écran, contrairement à `/api/attestation/sign` qui fait les choses
    bien (`requireAuth` + `user.pharmacyId` de la session, jamais celui du
    payload). Conséquence : n'importe qui connaissant l'identifiant d'une
    pharmacie pourrait aujourd'hui, en théorie, répondre à sa place sans
    être connecté. À corriger avec Hélène (reprendre le motif
    `/api/attestation/sign` : `requireAuth(PHARMACY_SESSION_ROLES)` puis
    `user.pharmacyId`, jamais celui du corps de la requête).
