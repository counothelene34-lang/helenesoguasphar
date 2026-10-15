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

## Pièges connus
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
