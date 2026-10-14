const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 56651);
// Le code admin ne doit JAMAIS avoir de valeur par défaut en dur dans le code :
// il vient uniquement du fichier .env (secret, jamais dans git). Si absent, le
// serveur refuse de démarrer plutôt que d'utiliser un mot de passe prévisible.
const ADMIN_CODE = process.env.ADMIN_CODE;
if (!ADMIN_CODE) {
  console.error("ADMIN_CODE manquant dans .env : le serveur ne peut pas démarrer sans ce secret.");
  process.exit(1);
}
// E-mail de clôture d'une opération : délégué au service COMMUN sogua-mailer
// (identifiants dans le coffre, copie auto dans « Envoyés »). Si la clé ou les
// destinataires manquent dans .env, on log une erreur mais on ne bloque jamais
// la clôture/sauvegarde de la campagne.
const MAILER_URL = process.env.MAILER_URL || "http://sogua-mailer:8080";
const MAILER_API_KEY = process.env.MAILER_API_KEY || "";
// Service commun "sogua-connectors" : utilisé UNIQUEMENT pour transformer le
// HTML de l'attestation d'engagement (texte pré-rempli + photo du tampon/
// signature) en PDF final (route /html-to-pdf). Si la clé manque, la
// signature échoue proprement (erreur claire), rien ne casse ailleurs.
const CONNECTORS_URL = process.env.CONNECTORS_URL || "http://sogua-connectors:8090";
const CONNECTORS_API_KEY = process.env.CONNECTORS_API_KEY || "";

async function htmlToPdf(html) {
  if (!CONNECTORS_API_KEY) {
    throw new Error("CONNECTORS_API_KEY manquant dans .env : génération de PDF impossible");
  }
  const result = await fetch(`${CONNECTORS_URL}/html-to-pdf`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": CONNECTORS_API_KEY },
    body: JSON.stringify({ html })
  });
  const data = await result.json().catch(() => ({}));
  if (!result.ok || !data.ok || !data.content) {
    throw new Error(data.error || `service PDF : HTTP ${result.status}`);
  }
  return Buffer.from(data.content, "base64");
}
// Adresse publique de CE site (copie de test ou site en ligne), utilisée pour
// construire les liens cliqués dans les e-mails (ex. réinitialisation de mot
// de passe). À définir dans .env ; valeur par défaut = le site en ligne.
const PUBLIC_BASE_URL = String(process.env.PUBLIC_BASE_URL || "https://preco.soguasphar.fr").replace(/\/$/, "");
const ARCHIVE_NOTIFY_EMAILS = String(process.env.ARCHIVE_NOTIFY_EMAILS || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

// Verrou de sécurité pour les relances automatiques aux PHARMACIES (voir plus
// bas, checkReminders) : contrairement au mail de clôture (déclenché par un
// geste volontaire de l'admin), les relances partent toutes seules en tâche de
// fond. Sur une copie de test (data de démonstration/essais, dates proches de
// "aujourd'hui" par hasard), ça enverrait de VRAIS e-mails à de VRAIES
// pharmacies par erreur — déjà arrivé une fois le 13/10/2026. Donc : désactivé
// par défaut PARTOUT, à activer explicitement avec ENABLE_AUTO_REMINDERS=true
// dans le .env UNIQUEMENT du site en ligne, jamais sur une copie de test.
const AUTO_REMINDERS_ENABLED = String(process.env.ENABLE_AUTO_REMINDERS || "").trim().toLowerCase() === "true";

async function sendMail({ to, subject, text, html, attachments, from, fromName }) {
  const recipients = to || ARCHIVE_NOTIFY_EMAILS.join(", ");
  if (!MAILER_API_KEY || !recipients) {
    console.error("[preco] e-mail non envoyé : MAILER_API_KEY ou destinataire manquant dans .env");
    return;
  }
  const payload = {
    from: from || "helene.counot@soguasphar.com",
    fromName: fromName || "Préco SOGUASPHAR",
    to: recipients,
    subject,
    text,
    html,
    attachments: (attachments || []).map((attachment) => ({
      filename: attachment.filename,
      content: Buffer.from(String(attachment.content || ""), "utf8").toString("base64"),
      contentType: attachment.contentType || "application/vnd.ms-excel"
    }))
  };
  const result = await fetch(`${MAILER_URL}/send`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": MAILER_API_KEY },
    body: JSON.stringify(payload)
  });
  const data = await result.json().catch(() => ({}));
  if (!result.ok || !data.ok) throw new Error(data.error || `service e-mail : HTTP ${result.status}`);
}

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "responses.json");
const ORDER_TEMPLATE_FILE = path.join(DATA_DIR, "order-template.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const POLLS_FILE = path.join(DATA_DIR, "polls.json");
const POLL_RESPONSES_FILE = path.join(DATA_DIR, "poll-responses.json");
const INFO_FORMS_FILE = path.join(DATA_DIR, "info-forms.json");
const INFO_RESPONSES_FILE = path.join(DATA_DIR, "info-responses.json");
const PHARMACIES_FILE = path.join(DATA_DIR, "pharmacies.json");
const VALIDATION_FILE = path.join(DATA_DIR, "validation.json");
const VALIDATION_RESPONSES_FILE = path.join(DATA_DIR, "validation-responses.json");
const BAT_DOCUMENTS_DIR = path.join(DATA_DIR, "bat-calendriers-2027");
const ATTESTATIONS_FILE = path.join(DATA_DIR, "attestations.json");
const ATTESTATION_RESPONSES_FILE = path.join(DATA_DIR, "attestation-responses.json");
const ATTESTATION_PDF_DIR = path.join(DATA_DIR, "attestations-2027");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
const SESSION_COOKIE_NAME = "preco_session";
// Durée glissante des sessions : longue pour les comptes SOGUASPHAR (admin),
// courte pour les comptes pharmacie (titulaires/préparateurs) — sécurité
// demandée le 12/10/2026 : une pharmacie doit redemander son mot de passe
// après une période d'inactivité (le navigateur le propose s'il l'a mémorisé).
const ADMIN_SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours, glissant
const PHARMACY_SESSION_DURATION_MS = 60 * 60 * 1000; // 1 heure, glissant
const PHARMACY_SESSION_ROLES = ["pharmacy_admin", "pharmacy_collaborator", "pharmacy_legacy"];
function sessionDurationForRole(role) {
  return PHARMACY_SESSION_ROLES.includes(role) ? PHARMACY_SESSION_DURATION_MS : ADMIN_SESSION_DURATION_MS;
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg"
};

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");
  if (!fs.existsSync(ORDER_TEMPLATE_FILE)) fs.writeFileSync(ORDER_TEMPLATE_FILE, "[]", "utf8");
  if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]", "utf8");
  if (!fs.existsSync(POLLS_FILE)) fs.writeFileSync(POLLS_FILE, "[]", "utf8");
  if (!fs.existsSync(POLL_RESPONSES_FILE)) fs.writeFileSync(POLL_RESPONSES_FILE, "[]", "utf8");
  if (!fs.existsSync(INFO_FORMS_FILE)) fs.writeFileSync(INFO_FORMS_FILE, "[]", "utf8");
  if (!fs.existsSync(INFO_RESPONSES_FILE)) fs.writeFileSync(INFO_RESPONSES_FILE, "[]", "utf8");
  if (!fs.existsSync(PHARMACIES_FILE)) fs.writeFileSync(PHARMACIES_FILE, "[]", "utf8");
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]", "utf8");
}

function readResponses() {
  ensureDataFile();
  const responses = JSON.parse(fs.readFileSync(DATA_FILE, "utf8") || "[]");
  if (!responses.length) return responses;

  // Même principe que readOrders()/normalizeTemplate() ci-dessous : les anciennes
  // réponses ont des produits au format plat {designation,cip,tarif,colisage,quantity}.
  // On les convertit à la volée vers la forme canonique {rowId, values, quantity} à
  // chaque lecture, SANS jamais réécrire le fichier tant que rien d'autre ne
  // provoque une sauvegarde — aucune donnée n'est perdue si cette migration a un bug.
  // On lit les campagnes UNE SEULE FOIS (et pas une fois par réponse) : orders.json
  // peut être volumineux (images encodées en base64 dans les campagnes).
  const templatesByCampaign = new Map(readOrders().map((order) => [order.id, order.template]));
  return responses.map((response) => {
    const campaignId = String(response.campaignId || "herboristerie");
    const template = templatesByCampaign.get(campaignId) || { rows: [] };
    return { ...response, products: normalizeResponseProductsWithTemplate(response.products, template) };
  });
}

function writeResponses(responses) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(responses, null, 2), "utf8");
}

function readOrderTemplate() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(ORDER_TEMPLATE_FILE, "utf8") || "[]");
}

function writeOrderTemplate(template) {
  ensureDataFile();
  fs.writeFileSync(ORDER_TEMPLATE_FILE, JSON.stringify(template, null, 2), "utf8");
}

function defaultOrders() {
  return [
    {
      id: "herboristerie",
      title: "Herboristerie",
      type: "Précommande",
      description: "Bon de commande Herboristerie extrait du PDF.",
      pharmacyMessage: "",
      imageData: "",
      imageData2: "",
      closed: false,
      periods: [],
      template: readOrderTemplate()
    }
  ];
}

function readOrders() {
  ensureDataFile();
  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8") || "[]");
  const list = orders.length ? orders : defaultOrders();
  // Migration en mémoire (voir commentaire au-dessus de normalizeTemplate) :
  // chaque lecture garantit un template dans la forme canonique {columns,
  // colisageColumn, rows}, quelle que soit la forme stockée sur disque.
  return list.map((order) => ({ ...order, template: normalizeTemplate(order.template) }));
}

function writeOrders(orders) {
  ensureDataFile();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
}

function readPolls() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(POLLS_FILE, "utf8") || "[]");
}

function writePolls(polls) {
  ensureDataFile();
  fs.writeFileSync(POLLS_FILE, JSON.stringify(polls, null, 2), "utf8");
}

function readPollResponses() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(POLL_RESPONSES_FILE, "utf8") || "[]");
}

function writePollResponses(responses) {
  ensureDataFile();
  fs.writeFileSync(POLL_RESPONSES_FILE, JSON.stringify(responses, null, 2), "utf8");
}

function defaultInfoForms() {
  return [{
    id: "fiche-pharmacie-2026",
    title: "Mise à jour du site internet SOGUASPHAR : informations pharmacies",
    intro: "Merci de noter vos coordonnées, réseaux sociaux, horaires et services proposés.",
    type: "Fiche pharmacie",
    closed: false
  }];
}

function readInfoForms() {
  ensureDataFile();
  const forms = JSON.parse(fs.readFileSync(INFO_FORMS_FILE, "utf8") || "[]");
  return forms.length ? forms : defaultInfoForms();
}

function writeInfoForms(forms) {
  ensureDataFile();
  fs.writeFileSync(INFO_FORMS_FILE, JSON.stringify(forms, null, 2), "utf8");
}

function readInfoResponses() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(INFO_RESPONSES_FILE, "utf8") || "[]");
}

function writeInfoResponses(responses) {
  ensureDataFile();
  fs.writeFileSync(INFO_RESPONSES_FILE, JSON.stringify(responses, null, 2), "utf8");
}

// Lit pharmacies.json et migre à la volée tout mot de passe encore en clair
// (ancien format) vers un hachage scrypt — comme pour les comptes nominatifs.
// Auto-réparateur : s'exécute à chaque lecture, sans action manuelle requise.
function readPharmacies() {
  ensureDataFile();
  const pharmacies = JSON.parse(fs.readFileSync(PHARMACIES_FILE, "utf8") || "[]");
  let changed = false;
  const migrated = pharmacies.map((pharmacy) => {
    if (pharmacy && typeof pharmacy.password === "string" && pharmacy.password) {
      changed = true;
      const { password, ...rest } = pharmacy;
      return { ...rest, passwordHash: hashPassword(password) };
    }
    return pharmacy;
  });
  if (changed) {
    fs.writeFileSync(PHARMACIES_FILE, JSON.stringify(migrated, null, 2), "utf8");
  }
  return migrated;
}

function writePharmacies(pharmacies) {
  ensureDataFile();
  fs.writeFileSync(PHARMACIES_FILE, JSON.stringify(pharmacies, null, 2), "utf8");
}

// Ne renvoie jamais le hachage du mot de passe au navigateur : il est inutile
// côté client et ça évite de l'exposer même sous forme hachée.
function stripPharmacySecret(pharmacy) {
  const { passwordHash, ...rest } = pharmacy;
  return rest;
}

// --- Comptes individuels (email + mot de passe) -----------------------------
// Fondations de la connexion par compte nominatif, en plus (pas en remplacement)
// de l'ancien mot de passe unique par pharmacie (/api/pharmacy-login) et du code
// admin général (x-admin-code), qui restent fonctionnels pendant la transition.

function readUsers() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf8") || "[]");
}

function writeUsers(users) {
  ensureDataFile();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function findUserByEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  return readUsers().find((user) => normalizeEmail(user.email) === normalized) || null;
}

// Réduit une chaîne à des lettres/chiffres minuscules sans accents, pour
// comparer "BAMBOU VERT" et "bambouvert@gmail.com" malgré espace/accents/casse.
function normalizeForMatch(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// Sécurité "compte équipe" : l'adresse e-mail doit contenir au moins un mot
// significatif du nom de la pharmacie (ex: pour "BAMBOU VERT", l'e-mail doit
// contenir "bambou" ou "vert" - gmail/hotmail génériques sans rapport avec la
// pharmacie sont refusés). Les mots trop génériques ("pharmacie", "sarl"...)
// ou trop courts ne comptent pas comme preuve suffisante.
const PHARMACY_NAME_STOPWORDS = new Set([
  "pharmacie", "pharma", "sarl", "sas", "eurl", "sci", "du", "de", "la", "le",
  "les", "des", "et", "saint", "sainte", "grande", "petite", "nouvelle"
]);
function emailMatchesPharmacyName(email, pharmacyName) {
  const normalizedEmail = normalizeForMatch(String(email || "").split("@")[0]) + normalizeForMatch(String(email || "").split("@")[1] || "");
  const words = String(pharmacyName || "")
    .split(/[^a-zA-Z0-9À-ÿ]+/)
    .map((word) => normalizeForMatch(word))
    .filter(Boolean);
  let significant = words.filter((word) => word.length >= 3 && !PHARMACY_NAME_STOPWORDS.has(word));
  if (!significant.length) significant = words.filter((word) => word.length >= 2);
  if (!significant.length) return true; // nom de pharmacie sans mot exploitable : ne pas bloquer
  return significant.some((word) => normalizedEmail.includes(word));
}

// Hachage de mot de passe avec scrypt (module natif "crypto", aucune dépendance
// externe). Le sel et le hash sont stockés ensemble dans une seule chaîne :
// "scrypt:<selHex>:<hashHex>".
function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derivedKey = crypto.scryptSync(String(password), salt, 64, { N: 16384 });
  return `scrypt:${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== "string") return false;
  const parts = storedHash.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  try {
    const salt = Buffer.from(parts[1], "hex");
    const expected = Buffer.from(parts[2], "hex");
    const actual = crypto.scryptSync(String(password), salt, expected.length, { N: 16384 });
    if (actual.length !== expected.length) return false;
    return crypto.timingSafeEqual(actual, expected);
  } catch (error) {
    return false;
  }
}

// Règle de mot de passe commune (pharmacies et comptes nominatifs) : au moins
// 6 caractères, une majuscule, un chiffre, un symbole. Renvoie un message
// d'erreur en français si la règle n'est pas respectée, ou "" si tout est
// bon. Doit rester cohérente avec la même fonction côté client (app.js).
function passwordRuleError(password) {
  if (!password || password.length < 6) {
    return "Le mot de passe doit contenir au moins 6 caractères.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une majuscule.";
  }
  if (!/[0-9]/.test(password)) {
    return "Le mot de passe doit contenir au moins un chiffre.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Le mot de passe doit contenir au moins un symbole (ex : ! ? @ # &).";
  }
  return "";
}

// Génère un mot de passe provisoire qui respecte toujours la règle commune
// (6 caractères minimum, une majuscule, un symbole), pour les nouveaux
// comptes nominatifs (comptes d'équipe) et leurs réinitialisations.
function generateTempPassword() {
  const random = crypto.randomBytes(5).toString("hex").toUpperCase();
  const symbols = "!@#$%&*?";
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  return `Eq${random}${symbol}`;
}

// --- Jeton de réinitialisation de mot de passe ------------------------------
// Un jeton aléatoire (envoyé par e-mail, jamais stocké en clair) donne accès
// 2 heures à la réinitialisation d'UN compte précis. On ne stocke que son
// empreinte (sha256) dans users.json, comme un mot de passe.
const RESET_TOKEN_VALIDITY_MS = 2 * 60 * 60 * 1000;

// Même mécanisme, mais pour le tout premier mot de passe d'un compte créé
// par une titulaire (elle-même ou un membre de son équipe) : la personne n'a
// encore jamais ouvert Préco, donc le lien reste valable plus longtemps (7
// jours) qu'une simple réinitialisation.
const INVITE_TOKEN_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000;

function hashResetToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Place un nouveau jeton de création/réinitialisation de mot de passe sur un
// compte et envoie le lien par e-mail. Utilisé à la création d'un compte
// (titulaire ou membre d'équipe) et quand une titulaire réinitialise le mot
// de passe d'un membre de son équipe : dans les deux cas, personne ne doit
// taper ou transmettre un mot de passe à la main.
function issueAccountPasswordLink(user, { isNewAccount }) {
  const token = generateResetToken();
  const users = readUsers();
  const updatedUsers = users.map((item) => item.id === user.id ? {
    ...item,
    passwordHash: hashPassword(crypto.randomBytes(24).toString("hex")), // mot de passe inconnu de tous tant que le lien n'est pas utilisé
    mustChangePassword: true,
    resetTokenHash: hashResetToken(token),
    resetTokenExpiresAt: Date.now() + INVITE_TOKEN_VALIDITY_MS
  } : item);
  writeUsers(updatedUsers);

  const resetLink = `${PUBLIC_BASE_URL}/?reset=${token}`;
  console.error(`[preco][debug] lien de création/réinitialisation pour ${user.email} : ${resetLink}`);
  const subject = isNewAccount
    ? "Préco SOGUASPHAR : créez votre mot de passe"
    : "Préco SOGUASPHAR : réinitialisation de votre mot de passe";
  const intro = isNewAccount
    ? "Un accès Préco vient d'être créé pour vous."
    : "Votre mot de passe Préco vient d'être réinitialisé.";
  sendMail({
    to: user.email,
    subject,
    text: `Bonjour,\n\n${intro}\n\nCliquez sur ce lien dans les 7 jours pour choisir votre mot de passe :\n${resetLink}\n\nSi vous ne vous attendiez pas à ce message, ignorez-le simplement.\n\n— Préco SOGUASPHAR`,
    html: `<p>Bonjour,</p><p>${intro}</p><p><a href="${resetLink}">Cliquez ici pour choisir votre mot de passe</a> (lien valable 7 jours).</p><p>Si vous ne vous attendiez pas à ce message, ignorez-le simplement.</p><p>— Préco SOGUASPHAR</p>`
  }).catch((error) => {
    console.error(`[preco] échec de l'e-mail de création/réinitialisation pour "${user.email}" :`, error.message);
  });
  return updatedUsers.find((item) => item.id === user.id);
}

function isResetTokenValid(user) {
  return Boolean(user.resetTokenHash) && Number(user.resetTokenExpiresAt) > Date.now();
}

function publicUser(user) {
  if (!user) return null;
  const pharmacy = user.pharmacyId
    ? readPharmacies().find((item) => item.id === user.pharmacyId)
    : null;
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    role: user.role,
    jobTitle: user.jobTitle || "",
    pharmacyId: user.pharmacyId || null,
    pharmacyName: pharmacy ? pharmacy.name : null,
    mustChangePassword: Boolean(user.mustChangePassword),
    active: user.active !== false,
    lastLoginAt: user.lastLoginAt || null
  };
}

// --- Sessions (token opaque, stocké en mémoire + sauvegarde sur disque) -----
// Pas de JWT externe : un jeton aléatoire fait office de clé vers une session
// en mémoire, rechargée au démarrage depuis data/sessions.json (survit à un
// redémarrage du serveur), avec expiration glissante de 30 jours.

const sessions = new Map(); // token -> { userId, expiresAt }

function loadSessions() {
  try {
    if (!fs.existsSync(SESSIONS_FILE)) return;
    const raw = JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf8") || "{}");
    const now = Date.now();
    Object.entries(raw).forEach(([token, session]) => {
      if (session && typeof session.expiresAt === "number" && session.expiresAt > now) {
        sessions.set(token, session);
      }
    });
  } catch (error) {
    // Fichier absent ou corrompu : on repart simplement sans session active.
  }
}

function persistSessions() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const plain = {};
    sessions.forEach((session, token) => { plain[token] = session; });
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(plain, null, 2), "utf8");
  } catch (error) {
    // Non bloquant : la session reste valide en mémoire même si l'écriture échoue.
  }
}

// `role` détermine la durée de la session (voir sessionDurationForRole). Pour
// une session pharmacie "ancien système" (mot de passe simple, pas de compte
// individuel), `userId` est null et `pharmacyId` identifie la pharmacie.
function createSession(userId, role, pharmacyId) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, {
    userId: userId || null,
    role: role || null,
    pharmacyId: pharmacyId || null,
    expiresAt: Date.now() + sessionDurationForRole(role)
  });
  persistSessions();
  return token;
}

function getSession(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    persistSessions();
    return null;
  }
  // Expiration glissante : chaque utilisation prolonge la session (durée
  // selon le rôle : longue pour l'admin, courte pour une pharmacie).
  session.expiresAt = Date.now() + sessionDurationForRole(session.role);
  return session;
}

function destroySession(token) {
  if (sessions.has(token)) {
    sessions.delete(token);
    persistSessions();
  }
}

function parseCookies(request) {
  const header = request.headers.cookie;
  const cookies = {};
  if (!header) return cookies;
  header.split(";").forEach((pair) => {
    const index = pair.indexOf("=");
    if (index === -1) return;
    const key = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    if (key) {
      try {
        cookies[key] = decodeURIComponent(value);
      } catch (error) {
        cookies[key] = value;
      }
    }
  });
  return cookies;
}

function setSessionCookie(response, token, role) {
  const isHttps = process.env.FORCE_HTTPS_COOKIE === "1" || process.env.NODE_ENV === "production";
  const parts = [
    `${SESSION_COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.floor(sessionDurationForRole(role) / 1000)}`
  ];
  if (isHttps) parts.push("Secure");
  response.setHeader("Set-Cookie", parts.join("; "));
}

function clearSessionCookie(response) {
  const isHttps = process.env.FORCE_HTTPS_COOKIE === "1" || process.env.NODE_ENV === "production";
  const parts = [`${SESSION_COOKIE_NAME}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (isHttps) parts.push("Secure");
  response.setHeader("Set-Cookie", parts.join("; "));
}

// Retrouve l'utilisateur courant à partir du cookie de session, ou null.
function getAuthenticatedUser(request) {
  const cookies = parseCookies(request);
  const token = cookies[SESSION_COOKIE_NAME];
  const session = getSession(token);
  if (!session) return null;
  const user = readUsers().find((item) => item.id === session.userId);
  if (!user || user.active === false) return null;
  return user;
}

// Comme getAuthenticatedUser, mais reconnaît aussi une session pharmacie de
// l'ancien système (mot de passe simple, sans compte individuel). Renvoie un
// objet "public" prêt à être envoyé au front, quel que soit le système.
function getAuthenticatedPrincipal(request) {
  const cookies = parseCookies(request);
  const token = cookies[SESSION_COOKIE_NAME];
  const session = getSession(token);
  if (!session) return null;
  if (session.role === "pharmacy_legacy") {
    const pharmacy = readPharmacies().find((item) => item.id === session.pharmacyId);
    if (!pharmacy || pharmacy.active === false) return null;
    return {
      id: `legacy:${pharmacy.id}`,
      role: "pharmacy_legacy",
      pharmacyId: pharmacy.id,
      pharmacyName: pharmacy.name,
      mustChangePassword: pharmacy.mustChangePassword !== false,
      active: true
    };
  }
  const user = readUsers().find((item) => item.id === session.userId);
  if (!user || user.active === false) return null;
  return publicUser(user);
}

// Middleware réutilisable pour les futures routes protégées : vérifie la
// session et, si `roles` est fourni, que le rôle de l'utilisateur en fait
// partie. Envoie lui-même la réponse d'erreur (401/403) et renvoie null si
// l'accès est refusé ; renvoie l'utilisateur (sans mot de passe) sinon.
function requireAuth(request, response, roles) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    sendJson(response, 401, { error: "Non authentifié" });
    return null;
  }
  if (Array.isArray(roles) && roles.length && !roles.includes(user.role)) {
    sendJson(response, 403, { error: "Accès refusé" });
    return null;
  }
  return user;
}

// Vérifie qu'un utilisateur de pharmacie (pharmacy_admin / pharmacy_collaborator)
// agit uniquement sur sa propre pharmacie. Les soguasphar_admin passent toujours.
function requireSamePharmacy(user, pharmacyId) {
  if (!user) return false;
  if (user.role === "soguasphar_admin") return true;
  return Boolean(user.pharmacyId) && String(user.pharmacyId) === String(pharmacyId);
}

loadSessions();

// --- Protection anti-brute-force -------------------------------------------
// Compte les échecs par adresse IP (code admin, login pharmacie, login par
// compte) et bloque temporairement après plusieurs échecs, pour empêcher
// quelqu'un d'essayer des milliers de mots de passe automatiquement.
const BRUTE_FORCE_MAX_ATTEMPTS = 5;
const BRUTE_FORCE_LOCK_MS = 10 * 60 * 1000; // 10 minutes
const failedAttempts = new Map(); // "clé" (type:ip ou type:ip:identifiant) -> { count, lockUntil }

function getClientIp(request) {
  const forwarded = request.headers["x-forwarded-for"];
  if (forwarded) return String(forwarded).split(",")[0].trim();
  return (request.socket && request.socket.remoteAddress) || "inconnu";
}

function isLocked(key) {
  const entry = failedAttempts.get(key);
  return Boolean(entry && entry.lockUntil && entry.lockUntil > Date.now());
}

function registerFailure(key) {
  const entry = failedAttempts.get(key) || { count: 0, lockUntil: 0 };
  entry.count += 1;
  if (entry.count >= BRUTE_FORCE_MAX_ATTEMPTS) {
    entry.lockUntil = Date.now() + BRUTE_FORCE_LOCK_MS;
    entry.count = 0;
  }
  failedAttempts.set(key, entry);
}

function registerSuccess(key) {
  failedAttempts.delete(key);
}

// Vérifie le code admin (header x-admin-code ou paramètre ?code=), avec
// blocage après plusieurs échecs. N'envoie pas la réponse d'erreur : à
// utiliser pour les endpoints où le code est optionnel (accès dégradé).
function isAdminCodeValid(request, providedCode) {
  const provided = providedCode !== undefined ? providedCode : request.headers["x-admin-code"];
  if (!provided) return false;
  const key = `admin:${getClientIp(request)}`;
  if (isLocked(key)) return false;
  if (provided !== ADMIN_CODE) {
    registerFailure(key);
    return false;
  }
  registerSuccess(key);
  return true;
}

// Variante stricte : envoie elle-même la réponse 401/429 et renvoie
// false si l'accès doit être refusé. À utiliser pour les routes admin.
function requireAdminCode(request, response, providedCode) {
  const key = `admin:${getClientIp(request)}`;
  if (isLocked(key)) {
    sendJson(response, 429, { error: "Trop de tentatives avec un code incorrect. Réessayez dans quelques minutes." });
    return false;
  }
  if (!isAdminCodeValid(request, providedCode)) {
    sendJson(response, 401, { error: "Code administrateur incorrect" });
    return false;
  }
  return true;
}

function defaultValidation() {
  return {
    title: "",
    description: "",
    draft: false,
    archived: false,
    documents: []
  };
}

function normalizeValidationDocument(document, index = 0) {
  return {
    id: String(document.id || `validation-document-${Date.now()}-${index}`),
    pharmacyId: String(document.pharmacyId || "").trim(),
    pharmacyName: String(document.pharmacyName || "").trim(),
    matched: Boolean(document.matched),
    fileName: String(document.fileName || "").trim(),
    fileType: String(document.fileType || "application/octet-stream").trim(),
    url: String(document.url || ""),
    thumbnailUrl: String(document.thumbnailUrl || ""),
    importedAt: String(document.importedAt || new Date().toLocaleString("fr-FR"))
  };
}

function readValidation() {
  if (!fs.existsSync(VALIDATION_FILE)) return defaultValidation();
  const validation = JSON.parse(fs.readFileSync(VALIDATION_FILE, "utf8") || "{}");
  return {
    ...defaultValidation(),
    ...validation,
    documents: Array.isArray(validation.documents)
      ? validation.documents.map(normalizeValidationDocument).filter((document) => document.id && document.fileName && document.url)
      : []
  };
}

function writeValidation(validation) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const payload = {
    title: String(validation.title || "").trim(),
    description: String(validation.description || "").trim(),
    draft: Boolean(validation.draft),
    archived: Boolean(validation.archived),
    documents: Array.isArray(validation.documents)
      ? validation.documents.map(normalizeValidationDocument).filter((document) => document.id && document.fileName && document.url)
      : []
  };
  fs.writeFileSync(VALIDATION_FILE, JSON.stringify(payload, null, 2), "utf8");
  return payload;
}

function readValidationResponses() {
  if (!fs.existsSync(VALIDATION_RESPONSES_FILE)) return [];
  return JSON.parse(fs.readFileSync(VALIDATION_RESPONSES_FILE, "utf8") || "[]");
}

function writeValidationResponses(responses) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(VALIDATION_RESPONSES_FILE, JSON.stringify(responses, null, 2), "utf8");
}

// --- Attestation d'engagement (module séparé de "Validation" : une seule
// campagne active à la fois là-bas, et elle est déjà occupée par les BAT
// calendriers 2027). "documents" = la fiche pré-remplie par pharmacie
// (préparée par l'admin, à partir des infos connues : SIREN, titulaire...).
// Les réponses (attestation-responses.json) = ce que chaque pharmacie a
// confirmé/complété + sa photo de signature/cachet + le PDF final généré.
function defaultAttestation() {
  return {
    title: "",
    year: new Date().getFullYear(),
    description: "",
    cotisationHT: 0,
    echeances: [],
    draft: true,
    archived: false,
    documents: []
  };
}

function normalizeAttestationDocument(document, index = 0) {
  return {
    id: String(document.id || `attestation-document-${Date.now()}-${index}`),
    pharmacyId: String(document.pharmacyId || "").trim(),
    pharmacyName: String(document.pharmacyName || "").trim(),
    societeExploitante: String(document.societeExploitante || "").trim(),
    siren: String(document.siren || "").trim(),
    siret: String(document.siret || "").trim(),
    representant: String(document.representant || "").trim(),
    qualite: String(document.qualite || "Titulaire").trim(),
    adresse: String(document.adresse || "").trim(),
    cp: String(document.cp || "").trim(),
    ville: String(document.ville || "").trim(),
    tel: String(document.tel || "").trim(),
    mailTitulaire: String(document.mailTitulaire || "").trim()
  };
}

function readAttestation() {
  if (!fs.existsSync(ATTESTATIONS_FILE)) return defaultAttestation();
  const attestation = JSON.parse(fs.readFileSync(ATTESTATIONS_FILE, "utf8") || "{}");
  return {
    ...defaultAttestation(),
    ...attestation,
    documents: Array.isArray(attestation.documents)
      ? attestation.documents.map(normalizeAttestationDocument).filter((document) => document.pharmacyId)
      : []
  };
}

function writeAttestation(attestation) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const payload = {
    title: String(attestation.title || "").trim(),
    year: Number(attestation.year) || new Date().getFullYear(),
    description: String(attestation.description || "").trim(),
    cotisationHT: Number(attestation.cotisationHT) || 0,
    echeances: Array.isArray(attestation.echeances)
      ? attestation.echeances.map((item) => ({
          label: String(item.label || "").trim(),
          montantHT: Number(item.montantHT) || 0
        }))
      : [],
    draft: Boolean(attestation.draft),
    archived: Boolean(attestation.archived),
    documents: Array.isArray(attestation.documents)
      ? attestation.documents.map(normalizeAttestationDocument).filter((document) => document.pharmacyId)
      : []
  };
  fs.writeFileSync(ATTESTATIONS_FILE, JSON.stringify(payload, null, 2), "utf8");
  return payload;
}

function normalizeAttestationResponse(item = {}) {
  return {
    id: String(item.id || `attestation-response-${Date.now()}`),
    documentId: String(item.documentId || "").trim(),
    pharmacyId: String(item.pharmacyId || "").trim(),
    pharmacyName: String(item.pharmacyName || "").trim(),
    societeExploitante: String(item.societeExploitante || "").trim(),
    siren: String(item.siren || "").trim(),
    representant: String(item.representant || "").trim(),
    qualite: String(item.qualite || "").trim(),
    faitA: String(item.faitA || "").trim(),
    signedAt: String(item.signedAt || ""),
    pdfUrl: String(item.pdfUrl || ""),
    createdAt: String(item.createdAt || new Date().toLocaleString("fr-FR")),
    updatedAt: String(item.updatedAt || new Date().toLocaleString("fr-FR"))
  };
}

function readAttestationResponses() {
  if (!fs.existsSync(ATTESTATION_RESPONSES_FILE)) return [];
  const responses = JSON.parse(fs.readFileSync(ATTESTATION_RESPONSES_FILE, "utf8") || "[]");
  return Array.isArray(responses) ? responses.map(normalizeAttestationResponse) : [];
}

function writeAttestationResponses(responses) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(ATTESTATION_RESPONSES_FILE, JSON.stringify(responses, null, 2), "utf8");
}

// Logo SOGUASPHAR affiché en en-tête du PDF de l'attestation (même fichier que
// celui déjà utilisé ailleurs dans l'app). Lu une seule fois et mis en cache en
// base64 (intégré directement dans le HTML : le service de conversion ne sait
// pas résoudre un chemin de fichier local).
let attestationLogoDataUrl = "";
function getAttestationLogoDataUrl() {
  if (attestationLogoDataUrl) return attestationLogoDataUrl;
  try {
    const logoPath = path.join(__dirname, "logo-soguasphar.png");
    const base64 = fs.readFileSync(logoPath).toString("base64");
    attestationLogoDataUrl = `data:image/png;base64,${base64}`;
  } catch {
    attestationLogoDataUrl = "";
  }
  return attestationLogoDataUrl;
}

// Construit le HTML du document final (texte pré-rempli + photo du tampon et
// de la signature) envoyé au service commun sogua-connectors (/html-to-pdf).
// Calqué sur le modèle exact fourni par Hélène (certificat 2027.pdf) : même
// texte, même structure, logo SOGUASPHAR ajouté en en-tête.
function buildAttestationHtml(doc, response, signatureDataUrl) {
  const esc = (value) => String(value || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const year = Number(doc.year) || new Date().getFullYear();
  const formatEuros = (value) => Number(value || 0).toLocaleString("fr-FR");
  const echeancesHtml = (doc.echeances || [])
    .map((item) => `<li>${formatEuros(item.montantHT)} € HT le ${esc(item.label)}</li>`)
    .join("");
  const logoDataUrl = getAttestationLogoDataUrl();
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><style>
  body { font-family: "Calibri", "Helvetica", Arial, sans-serif; font-size: 12.5px; color: #1a1a1a; line-height: 1.42; padding: 28px 40px; }
  .letterhead { text-align: center; margin-bottom: 16px; }
  .letterhead img { max-height: 75px; }
  h1 { font-size: 19px; text-align: left; margin: 0 0 8px; }
  h2 { font-size: 13px; text-align: center; margin: 0 0 14px; font-weight: bold; }
  .field { margin: 2px 0; }
  h3 { font-size: 13px; margin-top: 14px; margin-bottom: 6px; }
  p { margin: 8px 0; }
  ul { margin: 4px 0; padding-left: 22px; }
  li { margin: 4px 0; }
  .signature-box { margin-top: 18px; }
  .signature-box img { max-width: 260px; max-height: 160px; border: 1px solid #ddd; margin-top: 6px; display: block; }
</style></head>
<body>
  ${logoDataUrl ? `<div class="letterhead"><img src="${logoDataUrl}" alt="SOGUASPHAR"></div>` : ""}
  <h1>ATTESTATION D'ADHÉSION, D'ENGAGEMENT ET DE MANDAT</h1>
  <h2>ANNÉE ${year}</h2>

  <div class="field"><b>Pharmacie :</b> ${esc(doc.pharmacyName)}</div>
  <div class="field"><b>Société exploitante :</b> ${esc(response.societeExploitante || doc.societeExploitante)}</div>
  <div class="field"><b>SIREN :</b> ${esc(response.siren || doc.siren)}</div>
  <div class="field"><b>Représentée par :</b> ${esc(response.representant || doc.representant)}</div>
  <div class="field"><b>En qualité de :</b> ${esc(response.qualite || doc.qualite)}</div>

  <p>Je confirme l'adhésion de la pharmacie au groupement <b>SOGUASPHAR pour la période du 1er janvier au 31 décembre ${year} inclus</b>.</p>
  <p>Pendant cette période, je m'engage à ne pas adhérer à un autre groupement de pharmacies négociant des accords commerciaux concurrents portant sur les mêmes laboratoires ou fournisseurs.</p>

  <h3><b>Mandat de négociation</b></h3>
  <p>Je donne mandat à SOGUASPHAR pour me représenter et négocier, en mon nom et pour mon compte, les accords commerciaux avec les laboratoires, fournisseurs, grossistes-répartiteurs et partenaires.</p>
  <p>Ce mandat autorise notamment SOGUASPHAR à négocier les remises, RFA, bonus, objectifs, paliers, budgets, prestations de services et autres avantages commerciaux, ainsi qu'à assurer leur suivi et leur contrôle.</p>
  <p>Sauf mandat spécifique, SOGUASPHAR ne peut pas passer de commande ni engager directement une dépense au nom de la pharmacie.</p>

  <h3><b>Données chiffrées</b></h3>
  <p>J'autorise SOGUASPHAR à recueillir, recevoir, centraliser et analyser les données nécessaires aux négociations et au suivi des accords commerciaux, notamment :</p>
  <ul>
    <li>les achats et les ventes ;</li>
    <li>les chiffres d'affaires et les volumes ;</li>
    <li>les données de sell-out ;</li>
    <li>les parts de marché et taux de pénétration ;</li>
    <li>les objectifs, remises, bonus et RFA.</li>
  </ul>
  <p>Ces informations pourront être obtenues auprès de la pharmacie, de son LGO, de SOGUASTAT, des grossistes, laboratoires, fournisseurs et partenaires.</p>
  <p>J'autorise expressément ces organismes à transmettre directement ces informations à SOGUASPHAR. Elles seront utilisées uniquement pour la négociation, le pilotage des accords, le contrôle des objectifs et le calcul des rémunérations.</p>
  <p>SOGUASPHAR s'engage à préserver la confidentialité des données individuelles de la pharmacie.</p>

  <h3><b>Cotisation et règlements</b></h3>
  <p>Je m'engage à régler la cotisation annuelle de <b>${formatEuros(doc.cotisationHT)} € HT</b>, par prélèvement automatique en deux échéances :</p>
  <ul>${echeancesHtml}</ul>
  <p>J'autorise également le prélèvement automatique des factures émises par SOGUASPHAR selon les échéances indiquées.</p>

  <h3><b>RFA et avantages commerciaux</b></h3>
  <p>J'autorise les laboratoires et fournisseurs à verser directement à SOGUASPHAR les prestations de services, RFA, bonus et autres rémunérations négociées.</p>
  <p>Les reversements éventuellement dus à la pharmacie restent soumis :</p>
  <ul>
    <li>au paiement effectif des sommes par le partenaire ;</li>
    <li>au respect des objectifs et conditions prévus ;</li>
    <li>au règlement des sommes dues à SOGUASPHAR.</li>
  </ul>

  <h3><b>Engagements de la pharmacie</b></h3>
  <p>Je m'engage à :</p>
  <ul>
    <li>respecter les conditions des accords auxquels la pharmacie participe ;</li>
    <li>transmettre des informations exactes et actualisées ;</li>
    <li>ne pas rétrocéder à une pharmacie non adhérente les produits achetés auprès de la centrale SOGUASPHAR ;</li>
    <li>ne pas divulguer les contrats, conditions commerciales et informations confidentielles du Groupement.</li>
  </ul>
  <p>Tout manquement pourra entraîner, après information de la pharmacie, la suspension de certains avantages ou l'exclusion du Groupement.</p>

  <h3><b>Départ et changement d'exploitant</b></h3>
  <p>Toute demande de départ devra être adressée par écrit à SOGUASPHAR avant le <b>30 septembre ${year}</b> et prendra effet au <b>31 décembre ${year}</b>.</p>
  <p>Les obligations de la pharmacie et la cotisation annuelle resteront applicables jusqu'à cette date.</p>
  <p>En cas de cession de l'officine ou de changement d'exploitant en cours d'année, aucuns frais supplémentaires d'adhésion ne seront facturés. Le nouvel exploitant devra cependant signer une nouvelle attestation pour confirmer la poursuite de l'adhésion.</p>
  <p>Les associés investisseurs n'exerçant pas au sein de la pharmacie ne disposent d'aucun droit automatique de participation à la vie du Groupement.</p>

  <p class="field"><b>Fait à :</b> ${esc(response.faitA)}</p>
  <p class="field"><b>Le :</b> ${esc(response.signedAt)}</p>

  <div class="signature-box">
    <p><b>Pour la pharmacie</b></p>
    <p>Mention manuscrite :<br><b>« Lu et approuvé – Bon pour adhésion, engagement et mandat pour l'année ${year} »</b></p>
    <p>Signature et cachet :</p>
    ${signatureDataUrl ? `<img src="${signatureDataUrl}" alt="Signature et cachet">` : ""}
  </div>

  <div class="signature-box">
    <p><b>Pour SOGUASPHAR</b></p>
    <p>Mention : <b>« Mandat accepté »</b></p>
    <p>Signature et cachet :</p>
  </div>
</body></html>`;
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 80_000_000) {
        request.destroy();
        reject(new Error("Payload trop volumineux"));
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": MIME_TYPES[".json"],
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  });
  response.end(JSON.stringify(payload));
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeLookup(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'`´]/g, " ")
    .replace(/[^a-z0-9]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function responseMatchesCampaign(response, campaignId) {
  if (!campaignId) return true;
  if (response.campaignId === campaignId) return true;
  if (!response.campaignId && campaignId === "herboristerie") return true;
  const campaign = readOrders().find((order) => order.id === campaignId);
  return campaign && normalizeLookup(response.campaignTitle) === normalizeLookup(campaign.title);
}

function normalizePollAnswerValue(value) {
  if (Array.isArray(value)) {
    const cleaned = value.map((item) => String(item || "").trim()).filter(Boolean);
    return cleaned.length ? cleaned : null;
  }
  const text = String(value || "").trim();
  return text || null;
}

function normalizePollAnswersMap(answers) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) return {};
  const normalized = {};
  Object.keys(answers).forEach((key) => {
    const value = normalizePollAnswerValue(answers[key]);
    if (value) normalized[String(key)] = value;
  });
  return normalized;
}

function pollQuestionListMeta(poll) {
  if (poll && Array.isArray(poll.questions) && poll.questions.length) {
    return poll.questions.map((item, index) => ({
      id: item.id || `question-${index + 1}`,
      label: item.label || poll.question || ""
    }));
  }
  return [{ id: "main", label: poll?.question || "" }];
}

function isPresenceQuestionMeta(question) {
  const text = `${question.id} ${question.label}`.toLowerCase();
  return text.includes("presence") || text.includes("présence");
}

function isMealQuestionMeta(question) {
  const text = `${question.id} ${question.label}`.toLowerCase();
  return text.includes("plat") || text.includes("repas") || text.includes("menu");
}

function isAbsenceAnswerText(value) {
  const text = Array.isArray(value) ? value.join(" ") : String(value || "");
  return /\bnon\b/i.test(text);
}

// Si la personne a répondu "non présent(e)" à la question de présence, on retire
// automatiquement le choix de repas de sa réponse (elle ne doit pas être comptée
// pour un repas si elle ne vient pas).
function stripMealAnswerIfAbsent(poll, answers) {
  if (!poll || !answers) return answers;
  const questionList = pollQuestionListMeta(poll);
  const presenceQuestion = questionList.find(isPresenceQuestionMeta);
  const mealQuestions = questionList.filter(isMealQuestionMeta);
  if (!presenceQuestion || !mealQuestions.length) return answers;
  const presenceAnswer = answers[presenceQuestion.id];
  if (presenceAnswer === undefined || !isAbsenceAnswerText(presenceAnswer)) return answers;
  const cleaned = { ...answers };
  mealQuestions.forEach((mealQuestion) => { delete cleaned[mealQuestion.id]; });
  return cleaned;
}

function pollAnswersToTextMeta(poll, answers) {
  const questionList = pollQuestionListMeta(poll);
  if (!answers) return "";
  const format = (value) => (Array.isArray(value) ? value.join(", ") : value || "");
  if (questionList.length <= 1) return format(answers[questionList[0]?.id]);
  return questionList
    .filter((question) => answers[question.id] !== undefined)
    .map((question) => `${question.label} : ${format(answers[question.id])}`)
    .join(" | ");
}

function responseMatchesPoll(response, pollId) {
  if (!pollId) return true;
  if (response.pollId === pollId) return true;
  const poll = readPolls().find((item) => item.id === pollId);
  return poll && normalizeLookup(response.pollQuestion) === normalizeLookup(poll.question);
}

function responseMatchesInfoForm(response, formId) {
  if (!formId) return true;
  if (response.formId === formId) return true;
  const infoForm = readInfoForms().find((item) => item.id === formId);
  return infoForm && normalizeLookup(response.formTitle) === normalizeLookup(infoForm.title);
}

function responsePharmacyOwnerKey(response, pharmacies = readPharmacies()) {
  const responseId = String(response?.pharmacyId || "").trim();
  const responseName = normalizeLookup(response?.pharmacyName);
  const matchedPharmacy = pharmacies.find((pharmacy) => {
    if (!pharmacy || pharmacy.active === false) return false;
    const pharmacyId = String(pharmacy.id || "").trim();
    const pharmacyName = normalizeLookup(pharmacy.name);
    return (responseId && pharmacyId && responseId === pharmacyId)
      || (responseName && pharmacyName && responseName === pharmacyName);
  });

  if (matchedPharmacy?.id) return `id:${String(matchedPharmacy.id).trim()}`;
  if (responseId) return `id:${responseId}`;
  return `name:${responseName}`;
}

function responseOwnerKey(response, pharmacies = readPharmacies()) {
  return `${response.campaignId || "herboristerie"}|${response.periodId || ""}|${responsePharmacyOwnerKey(response, pharmacies)}`;
}

function responseMatchesPeriod(response, periodId) {
  if (!periodId) return true;
  return String(response.periodId || "") === String(periodId);
}

function latestResponses(responses = []) {
  const pharmacies = readPharmacies();
  const byOwner = new Map();
  responses.forEach((item) => {
    const key = responseOwnerKey(item, pharmacies);
    const previous = byOwner.get(key);
    if (!previous) {
      byOwner.set(key, item);
      return;
    }

    const previousDate = Date.parse(previous.updatedAt || previous.createdAt || "") || 0;
    const nextDate = Date.parse(item.updatedAt || item.createdAt || "") || 0;
    if (nextDate >= previousDate) byOwner.set(key, item);
  });
  return [...byOwner.values()];
}

function pollResponseOwnerKey(response, pharmacies = readPharmacies()) {
  return `${response.pollId || ""}|${responsePharmacyOwnerKey(response, pharmacies)}`;
}

function latestPollResponses(responses = []) {
  const pharmacies = readPharmacies();
  const byOwner = new Map();
  responses.forEach((item) => {
    const key = pollResponseOwnerKey(item, pharmacies);
    const previous = byOwner.get(key);
    if (!previous) {
      byOwner.set(key, item);
      return;
    }

    const previousDate = Date.parse(previous.updatedAt || previous.createdAt || "") || 0;
    const nextDate = Date.parse(item.updatedAt || item.createdAt || "") || 0;
    if (nextDate >= previousDate) byOwner.set(key, item);
  });
  return [...byOwner.values()];
}

function infoResponseOwnerKey(response, pharmacies = readPharmacies()) {
  return `${response.formId || ""}|${responsePharmacyOwnerKey(response, pharmacies)}`;
}

function latestInfoResponses(responses = []) {
  const pharmacies = readPharmacies();
  const byOwner = new Map();
  responses.forEach((item) => {
    const key = infoResponseOwnerKey(item, pharmacies);
    const previous = byOwner.get(key);
    if (!previous) {
      byOwner.set(key, item);
      return;
    }

    const previousDate = Date.parse(previous.updatedAt || previous.createdAt || "") || 0;
    const nextDate = Date.parse(item.updatedAt || item.createdAt || "") || 0;
    if (nextDate >= previousDate) byOwner.set(key, item);
  });
  return [...byOwner.values()];
}

function validationResponseOwnerKey(response, pharmacies = readPharmacies()) {
  return responsePharmacyOwnerKey(response, pharmacies);
}

function normalizeValidationResponse(item) {
  return {
    id: String(item.id || Date.now()),
    validationId: String(item.validationId || "document-validation"),
    documentId: String(item.documentId || "").trim(),
    documentUrl: "",
    createdAt: String(item.createdAt || new Date().toLocaleString("fr-FR")),
    updatedAt: String(item.updatedAt || ""),
    pharmacyId: String(item.pharmacyId || "").trim(),
    pharmacyName: String(item.pharmacyName || "").trim(),
    status: String(item.status || "").trim(),
    comment: String(item.comment || "").trim()
  };
}

function publicValidationResponse(item) {
  return {
    id: String(item.id || ""),
    validationId: String(item.validationId || ""),
    documentId: String(item.documentId || ""),
    createdAt: String(item.createdAt || ""),
    updatedAt: String(item.updatedAt || ""),
    pharmacyId: String(item.pharmacyId || ""),
    pharmacyName: String(item.pharmacyName || ""),
    status: String(item.status || ""),
    comment: String(item.comment || "")
  };
}

function publicValidationResponses(responses = []) {
  return responses.map(publicValidationResponse);
}

function latestValidationResponses(responses = []) {
  const pharmacies = readPharmacies();
  const byOwner = new Map();
  responses.forEach((item) => {
    const key = validationResponseOwnerKey(item, pharmacies);
    const previous = byOwner.get(key);
    if (!previous) {
      byOwner.set(key, item);
      return;
    }

    const previousDate = Date.parse(previous.updatedAt || previous.createdAt || "") || 0;
    const nextDate = Date.parse(item.updatedAt || item.createdAt || "") || 0;
    if (nextDate >= previousDate) byOwner.set(key, item);
  });
  return [...byOwner.values()];
}

function compactLookup(value) {
  return normalizeLookup(value).replace(/\s+/g, "");
}

function namesMatch(firstName, secondName) {
  const first = normalizeLookup(firstName);
  const second = normalizeLookup(secondName);
  if (!first || !second) return false;
  return first === second || compactLookup(first) === compactLookup(second);
}

function activePharmacies(pharmacies = readPharmacies()) {
  return pharmacies.filter((pharmacy) => pharmacy && pharmacy.active !== false && pharmacy.name);
}

function responseMatchesPharmacyRecord(response, pharmacy) {
  const responseId = String(response?.pharmacyId || "").trim();
  const pharmacyId = String(pharmacy?.id || "").trim();
  return (responseId && pharmacyId && responseId === pharmacyId)
    || namesMatch(response?.pharmacyName, pharmacy?.name);
}

function validationDocumentsForActivePharmacies(validation, pharmacies = readPharmacies()) {
  const active = activePharmacies(pharmacies);
  return (validation.documents || []).filter((document) => active
    .some((pharmacy) => namesMatch(pharmacy.name, document.pharmacyName)));
}

function validationResponseForDocument(document, responses, pharmacies = readPharmacies()) {
  const reversed = [...responses].reverse();
  const exact = reversed.find((item) => item.documentId && item.documentId === document.id);
  if (exact) return exact;

  const byUrl = reversed.find((item) => item.documentUrl && item.documentUrl === document.url);
  if (byUrl) return byUrl;

  const pharmacy = activePharmacies(pharmacies)
    .find((item) => namesMatch(item.name, document.pharmacyName));
  if (pharmacy) {
    const byPharmacy = reversed.find((item) => responseMatchesPharmacyRecord(item, pharmacy));
    if (byPharmacy) return byPharmacy;
  }

  return reversed.find((item) => namesMatch(item.pharmacyName, document.pharmacyName)) || null;
}

function normalizeValidationStatusForSummary(status) {
  const clean = normalizeLookup(String(status || "").replace(/^BAT\s+/i, ""));
  if (clean === "valide") return "Validé";
  if (clean === "correction demandee") return "Correction demandée";
  return String(status || "").trim();
}

function validationSummary() {
  const validation = readValidation();
  const pharmacies = readPharmacies();
  const active = activePharmacies(pharmacies);
  const responses = latestValidationResponses(readValidationResponses());
  const documents = validationDocumentsForActivePharmacies(validation, pharmacies);
  const unmatchedDocuments = (validation.documents || []).filter((document) => !document.matched);
  const rows = documents.map((document) => {
    const response = validationResponseForDocument(document, responses, pharmacies);
    return {
      documentId: document.id,
      pharmacyName: document.pharmacyName,
      fileName: document.fileName || "",
      status: normalizeValidationStatusForSummary(response?.status),
      comment: response?.comment || "",
      createdAt: response?.createdAt || "",
      updatedAt: response?.updatedAt || "",
      answered: Boolean(response)
    };
  });
  const documentedKeys = new Set((validation.documents || [])
    .filter((document) => document.matched)
    .map((document) => normalizeLookup(document.pharmacyName)));
  const missingDocuments = active
    .map((pharmacy) => pharmacy.name)
    .filter((name) => ![...documentedKeys].some((key) => namesMatch(key, name)))
    .sort((a, b) => a.localeCompare(b, "fr"));
  const validated = rows
    .filter((row) => row.status === "Validé")
    .map((row) => row.pharmacyName)
    .sort((a, b) => a.localeCompare(b, "fr"));
  const correctionDetails = rows
    .filter((row) => row.status === "Correction demandée")
    .map((row) => ({ pharmacyName: row.pharmacyName, comment: row.comment }))
    .sort((a, b) => a.pharmacyName.localeCompare(b.pharmacyName, "fr"));
  const unanswered = rows
    .filter((row) => !row.answered)
    .map((row) => row.pharmacyName)
    .sort((a, b) => a.localeCompare(b, "fr"));

  return {
    title: validation.title || "",
    archived: Boolean(validation.archived),
    documentCount: (validation.documents || []).length,
    matchedCount: documents.length,
    unmatchedCount: unmatchedDocuments.length,
    responseCount: rows.filter((row) => row.answered).length,
    validatedCount: validated.length,
    correctionCount: correctionDetails.length,
    unansweredCount: unanswered.length,
    missingDocumentCount: missingDocuments.length,
    validated,
    correctionDetails,
    unanswered,
    missingDocuments,
    rows
  };
}

function normalizeProfileHours(hours) {
  return Array.isArray(hours) ? hours.map((row) => ({
    day: String(row.day || "").trim(),
    closed: Boolean(row.closed),
    split: Boolean(row.split),
    open: String(row.open || "").trim(),
    close: String(row.close || "").trim(),
    morningOpen: String(row.morningOpen || "").trim(),
    morningClose: String(row.morningClose || "").trim(),
    afternoonOpen: String(row.afternoonOpen || "").trim(),
    afternoonClose: String(row.afternoonClose || "").trim()
  })).filter((row) => row.day) : [];
}

function normalizeInfoResponse(item) {
  return {
    id: String(item.id || Date.now()),
    formId: String(item.formId || "fiche-pharmacie-2026"),
    formTitle: String(item.formTitle || "Mise à jour du site internet SOGUASPHAR : informations pharmacies").trim(),
    createdAt: String(item.createdAt || new Date().toLocaleString("fr-FR")),
    updatedAt: String(item.updatedAt || ""),
    pharmacyId: String(item.pharmacyId || "").trim(),
    pharmacyName: String(item.pharmacyName || "").trim(),
    address: String(item.address || "").trim(),
    postalCode: String(item.postalCode || "").trim(),
    city: String(item.city || "").trim(),
    phone: String(item.phone || "").trim(),
    ownerEmail: String(item.ownerEmail || item.email || "").trim(),
    teamEmail: String(item.teamEmail || "").trim(),
    facebook: String(item.facebook || "").trim(),
    instagram: String(item.instagram || "").trim(),
    linkedin: String(item.linkedin || "").trim(),
    tiktok: String(item.tiktok || "").trim(),
    website: String(item.website || "").trim(),
    hours: normalizeProfileHours(item.hours),
    services: Array.isArray(item.services) ? item.services.map((service) => String(service || "").trim()).filter(Boolean) : [],
    otherServices: String(item.otherServices || "").trim(),
    notes: String(item.notes || "").trim()
  };
}

function parseColisageMinimum(value) {
  const match = String(value || "").replace(",", ".").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function colisageErrorMessage(minimum) {
  return minimum ? `Veuillez inscrire au minimum le colisage indiqué (${minimum} unités).` : "Inscrire le colisage minimum.";
}

// --- Colonnes libres pour les bons de commande -----------------------------
//
// Avant : un bon de commande était une liste fixe {id, designation, cip, tarif,
// colisage, colisagePresentoir}. Maintenant : {columns, colisageColumn, rows}
// où `columns` sont les en-têtes EXACTES du fichier importé (dans l'ordre),
// `colisageColumn` est le nom de la colonne choisie par l'admin comme colisage
// minimum (ou null), et `rows` sont des lignes {id, values: {<colonne>: <valeur>}}.
//
// Les fichiers data/orders.json, data/responses.json, data/order-template.json
// peuvent encore contenir l'ancienne forme (créée avant cette évolution). Choix
// retenu : on migre EN MÉMOIRE à chaque lecture, sans jamais réécrire ces
// fichiers tant que l'admin n'enregistre pas lui-même une modification. C'est
// l'option la plus sûre : aucune donnée n'est modifiée sur disque par cette
// migration, donc aucun risque de perte si la migration a un bug.
const LEGACY_TEMPLATE_COLUMNS = ["Désignation", "CIP", "Tarif", "Colisage minimum de commande", "Colisage présentoir"];
const LEGACY_COLISAGE_COLUMN = "Colisage minimum de commande";

function legacyProductKey(product) {
  return String(product?.cip || product?.designation || product?.product || product?.id || "").trim().toLowerCase();
}

function migrateLegacyTemplateRows(rows) {
  return (Array.isArray(rows) ? rows : []).map((row, index) => ({
    id: String(row.id || `row-legacy-${index}`),
    values: {
      "Désignation": String(row.designation || row.product || "").trim(),
      "CIP": String(row.cip || "").trim(),
      "Tarif": String(row.tarif || "").trim(),
      "Colisage minimum de commande": String(row.colisage || "").trim(),
      "Colisage présentoir": String(row.colisagePresentoir || "").trim()
    }
  }));
}

// Convertit n'importe quelle forme de template (ancienne liste plate, nouvelle
// forme déjà correcte, ou valeur absente/invalide) vers la forme canonique
// {columns, colisageColumn, rows}.
function normalizeTemplate(template) {
  if (Array.isArray(template)) {
    return {
      columns: LEGACY_TEMPLATE_COLUMNS.slice(),
      colisageColumn: LEGACY_COLISAGE_COLUMN,
      rows: migrateLegacyTemplateRows(template)
    };
  }

  if (template && typeof template === "object") {
    const columns = Array.isArray(template.columns)
      ? template.columns.map((column) => String(column || "").trim()).filter(Boolean)
      : [];
    const colisageColumn = template.colisageColumn && columns.includes(template.colisageColumn)
      ? template.colisageColumn
      : null;
    const rows = Array.isArray(template.rows) ? template.rows.map((row, index) => ({
      id: String(row.id || `row-${index}`),
      values: columns.reduce((values, column) => {
        values[column] = String(row.values?.[column] ?? "").trim();
        return values;
      }, {})
    })) : [];
    return { columns, colisageColumn, rows };
  }

  return { columns: [], colisageColumn: null, rows: [] };
}

// Convertit une ancienne ligne de réponse plate {designation,cip,tarif,colisage,
// colisagePresentoir,quantity} vers la nouvelle forme {rowId, values, quantity},
// en retrouvant la ligne du template correspondante par CIP/désignation.
function migrateLegacyProduct(product, templateRows, index) {
  const values = {
    "Désignation": String(product.designation || product.product || "").trim(),
    "CIP": String(product.cip || "").trim(),
    "Tarif": String(product.tarif || "").trim(),
    "Colisage minimum de commande": String(product.colisage || "").trim(),
    "Colisage présentoir": String(product.colisagePresentoir || "").trim()
  };
  const key = legacyProductKey(product);
  const matchedRow = key && templateRows.find((row) => {
    const rowKey = String(row.values?.["CIP"] || row.values?.["Désignation"] || "").trim().toLowerCase();
    return rowKey && rowKey === key;
  });

  return {
    rowId: matchedRow ? matchedRow.id : `row-legacy-${index}`,
    values,
    quantity: String(product.quantity || "").trim()
  };
}

// Logique de normalisation partagée, prenant un template DÉJÀ normalisé en
// paramètre (voir normalizeResponseProducts et readResponses ci-dessous). Séparée
// ainsi pour ne pas relire/reparser orders.json à chaque réponse quand on traite
// une liste entière (ex. readResponses), ce qui serait coûteux si orders.json est
// volumineux (images encodées en base64 dans les campagnes).
function normalizeResponseProductsWithTemplate(products, template) {
  const rows = Array.isArray(template?.rows) ? template.rows : [];
  const list = Array.isArray(products) ? products : [];

  return list.map((product, index) => {
    if (product && typeof product === "object" && product.rowId !== undefined && product.values && typeof product.values === "object") {
      const templateRow = rows.find((row) => row.id === String(product.rowId));
      // On garde en priorité les valeurs transmises par la pharmacie (la réponse
      // garde sa propre "photo" du produit au moment où elle a répondu), et on
      // complète seulement les colonnes manquantes avec le template actuel.
      const values = { ...(templateRow ? templateRow.values : {}), ...product.values };
      const cleanValues = {};
      Object.keys(values).forEach((key) => { cleanValues[key] = String(values[key] ?? "").trim(); });
      return {
        rowId: String(product.rowId),
        values: cleanValues,
        quantity: String(product.quantity || "").trim()
      };
    }

    return migrateLegacyProduct(product, rows, index);
  });
}

function normalizeResponseProducts(products, campaignId) {
  const campaign = readOrders().find((order) => order.id === campaignId);
  const template = campaign ? normalizeTemplate(campaign.template) : { rows: [] };
  return normalizeResponseProductsWithTemplate(products, template);
}

function colisageColumnForCampaign(campaignId) {
  const campaign = readOrders().find((order) => order.id === campaignId);
  return campaign ? normalizeTemplate(campaign.template).colisageColumn : null;
}

function validateProductsAgainstColisage(products = [], colisageColumn) {
  if (!colisageColumn) return "";
  const invalidProduct = products.find((product) => {
    const quantity = Number(String(product.quantity || "").replace(",", "."));
    const minimum = parseColisageMinimum(product.values?.[colisageColumn]);
    return quantity > 0 && minimum > 0 && quantity < minimum;
  });

  return invalidProduct ? colisageErrorMessage(parseColisageMinimum(invalidProduct.values?.[colisageColumn])) : "";
}

function rowsForExport(responses) {
  return latestResponses(responses).flatMap((item) => {
    if (!item.products || !item.products.length) {
      return [{ ...item, values: {}, quantity: "" }];
    }

    return item.products.map((product) => ({
      ...item,
      values: product.values || {},
      quantity: product.quantity
    }));
  });
}

// Les colonnes produit ne sont plus fixes : on prend l'union des colonnes
// rencontrées dans les lignes à exporter, dans l'ordre de première apparition.
// Séparée de sendExcel pour pouvoir aussi générer ce tableau en pièce jointe
// d'e-mail (clôture d'une opération), sans passer par une réponse HTTP.
function buildDispatchWorkbookHtml(responses) {
  const rows = rowsForExport(responses);
  const productColumns = [];
  rows.forEach((row) => {
    Object.keys(row.values || {}).forEach((column) => {
      if (!productColumns.includes(column)) productColumns.push(column);
    });
  });

  const headings = ["Date", "Modifié le", "Pharmacie", "Statut", ...productColumns, "Quantité", "Commentaire"];
  const bodyRows = rows.map((row) => `
    <tr>
      <td>${escapeHtml(row.createdAt)}</td>
      <td>${escapeHtml(row.updatedAt || "")}</td>
      <td>${escapeHtml(row.pharmacyName)}</td>
      <td>${escapeHtml(row.interest)}</td>
      ${productColumns.map((column) => `<td>${escapeHtml(row.values[column] || "")}</td>`).join("")}
      <td>${escapeHtml(row.quantity)}</td>
      <td>${escapeHtml(row.notes)}</td>
    </tr>
  `).join("");

  return `
    <html>
      <head><meta charset="utf-8"></head>
      <body>
        <table border="1">
          <thead><tr>${headings.map((heading) => `<th>${heading}</th>`).join("")}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </body>
    </html>
  `;
}

function sendExcel(response, responses) {
  const workbook = buildDispatchWorkbookHtml(responses);
  response.writeHead(200, {
    "Content-Type": "application/vnd.ms-excel; charset=utf-8",
    "Content-Disposition": `attachment; filename="recap-soguasphar-${new Date().toISOString().slice(0, 10)}.xls"`
  });
  response.end(workbook);
}

// Récapitulatif des quantités globales (même agrégation que renderQuantitySummary
// côté admin dans app.js), généré ici côté serveur pour la pièce jointe d'e-mail
// envoyée à la clôture d'une opération.
function buildQuantitySummaryWorkbookHtml(campaign, campaignResponses) {
  const template = normalizeTemplate(campaign.template);
  const columns = template.columns || [];
  const rows = rowsForExport(campaignResponses);
  const totals = new Map();
  rows.forEach((row) => {
    const key = columns.map((column) => row.values[column] || "").join("|") || JSON.stringify(row.values);
    const existing = totals.get(key) || { values: row.values || {}, quantity: 0 };
    existing.quantity += Number(String(row.quantity || "0").replace(",", ".")) || 0;
    totals.set(key, existing);
  });
  const summaryRows = [...totals.values()].filter((row) => row.quantity > 0);

  const headings = [...columns, "Quantité totale"];
  const bodyRows = summaryRows.map((row) => `
    <tr>
      ${columns.map((column) => `<td>${escapeHtml(row.values[column] || "")}</td>`).join("")}
      <td>${escapeHtml(String(row.quantity))}</td>
    </tr>
  `).join("");

  return `
    <html>
      <head><meta charset="utf-8"></head>
      <body>
        <table border="1">
          <thead><tr>${headings.map((heading) => `<th>${escapeHtml(heading)}</th>`).join("")}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </body>
    </html>
  `;
}

// Envoi de l'e-mail de clôture (quantités globales + dispatch par pharmacie en
// pièces jointes) à Hélène, Jean-Garry et l'équipe SOGUASPHAR. Appelé juste après
// la sauvegarde d'une campagne qui vient de passer à closed:true (voir PUT /api/orders).
async function notifyCampaignClosed(campaign) {
  const campaignResponses = latestResponses(readResponses())
    .filter((item) => responseMatchesCampaign(item, campaign.id));
  const datePart = new Date().toISOString().slice(0, 10);
  const summaryHtml = buildQuantitySummaryWorkbookHtml(campaign, campaignResponses);
  const dispatchHtml = buildDispatchWorkbookHtml(campaignResponses);
  await sendMail({
    subject: `Précommande clôturée : ${campaign.title}`,
    text: `La précommande "${campaign.title}" vient d'être clôturée sur Préco.\n\nVous trouverez en pièces jointes le récapitulatif des quantités globales commandées et le détail des réponses par pharmacie.`,
    html: `<p>La précommande <strong>${escapeHtml(campaign.title)}</strong> vient d'être clôturée sur Préco.</p><p>Vous trouverez en pièces jointes le récapitulatif des quantités globales commandées et le détail des réponses par pharmacie.</p>`,
    attachments: [
      { filename: `quantites-${campaign.id}-${datePart}.xls`, content: summaryHtml },
      { filename: `dispatch-pharmacies-${campaign.id}-${datePart}.xls`, content: dispatchHtml }
    ]
  });
}

// --- Relances automatiques par e-mail (précommandes et sondages) -----------
// Chaque jour : si une pharmacie n'a pas répondu à une opération active dont la
// clôture est prévue le LENDEMAIN (J-1, un seul rappel, jamais avant), on lui
// envoie une relance (une seule fois, mémorisée dans campaign.remindersSent).
// Sans adresse e-mail connue pour la pharmacie (comptes nominatifs,
// data/users.json), on ne peut rien envoyer : on logue simplement la
// situation, sans jamais marquer la relance "envoyée", pour qu'elle reparte
// dès qu'une adresse sera renseignée.
// Décidé par Hélène le 13/10/2026 : plus de relance à J-3/J-2/jour-même, et
// aucun rattrapage rétroactif des opérations dont le J-1 est déjà passé —
// chaque jour on ne regarde que "la clôture est-elle exactement demain ?".
const PRECO_BASE_URL = "https://preco.soguasphar.fr";
// Les relances ne démarrent jamais avant cette date (même si le serveur
// redémarre ou si la variable est activée avant), pour éviter tout envoi
// accidentel le jour de la mise en service. Laisser vide/absent = pas de
// limite (déconseillé en production sans y avoir réfléchi).
const REMINDERS_START_DATE = String(process.env.REMINDERS_START_DATE || "").trim() || null;

function reminderSlugify(value) {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "operation";
}

// Adresses e-mail d'une pharmacie, pour les relances : l'adresse de contact
// renseignée directement sur la fiche pharmacie (pharmacies.json, champ
// "email", ex. adresse du titulaire issue de la liste des adhérents), plus
// celles des éventuels comptes nominatifs déjà créés (titulaire(s)/équipe,
// data/users.json). Peut être vide si rien n'est encore renseigné : dans ce
// cas, pas d'envoi.
function activePharmacyEmails(pharmacy) {
  if (!pharmacy || !pharmacy.id) return [];
  const emails = readUsers()
    .filter((user) => user && user.pharmacyId === pharmacy.id && user.active !== false && user.email)
    .map((user) => normalizeEmail(user.email));
  if (pharmacy.email) emails.push(normalizeEmail(pharmacy.email));
  return [...new Set(emails.filter(Boolean))];
}

function closingDateForOrder(order) {
  const dates = (order.periods || [])
    .map((period) => period && period.endDate)
    .filter(Boolean);
  if (!dates.length) return null;
  return [...dates].sort().slice(-1)[0];
}

function closingDateForPoll(poll) {
  return poll && poll.endDate ? poll.endDate : null;
}

// Nombre de jours (entiers) entre aujourd'hui et la date de clôture (YYYY-MM-DD).
// Négatif si déjà passée.
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const todayStr = new Date().toISOString().slice(0, 10);
  const a = new Date(`${todayStr}T00:00:00Z`);
  const b = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
}

function pharmacyRespondedToOrder(order, pharmacy, responses) {
  return responses.some((response) => {
    if (String(response.campaignId || "") !== String(order.id)) return false;
    const id = String(response.pharmacyId || "").trim();
    const name = normalizeLookup(response.pharmacyName);
    return (id && id === String(pharmacy.id || "").trim())
      || (name && name === normalizeLookup(pharmacy.name));
  });
}

function pharmacyRespondedToPoll(poll, pharmacy, pollResponses) {
  return pollResponses.some((response) => {
    if (String(response.pollId || "") !== String(poll.id)) return false;
    const id = String(response.pharmacyId || "").trim();
    const name = normalizeLookup(response.pharmacyName);
    return (id && id === String(pharmacy.id || "").trim())
      || (name && name === normalizeLookup(pharmacy.name));
  });
}

// Adresse d'envoi dédiée aux relances automatiques (pas un vrai compte lu par
// quelqu'un : les pharmacies ne doivent jamais y répondre). Toujours avec le
// logo SOGUASPHAR (jamais le logo "compta", utilisé ailleurs dans Soguaspilot).
const REMINDER_FROM = "ne_pas_repondre@soguasphar.com";
const REMINDER_FROM_NAME = "SOGUASPHAR";

async function sendReminderEmail({ emails, kind, operationType, title, closingDate, link }) {
  const isLast = kind === "veille";
  const typeLabel = operationType === "poll" ? "sondage" : "précommande";
  const closingPart = closingDate ? ` Elle se clôture le ${closingDate.split("-").reverse().join("/")}.` : "";
  const subject = isLast
    ? `Dernière relance avant clôture : "${title}"`
    : `Rappel : réponse attendue pour "${title}"`;
  const text = isLast
    ? `Bonjour,\n\nCeci est la dernière relance : vous n'avez pas encore répondu au ${typeLabel} "${title}".${closingPart} Passé ce délai, il ne sera plus possible de répondre.\n\nMerci de répondre dès aujourd'hui : ${link}\n\n— Préco SOGUASPHAR\n\nCeci est un message automatique, merci de ne pas y répondre.`
    : `Bonjour,\n\nVous n'avez pas encore répondu au ${typeLabel} "${title}".${closingPart}\n\nRépondre ici : ${link}\n\n— Préco SOGUASPHAR\n\nCeci est un message automatique, merci de ne pas y répondre.`;
  const bodyMessage = isLast
    ? `Ceci est la <strong>dernière relance</strong> : vous n'avez pas encore répondu au ${typeLabel} « ${title} ».${closingPart} Passé ce délai, il ne sera plus possible de répondre.`
    : `Vous n'avez pas encore répondu au ${typeLabel} « ${title} ».${closingPart}`;
  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
      <div style="text-align: center; padding: 16px 0;">
        <img src="${PRECO_BASE_URL}/logo-soguasphar.png" alt="SOGUASPHAR" style="height: 56px;" />
      </div>
      <p>Bonjour,</p>
      <p>${bodyMessage}</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${link}" style="background:#0f766e; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:6px; display:inline-block;">Répondre maintenant</a>
      </p>
      <p>— Préco SOGUASPHAR</p>
      <p style="font-size: 12px; color: #6b7280; margin-top: 24px;">Ceci est un message automatique, merci de ne pas y répondre.</p>
    </div>`;
  await sendMail({ to: emails.join(", "), subject, text, html, from: REMINDER_FROM, fromName: REMINDER_FROM_NAME });
}

async function checkReminders() {
  try {
    if (REMINDERS_START_DATE) {
      const todayStr = new Date().toISOString().slice(0, 10);
      if (todayStr < REMINDERS_START_DATE) {
        console.log(`[preco] relances automatiques : démarrage prévu le ${REMINDERS_START_DATE}, rien envoyé aujourd'hui (${todayStr}).`);
        return;
      }
    }
    const pharmacies = readPharmacies().filter((pharmacy) => pharmacy && pharmacy.active !== false);
    const responses = readResponses();
    const pollResponses = readPollResponses();
    const skippedNoEmail = new Set();

    const orders = readOrders();
    let ordersChanged = false;
    for (const order of orders) {
      if (!order || order.draft || order.closed) continue;
      const closingDate = closingDateForOrder(order);
      const left = daysUntil(closingDate);
      if (left === null || left < 0) continue;
      const kind = left === 1 ? "veille" : null; // uniquement J-1, voir décision du 13/10/2026 ci-dessus
      if (!kind) continue;

      order.remindersSent = order.remindersSent || {};
      for (const pharmacy of pharmacies) {
        const sentTypes = order.remindersSent[pharmacy.id] || [];
        if (sentTypes.includes(kind)) continue;
        if (pharmacyRespondedToOrder(order, pharmacy, responses)) continue;
        const emails = activePharmacyEmails(pharmacy);
        if (!emails.length) {
          skippedNoEmail.add(`${pharmacy.name} (précommande "${order.title}")`);
          continue;
        }
        try {
          await sendReminderEmail({
            emails,
            kind,
            operationType: "order",
            title: order.title,
            closingDate,
            link: `${PRECO_BASE_URL}/?operation=${reminderSlugify(order.title)}`
          });
          order.remindersSent[pharmacy.id] = [...sentTypes, kind];
          ordersChanged = true;
        } catch (error) {
          console.error(`[preco] relance non envoyée (précommande "${order.title}", pharmacie ${pharmacy.name}) :`, error.message || error);
        }
      }
      if (ordersChanged) writeOrders(orders);
    }

    const polls = readPolls();
    let pollsChanged = false;
    for (const poll of polls) {
      if (!poll || poll.draft || poll.closed) continue;
      const closingDate = closingDateForPoll(poll);
      const left = daysUntil(closingDate);
      if (left === null || left < 0) continue;
      const kind = left === 1 ? "veille" : null; // uniquement J-1, voir décision du 13/10/2026 ci-dessus
      if (!kind) continue;

      poll.remindersSent = poll.remindersSent || {};
      for (const pharmacy of pharmacies) {
        const sentTypes = poll.remindersSent[pharmacy.id] || [];
        if (sentTypes.includes(kind)) continue;
        if (pharmacyRespondedToPoll(poll, pharmacy, pollResponses)) continue;
        const emails = activePharmacyEmails(pharmacy);
        if (!emails.length) {
          skippedNoEmail.add(`${pharmacy.name} (sondage "${poll.question}")`);
          continue;
        }
        try {
          await sendReminderEmail({
            emails,
            kind,
            operationType: "poll",
            title: poll.question,
            closingDate,
            link: `${PRECO_BASE_URL}/?operation=${reminderSlugify(poll.question)}`
          });
          poll.remindersSent[pharmacy.id] = [...sentTypes, kind];
          pollsChanged = true;
        } catch (error) {
          console.error(`[preco] relance non envoyée (sondage "${poll.question}", pharmacie ${pharmacy.name}) :`, error.message || error);
        }
      }
      if (pollsChanged) writePolls(polls);
    }

    if (skippedNoEmail.size) {
      console.log(`[preco] relances non envoyées, aucune adresse e-mail connue pour : ${[...skippedNoEmail].join(" ; ")}`);
    }
  } catch (error) {
    console.error("[preco] erreur pendant la vérification des relances :", error);
  }
}

// Une colonne par question du sondage (ex : "Présence" et "Repas" séparées) au lieu
// de tout mélanger dans une seule colonne "Réponse".
function pollAnswerCellValue(row, question, questionList) {
  if (row.answers && row.answers[question.id] !== undefined) {
    const value = row.answers[question.id];
    return Array.isArray(value) ? value.join(", ") : String(value || "");
  }
  // Anciennes réponses enregistrées avant la séparation par question : on retombe
  // sur le champ "answer" unique si le sondage n'a qu'une seule question.
  if (questionList.length <= 1) return row.answer || "";
  return "";
}

function sendPollExcel(response, responses, poll) {
  const questionList = pollQuestionListMeta(poll);
  const multiQuestion = questionList.length > 1;
  const headings = [
    "Date",
    "Pharmacie",
    ...(multiQuestion ? [] : ["Question"]),
    ...questionList.map((question) => question.label || "Réponse"),
    "Commentaire / précision"
  ];
  const rows = responses.map((row) => `
    <tr>
      <td>${escapeHtml(row.createdAt)}</td>
      <td>${escapeHtml(row.pharmacyName)}</td>
      ${multiQuestion ? "" : `<td>${escapeHtml(row.pollQuestion)}</td>`}
      ${questionList.map((question) => `<td>${escapeHtml(pollAnswerCellValue(row, question, questionList))}</td>`).join("")}
      <td>${escapeHtml(row.freeText)}</td>
    </tr>
  `).join("");

  const workbook = `
    <html>
      <head><meta charset="utf-8"></head>
      <body>
        <table border="1">
          <thead><tr>${headings.map((heading) => `<th>${heading}</th>`).join("")}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;

  response.writeHead(200, {
    "Content-Type": "application/vnd.ms-excel; charset=utf-8",
    "Content-Disposition": `attachment; filename="sondage-soguasphar-${new Date().toISOString().slice(0, 10)}.xls"`
  });
  response.end(workbook);
}

function formatProfileHours(hours = []) {
  return (Array.isArray(hours) ? hours : []).map((row) => {
    if (row.closed) return `${row.day} : fermé`;
    if (row.split) {
      return `${row.day} : ${row.morningOpen || "--:--"}-${row.morningClose || "--:--"} / ${row.afternoonOpen || "--:--"}-${row.afternoonClose || "--:--"}`;
    }
    return `${row.day} : ${row.open || "--:--"}-${row.close || "--:--"}`;
  }).join("\n");
}

function sendInfoExcel(response, responses) {
  const headings = ["Date", "Modifié le", "Pharmacie", "Adresse", "Code postal", "Ville", "Téléphone", "Mail titulaire", "Mail équipe", "Facebook", "Instagram", "LinkedIn", "TikTok", "Site internet", "Horaires", "Services", "Autres services", "Commentaire"];
  const rows = latestInfoResponses(responses).map((row) => `
    <tr>
      <td>${escapeHtml(row.createdAt)}</td>
      <td>${escapeHtml(row.updatedAt || "")}</td>
      <td>${escapeHtml(row.pharmacyName)}</td>
      <td>${escapeHtml(row.address)}</td>
      <td>${escapeHtml(row.postalCode)}</td>
      <td>${escapeHtml(row.city)}</td>
      <td>${escapeHtml(row.phone)}</td>
      <td>${escapeHtml(row.ownerEmail)}</td>
      <td>${escapeHtml(row.teamEmail)}</td>
      <td>${escapeHtml(row.facebook)}</td>
      <td>${escapeHtml(row.instagram)}</td>
      <td>${escapeHtml(row.linkedin)}</td>
      <td>${escapeHtml(row.tiktok)}</td>
      <td>${escapeHtml(row.website)}</td>
      <td>${escapeHtml(formatProfileHours(row.hours))}</td>
      <td>${escapeHtml((row.services || []).join(", "))}</td>
      <td>${escapeHtml(row.otherServices)}</td>
      <td>${escapeHtml(row.notes)}</td>
    </tr>
  `).join("");

  const workbook = `
    <html>
      <head><meta charset="utf-8"></head>
      <body>
        <table border="1">
          <thead><tr>${headings.map((heading) => `<th>${heading}</th>`).join("")}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;

  response.writeHead(200, {
    "Content-Type": "application/vnd.ms-excel; charset=utf-8",
    "Content-Disposition": `attachment; filename="fiches-pharmacies-soguasphar-${new Date().toISOString().slice(0, 10)}.xls"`
  });
  response.end(workbook);
}

function serveStatic(request, response, pathname) {
  const fileName = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = path.resolve(ROOT, fileName);

  if (!filePath.startsWith(ROOT)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    const ext = path.extname(filePath);
    const headers = {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream"
    };
    if ([".html", ".js", ".css"].includes(ext)) {
      headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate";
      headers.Pragma = "no-cache";
      headers.Expires = "0";
    }
    response.writeHead(200, headers);
    response.end(data);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  try {
    if (url.pathname.startsWith("/bat-2027/") && request.method === "GET") {
      const requestedName = path.basename(url.pathname.slice("/bat-2027/".length));
      const filePath = path.join(BAT_DOCUMENTS_DIR, requestedName);
      if (!filePath.startsWith(BAT_DOCUMENTS_DIR) || !/^pharmacy-[\w-]+\.pdf$/.test(requestedName)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      fs.readFile(filePath, (error, data) => {
        if (error) {
          response.writeHead(404);
          response.end("Not found");
          return;
        }
        response.writeHead(200, { "Content-Type": "application/pdf" });
        response.end(data);
      });
      return;
    }

    if (url.pathname.startsWith("/attestations-2027/") && request.method === "GET") {
      const requestedName = path.basename(url.pathname.slice("/attestations-2027/".length));
      const filePath = path.join(ATTESTATION_PDF_DIR, requestedName);
      if (!filePath.startsWith(ATTESTATION_PDF_DIR) || !/^pharmacy-[\w-]+\.pdf$/.test(requestedName)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      fs.readFile(filePath, (error, data) => {
        if (error) {
          response.writeHead(404);
          response.end("Not found");
          return;
        }
        response.writeHead(200, { "Content-Type": "application/pdf" });
        response.end(data);
      });
      return;
    }

    if (url.pathname.startsWith("/captures-demo/") && request.method === "GET") {
      const requestedName = path.basename(url.pathname.slice("/captures-demo/".length));
      const capturesDir = path.join(ROOT, "data", "captures");
      const filePath = path.join(capturesDir, requestedName);
      if (!filePath.startsWith(capturesDir) || !/^[\w-]+\.png$/.test(requestedName)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      fs.readFile(filePath, (error, data) => {
        if (error) {
          response.writeHead(404);
          response.end("Not found");
          return;
        }
        response.writeHead(200, { "Content-Type": "image/png" });
        response.end(data);
      });
      return;
    }

    if (url.pathname === "/api/responses" && request.method === "GET") {
      if (!requireAdminCode(request, response)) {
        return;
      }
      sendJson(response, 200, latestResponses(readResponses()));
      return;
    }

    if (url.pathname === "/api/pharmacy-responses" && request.method === "GET") {
      const pharmacyId = url.searchParams.get("pharmacyId");
      const pharmacyName = normalizeLookup(url.searchParams.get("pharmacyName"));
      const responses = latestResponses(readResponses()).filter((item) => {
        if (item.hiddenFromArchive) return false;
        if (pharmacyId && item.pharmacyId === pharmacyId) return true;
        return pharmacyName && normalizeLookup(item.pharmacyName) === pharmacyName;
      });
      sendJson(response, 200, responses);
      return;
    }

    // Une pharmacie masque une opération de sa page "Archivés" une fois la commande
    // reçue et vérifiée. On ne supprime jamais la réponse : elle reste visible côté
    // admin (suivi, exports) — seul l'affichage pharmacie change.
    if (url.pathname === "/api/pharmacy-responses/hide" && request.method === "POST") {
      const payload = JSON.parse(await readBody(request));
      const responseId = String(payload.id || "").trim();
      const pharmacyId = String(payload.pharmacyId || "").trim();
      const pharmacyName = normalizeLookup(payload.pharmacyName || "");
      if (!responseId || (!pharmacyId && !pharmacyName)) {
        sendJson(response, 400, { error: "Identifiants manquants" });
        return;
      }
      const responses = readResponses();
      const target = responses.find((item) => item.id === responseId);
      if (!target) {
        sendJson(response, 404, { error: "Réponse introuvable" });
        return;
      }
      const isOwner = (pharmacyId && target.pharmacyId === pharmacyId)
        || (pharmacyName && normalizeLookup(target.pharmacyName) === pharmacyName);
      if (!isOwner) {
        sendJson(response, 403, { error: "Cette réponse n'appartient pas à cette pharmacie" });
        return;
      }
      target.hiddenFromArchive = true;
      writeResponses(responses);
      sendJson(response, 200, { ok: true });
      return;
    }

    if (url.pathname === "/api/order-template" && request.method === "GET") {
      sendJson(response, 200, normalizeTemplate(readOrderTemplate()));
      return;
    }

    if (url.pathname === "/api/orders" && request.method === "GET") {
      sendJson(response, 200, readOrders());
      return;
    }

    // Sert la seule image d'une opération (sans renvoyer tout le JSON en base64),
    // utilisée notamment par Soguaspilot pour afficher les vignettes des tâches en attente.
    const orderImageMatch = url.pathname.match(/^\/api\/orders\/([^/]+)\/image$/);
    if (orderImageMatch && request.method === "GET") {
      const orderId = decodeURIComponent(orderImageMatch[1]);
      const order = readOrders().find((item) => item.id === orderId);
      const dataUrl = order && (order.imageData || order.imageData2);
      const match = typeof dataUrl === "string" && dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }
      const buffer = Buffer.from(match[2], "base64");
      response.writeHead(200, {
        "Content-Type": match[1],
        "Cache-Control": "public, max-age=3600",
        "Content-Length": buffer.length
      });
      response.end(buffer);
      return;
    }

    if (url.pathname === "/api/polls" && request.method === "GET") {
      sendJson(response, 200, readPolls());
      return;
    }

    if (url.pathname.startsWith("/api/poll-results/") && request.method === "GET") {
      const pollId = decodeURIComponent(url.pathname.slice("/api/poll-results/".length));
      const poll = readPolls().find((item) => item.id === pollId);
      if (!poll) {
        sendJson(response, 404, { error: "Sondage introuvable" });
        return;
      }

      // Résultats agrégés publics uniquement : jamais les commentaires libres
      // (texte_libre) ni le texte brut des réponses, pour ne rien exposer de
      // ce qu'une pharmacie a écrit en clair.
      const questions = poll.questions && poll.questions.length
        ? poll.questions.map((item, index) => ({
            id: item.id || `question-${index + 1}`,
            label: item.label || poll.question || "",
            type: ["choix_unique", "choix_multiple", "texte_libre"].includes(item.type) ? item.type : "choix_unique",
            options: Array.isArray(item.options) ? item.options : []
          }))
        : [{ id: "main", label: poll.question || "", type: "choix_unique", options: poll.options || [] }];
      const publicQuestions = questions.filter((question) => question.type !== "texte_libre");

      const responses = latestPollResponses(readPollResponses())
        .filter((item) => responseMatchesPoll(item, pollId));

      const counts = {};
      publicQuestions.forEach((question) => {
        const tally = new Map(question.options.map((option) => [option, 0]));
        let answered = 0;
        responses.forEach((item) => {
          const raw = item.answers ? item.answers[question.id] : (questions.length === 1 ? item.answer : undefined);
          const values = Array.isArray(raw) ? raw : (raw ? [raw] : []);
          if (!values.length) return;
          answered += 1;
          values.forEach((value) => {
            if (tally.has(value)) tally.set(value, tally.get(value) + 1);
          });
        });
        counts[question.id] = {
          answered,
          options: question.options.map((option) => ({ option, count: tally.get(option) || 0 }))
        };
      });

      sendJson(response, 200, {
        id: poll.id,
        question: poll.question,
        closed: Boolean(poll.closed),
        totalResponses: responses.length,
        questions: publicQuestions.map((question) => ({ id: question.id, label: question.label, type: question.type })),
        counts
      });
      return;
    }

    if (url.pathname === "/api/info-forms" && request.method === "GET") {
      sendJson(response, 200, readInfoForms());
      return;
    }

    if (url.pathname === "/api/validation" && request.method === "GET") {
      sendJson(response, 200, readValidation());
      return;
    }

    if (url.pathname === "/api/validation" && request.method === "PUT") {
      if (!requireAdminCode(request, response)) {
        return;
      }

      const payload = JSON.parse(await readBody(request));
      const validation = writeValidation(payload || {});
      sendJson(response, 200, validation);
      return;
    }

    if (url.pathname === "/api/info-forms" && request.method === "PUT") {
      if (!requireAdminCode(request, response)) {
        return;
      }

      const payload = JSON.parse(await readBody(request));
      const forms = Array.isArray(payload) ? payload.map((item) => ({
        id: String(item.id || Date.now()),
        title: String(item.title || "").trim(),
        type: String(item.type || "Fiche pharmacie").trim(),
        intro: String(item.intro || "").trim(),
        draft: Boolean(item.draft),
        closed: Boolean(item.closed)
      })).filter((item) => item.id && item.title) : [];
      writeInfoForms(forms);
      sendJson(response, 200, forms);
      return;
    }

    if (url.pathname === "/api/pharmacies" && request.method === "GET") {
      const pharmacies = readPharmacies();
      if (isAdminCodeValid(request)) {
        sendJson(response, 200, pharmacies.map(stripPharmacySecret));
        return;
      }
      sendJson(response, 200, { count: pharmacies.length });
      return;
    }

    if (url.pathname === "/api/pharmacies" && request.method === "PUT") {
      if (!requireAdminCode(request, response)) {
        return;
      }

      const payload = JSON.parse(await readBody(request));
      const existingPharmacies = readPharmacies();
      const pharmacies = Array.isArray(payload) ? payload.map((pharmacy) => {
        const previous = existingPharmacies.find((item) => item.id === pharmacy.id);
        const plainPassword = String(pharmacy.password || "").trim();
        // Un mot de passe en clair n'arrive ici qu'à la création ou à une
        // réinitialisation : on le hache aussitôt et on ne le garde jamais
        // tel quel. Sans mot de passe fourni, on conserve le hachage existant
        // (sinon le simple fait de renvoyer la liste, ex. pour activer/
        // désactiver une pharmacie, effacerait son mot de passe).
        const passwordHash = plainPassword ? hashPassword(plainPassword) : (previous ? previous.passwordHash : "");
        // L'adresse e-mail (contact titulaire, utilisée pour les relances) n'est
        // pas forcément renvoyée par tous les écrans qui sauvegardent cette liste :
        // si absente du payload, on garde celle déjà enregistrée plutôt que de
        // l'effacer silencieusement.
        const email = pharmacy.email !== undefined
          ? String(pharmacy.email || "").trim()
          : (previous ? String(previous.email || "").trim() : "");
        return {
          id: String(pharmacy.id || Date.now()),
          name: String(pharmacy.name || "").trim(),
          passwordHash,
          active: pharmacy.active !== false,
          mustChangePassword: pharmacy.mustChangePassword !== false,
          passwordResetRequested: Boolean(pharmacy.passwordResetRequested),
          passwordResetRequestedAt: String(pharmacy.passwordResetRequestedAt || "").trim(),
          email
        };
      }).filter((pharmacy) => pharmacy.name && pharmacy.passwordHash) : [];
      writePharmacies(pharmacies);
      sendJson(response, 200, pharmacies.map(stripPharmacySecret));
      return;
    }

    if (url.pathname === "/api/pharmacy-password-reset-request" && request.method === "POST") {
      const payload = JSON.parse(await readBody(request));
      const pharmacyName = normalizeLookup(payload.pharmacyName);
      if (!pharmacyName) {
        sendJson(response, 400, { error: "Indiquez le nom de la pharmacie." });
        return;
      }

      const pharmacies = readPharmacies();
      const pharmacy = pharmacies.find((item) => item.active !== false && normalizeLookup(item.name) === pharmacyName)
        || pharmacies.find((item) => {
          const name = normalizeLookup(item.name);
          return item.active !== false && (name.includes(pharmacyName) || pharmacyName.includes(name));
        });
      if (pharmacy) {
        const updatedPharmacies = pharmacies.map((item) => item.id === pharmacy.id ? {
          ...item,
          passwordResetRequested: true,
          passwordResetRequestedAt: new Date().toLocaleString("fr-FR")
        } : item);
        writePharmacies(updatedPharmacies);
      }

      sendJson(response, 200, { ok: true });
      return;
    }

    if (url.pathname === "/api/pharmacy-login" && request.method === "POST") {
      const bruteForceKey = `pharmacy-login:${getClientIp(request)}`;
      if (isLocked(bruteForceKey)) {
        sendJson(response, 429, { error: "Trop de tentatives. Réessayez dans quelques minutes." });
        return;
      }
      const payload = JSON.parse(await readBody(request));
      const password = String(payload.password || "").trim();
      const pharmacy = readPharmacies().find((item) => item.active !== false && verifyPassword(password, item.passwordHash));
      if (!pharmacy) {
        registerFailure(bruteForceKey);
        sendJson(response, 401, { error: "Mot de passe pharmacie incorrect" });
        return;
      }
      registerSuccess(bruteForceKey);
      const pharmacyToken = createSession(null, "pharmacy_legacy", pharmacy.id);
      setSessionCookie(response, pharmacyToken, "pharmacy_legacy");
      sendJson(response, 200, {
        id: pharmacy.id,
        name: pharmacy.name,
        mustChangePassword: pharmacy.mustChangePassword !== false
      });
      return;
    }

    if (url.pathname === "/api/pharmacy-password" && request.method === "PUT") {
      const payload = JSON.parse(await readBody(request));
      const pharmacyId = String(payload.pharmacyId || "").trim();
      const oldPassword = String(payload.oldPassword || "").trim();
      const newPassword = String(payload.newPassword || "").trim();
      const bruteForceKey = `pharmacy-password:${getClientIp(request)}:${pharmacyId}`;
      if (isLocked(bruteForceKey)) {
        sendJson(response, 429, { error: "Trop de tentatives. Réessayez dans quelques minutes." });
        return;
      }
      const pharmacies = readPharmacies();
      const pharmacy = pharmacies.find((item) => item.active !== false && item.id === pharmacyId && verifyPassword(oldPassword, item.passwordHash));

      if (!pharmacy) {
        registerFailure(bruteForceKey);
        sendJson(response, 401, { error: "Mot de passe actuel incorrect" });
        return;
      }
      registerSuccess(bruteForceKey);

      const ruleError = passwordRuleError(newPassword);
      if (ruleError) {
        sendJson(response, 400, { error: ruleError });
        return;
      }

      const updatedPharmacies = pharmacies.map((item) => item.id === pharmacy.id ? {
        ...item,
        passwordHash: hashPassword(newPassword),
        mustChangePassword: false,
        passwordResetRequested: false,
        passwordResetRequestedAt: ""
      } : item);
      writePharmacies(updatedPharmacies);
      const changeToken = createSession(null, "pharmacy_legacy", pharmacy.id);
      setSessionCookie(response, changeToken, "pharmacy_legacy");
      sendJson(response, 200, { id: pharmacy.id, name: pharmacy.name, mustChangePassword: false });
      return;
    }

    // --- Comptes individuels (email + mot de passe) ------------------------
    // Nouvelles routes, en plus de /api/pharmacy-login et x-admin-code qui
    // restent fonctionnelles pendant la transition (le front sera basculé
    // dans une tâche suivante).

    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      const payload = JSON.parse(await readBody(request));
      const email = normalizeEmail(payload.email);
      const password = String(payload.password || "");
      const bruteForceKey = `auth-login:${getClientIp(request)}:${email}`;
      if (isLocked(bruteForceKey)) {
        sendJson(response, 429, { error: "Trop de tentatives. Réessayez dans quelques minutes." });
        return;
      }
      const user = findUserByEmail(email);
      if (!user || user.active === false || !verifyPassword(password, user.passwordHash)) {
        registerFailure(bruteForceKey);
        sendJson(response, 401, { error: "Email ou mot de passe incorrect" });
        return;
      }
      registerSuccess(bruteForceKey);
      const token = createSession(user.id, user.role);
      const users = readUsers();
      const updatedUsers = users.map((item) => item.id === user.id
        ? { ...item, lastLoginAt: new Date().toISOString() }
        : item);
      writeUsers(updatedUsers);
      setSessionCookie(response, token, user.role);
      sendJson(response, 200, { user: publicUser(user) });
      return;
    }

    if (url.pathname === "/api/auth/logout" && request.method === "POST") {
      const cookies = parseCookies(request);
      destroySession(cookies[SESSION_COOKIE_NAME]);
      clearSessionCookie(response);
      sendJson(response, 200, { ok: true });
      return;
    }

    if (url.pathname === "/api/auth/me" && request.method === "GET") {
      const principal = getAuthenticatedPrincipal(request);
      if (!principal) {
        sendJson(response, 401, { error: "Non authentifié" });
        return;
      }
      sendJson(response, 200, { user: principal });
      return;
    }

    if (url.pathname === "/api/auth/password" && request.method === "PUT") {
      const user = requireAuth(request, response);
      if (!user) return;

      const bruteForceKey = `auth-password:${getClientIp(request)}:${user.id}`;
      if (isLocked(bruteForceKey)) {
        sendJson(response, 429, { error: "Trop de tentatives. Réessayez dans quelques minutes." });
        return;
      }

      const payload = JSON.parse(await readBody(request));
      const oldPassword = String(payload.oldPassword || "");
      const newPassword = String(payload.newPassword || "");

      if (!verifyPassword(oldPassword, user.passwordHash)) {
        registerFailure(bruteForceKey);
        sendJson(response, 401, { error: "Mot de passe actuel incorrect" });
        return;
      }
      registerSuccess(bruteForceKey);

      const ruleError = passwordRuleError(newPassword);
      if (ruleError) {
        sendJson(response, 400, { error: ruleError });
        return;
      }

      const users = readUsers();
      const updatedUsers = users.map((item) => item.id === user.id ? {
        ...item,
        passwordHash: hashPassword(newPassword),
        mustChangePassword: false
      } : item);
      writeUsers(updatedUsers);
      const updatedUser = updatedUsers.find((item) => item.id === user.id);
      sendJson(response, 200, { user: publicUser(updatedUser) });
      return;
    }

    // Mot de passe oublié (nouveau système, comptes nominatifs) : envoie un
    // e-mail avec un lien de réinitialisation valable 2h. Répond toujours
    // "ok" côté client, que l'adresse existe ou non, pour ne jamais révéler
    // si un e-mail est enregistré (sécurité).
    if (url.pathname === "/api/auth/forgot-password" && request.method === "POST") {
      const payload = JSON.parse(await readBody(request));
      const email = normalizeEmail(payload.email);
      const bruteForceKey = `forgot-password:${getClientIp(request)}`;
      if (isLocked(bruteForceKey)) {
        sendJson(response, 429, { error: "Trop de tentatives. Réessayez dans quelques minutes." });
        return;
      }
      registerFailure(bruteForceKey); // compte chaque demande, même valide, pour limiter le flot d'e-mails

      if (email) {
        const user = findUserByEmail(email);
        if (user && user.active !== false) {
          const token = generateResetToken();
          const users = readUsers();
          const updatedUsers = users.map((item) => item.id === user.id ? {
            ...item,
            resetTokenHash: hashResetToken(token),
            resetTokenExpiresAt: Date.now() + RESET_TOKEN_VALIDITY_MS
          } : item);
          writeUsers(updatedUsers);

          const resetLink = `${PUBLIC_BASE_URL}/?reset=${token}`;
          console.error(`[preco][debug] lien de réinitialisation pour ${user.email} : ${resetLink}`);
          sendMail({
            to: user.email,
            subject: "Préco SOGUASPHAR : réinitialisation de votre mot de passe",
            text: `Bonjour,\n\nVous avez demandé à réinitialiser votre mot de passe Préco.\n\nCliquez sur ce lien dans les 2 heures pour choisir un nouveau mot de passe :\n${resetLink}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail : rien ne change.\n\n— Préco SOGUASPHAR`,
            html: `<p>Bonjour,</p><p>Vous avez demandé à réinitialiser votre mot de passe Préco.</p><p><a href="${resetLink}">Cliquez ici pour choisir un nouveau mot de passe</a> (lien valable 2 heures).</p><p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail : rien ne change.</p><p>— Préco SOGUASPHAR</p>`
          }).catch((error) => {
            console.error(`[preco] échec de l'e-mail de réinitialisation pour "${user.email}" :`, error.message);
          });
        }
      }

      sendJson(response, 200, { ok: true });
      return;
    }

    // Applique le nouveau mot de passe choisi via le lien reçu par e-mail.
    if (url.pathname === "/api/auth/reset-password" && request.method === "POST") {
      const payload = JSON.parse(await readBody(request));
      const token = String(payload.token || "").trim();
      const newPassword = String(payload.newPassword || "");
      const bruteForceKey = `reset-password:${getClientIp(request)}`;
      if (isLocked(bruteForceKey)) {
        sendJson(response, 429, { error: "Trop de tentatives. Réessayez dans quelques minutes." });
        return;
      }
      if (!token) {
        sendJson(response, 400, { error: "Lien invalide." });
        return;
      }

      const tokenHash = hashResetToken(token);
      const users = readUsers();
      const user = users.find((item) => item.resetTokenHash === tokenHash);
      if (!user || !isResetTokenValid(user)) {
        registerFailure(bruteForceKey);
        sendJson(response, 400, { error: "Ce lien n'est plus valable. Refaites une demande de réinitialisation." });
        return;
      }
      registerSuccess(bruteForceKey);

      const ruleError = passwordRuleError(newPassword);
      if (ruleError) {
        sendJson(response, 400, { error: ruleError });
        return;
      }

      const updatedUsers = users.map((item) => item.id === user.id ? {
        ...item,
        passwordHash: hashPassword(newPassword),
        mustChangePassword: false,
        resetTokenHash: null,
        resetTokenExpiresAt: null
      } : item);
      writeUsers(updatedUsers);
      const updatedUser = updatedUsers.find((item) => item.id === user.id);

      const sessionToken = createSession(updatedUser.id, updatedUser.role);
      setSessionCookie(response, sessionToken, updatedUser.role);
      sendJson(response, 200, { user: publicUser(updatedUser) });
      return;
    }

    // --- Comptes d'équipe --------------------------------------------------
    // Un titulaire (pharmacy_admin) peut créer, réinitialiser le mot de passe
    // de, désactiver ou supprimer des comptes collaborateurs de sa propre
    // pharmacie. Un collaborateur peut seulement consulter la liste.

    if (url.pathname === "/api/team" && request.method === "GET") {
      const user = requireAuth(request, response, ["pharmacy_admin", "pharmacy_collaborator"]);
      if (!user) return;
      const members = readUsers()
        .filter((item) => requireSamePharmacy(user, item.pharmacyId) && item.pharmacyId)
        .map(publicUser);
      sendJson(response, 200, { members });
      return;
    }

    if (url.pathname === "/api/team" && request.method === "POST") {
      const user = requireAuth(request, response, ["pharmacy_admin"]);
      if (!user) return;

      const payload = JSON.parse(await readBody(request));
      const email = normalizeEmail(payload.email);
      const firstName = String(payload.firstName || "").trim();
      const lastName = String(payload.lastName || "").trim();
      const jobTitle = String(payload.jobTitle || "").trim();

      if (!email || !firstName || !lastName) {
        sendJson(response, 400, { error: "Indiquez le prénom, le nom et l'e-mail." });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        sendJson(response, 400, { error: "Adresse e-mail invalide." });
        return;
      }
      if (findUserByEmail(email)) {
        sendJson(response, 409, { error: "Cette adresse e-mail est déjà utilisée par un compte." });
        return;
      }

      const newUser = {
        id: `user-${crypto.randomBytes(8).toString("hex")}`,
        email,
        passwordHash: hashPassword(crypto.randomBytes(24).toString("hex")), // remplacé tout de suite par le lien envoyé par e-mail
        firstName,
        lastName,
        jobTitle,
        pharmacyId: user.pharmacyId,
        role: "pharmacy_collaborator",
        active: true,
        mustChangePassword: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
        invitedAt: new Date().toISOString(),
        invitationToken: null
      };
      const users = readUsers();
      users.push(newUser);
      writeUsers(users);
      const invitedUser = issueAccountPasswordLink(newUser, { isNewAccount: true });
      sendJson(response, 201, { member: publicUser(invitedUser) });
      return;
    }

    // Une administratrice SOGUASPHAR peut créer un compte équipe (collaborateur)
    // pour N'IMPORTE QUELLE pharmacie du réseau, sans avoir besoin d'être
    // connectée en tant que titulaire de cette pharmacie (contrairement à
    // POST /api/team ci-dessus, réservé au titulaire pour sa propre pharmacie).
    // Sécurité renforcée demandée par Hélène le 13/10/2026 : l'adresse e-mail
    // doit obligatoirement comporter un mot du nom de la pharmacie (ex. pour
    // "BAMBOU VERT" : contenir "bambou" ou "vert"), pour empêcher la création
    // d'un compte avec une adresse générique (gmail/hotmail...) sans lien
    // visible avec la pharmacie.
    if (url.pathname === "/api/pharmacy-team" && request.method === "POST") {
      const admin = requireAuth(request, response, ["soguasphar_admin"]);
      if (!admin) return;

      const payload = JSON.parse(await readBody(request));
      const email = normalizeEmail(payload.email);
      const firstName = String(payload.firstName || "").trim();
      const lastName = String(payload.lastName || "").trim();
      const pharmacyId = String(payload.pharmacyId || "").trim();

      if (!pharmacyId || !email || !firstName || !lastName) {
        sendJson(response, 400, { error: "Choisissez la pharmacie et indiquez le prénom, le nom et l'e-mail." });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        sendJson(response, 400, { error: "Adresse e-mail invalide." });
        return;
      }

      const pharmacy = readPharmacies().find((item) => item.id === pharmacyId);
      if (!pharmacy) {
        sendJson(response, 404, { error: "Pharmacie introuvable." });
        return;
      }

      if (!emailMatchesPharmacyName(email, pharmacy.name)) {
        sendJson(response, 400, {
          error: `Par sécurité, l'adresse e-mail d'un compte équipe doit comporter le nom de la pharmacie (${pharmacy.name}). Une adresse générique (gmail, hotmail…) sans rapport avec "${pharmacy.name}" n'est pas acceptée.`
        });
        return;
      }

      if (findUserByEmail(email)) {
        sendJson(response, 409, { error: "Cette adresse e-mail est déjà utilisée par un compte." });
        return;
      }

      const newUser = {
        id: `user-${crypto.randomBytes(8).toString("hex")}`,
        email,
        passwordHash: hashPassword(crypto.randomBytes(24).toString("hex")), // remplacé tout de suite par le lien envoyé par e-mail
        firstName,
        lastName,
        jobTitle: "",
        pharmacyId,
        role: "pharmacy_collaborator",
        active: true,
        mustChangePassword: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
        invitedAt: new Date().toISOString(),
        invitationToken: null
      };
      const users = readUsers();
      users.push(newUser);
      writeUsers(users);
      const invitedUser = issueAccountPasswordLink(newUser, { isNewAccount: true });
      sendJson(response, 201, { pharmacy, member: publicUser(invitedUser) });
      return;
    }

    if (url.pathname.startsWith("/api/team/") && url.pathname.endsWith("/reset-password") && request.method === "POST") {
      const user = requireAuth(request, response, ["pharmacy_admin"]);
      if (!user) return;

      const memberId = decodeURIComponent(url.pathname.replace("/api/team/", "").replace("/reset-password", ""));
      const users = readUsers();
      const member = users.find((item) => item.id === memberId);
      if (!member || member.role !== "pharmacy_collaborator" || !requireSamePharmacy(user, member.pharmacyId)) {
        sendJson(response, 404, { error: "Personne introuvable." });
        return;
      }

      const updatedMember = issueAccountPasswordLink(member, { isNewAccount: false });
      sendJson(response, 200, { member: publicUser(updatedMember) });
      return;
    }

    if (url.pathname.startsWith("/api/team/") && request.method === "PUT") {
      const user = requireAuth(request, response, ["pharmacy_admin"]);
      if (!user) return;

      const memberId = decodeURIComponent(url.pathname.replace("/api/team/", ""));
      const payload = JSON.parse(await readBody(request));
      const users = readUsers();
      const member = users.find((item) => item.id === memberId);
      if (!member || member.role !== "pharmacy_collaborator" || !requireSamePharmacy(user, member.pharmacyId)) {
        sendJson(response, 404, { error: "Personne introuvable." });
        return;
      }

      const updatedUsers = users.map((item) => item.id === member.id ? {
        ...item,
        active: payload.active !== false
      } : item);
      writeUsers(updatedUsers);
      sendJson(response, 200, { member: publicUser(updatedUsers.find((item) => item.id === member.id)) });
      return;
    }

    if (url.pathname.startsWith("/api/team/") && request.method === "DELETE") {
      const user = requireAuth(request, response, ["pharmacy_admin"]);
      if (!user) return;

      const memberId = decodeURIComponent(url.pathname.replace("/api/team/", ""));
      const users = readUsers();
      const member = users.find((item) => item.id === memberId);
      if (!member || member.role !== "pharmacy_collaborator" || !requireSamePharmacy(user, member.pharmacyId)) {
        sendJson(response, 404, { error: "Personne introuvable." });
        return;
      }

      writeUsers(users.filter((item) => item.id !== member.id));
      sendJson(response, 200, { ok: true });
      return;
    }

    // Comptes administrateurs SOGUASPHAR (distincts des comptes pharmacie) :
    // seule une administratrice déjà connectée peut en créer ou en voir la liste.
    if (url.pathname === "/api/admin-team" && request.method === "GET") {
      const user = requireAuth(request, response, ["soguasphar_admin"]);
      if (!user) return;
      const members = readUsers()
        .filter((item) => item.role === "soguasphar_admin")
        .map(publicUser);
      sendJson(response, 200, { members });
      return;
    }

    if (url.pathname === "/api/admin-team" && request.method === "POST") {
      const user = requireAuth(request, response, ["soguasphar_admin"]);
      if (!user) return;

      const payload = JSON.parse(await readBody(request));
      const email = normalizeEmail(payload.email);
      const firstName = String(payload.firstName || "").trim();
      const lastName = String(payload.lastName || "").trim();
      // "Profil / niveau d'autorisation" : pour l'instant une simple étiquette
      // affichée (ex. "Administratrice", "Collaborateur équipe"), sans effet
      // sur les droits réels — tous les comptes soguasphar_admin ont les mêmes
      // droits aujourd'hui. Un vrai système de permissions serait un chantier
      // à part.
      const jobTitle = String(payload.jobTitle || "").trim();

      if (!email || !firstName || !lastName) {
        sendJson(response, 400, { error: "Indiquez le prénom, le nom et l'e-mail." });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        sendJson(response, 400, { error: "Adresse e-mail invalide." });
        return;
      }
      if (findUserByEmail(email)) {
        sendJson(response, 409, { error: "Cette adresse e-mail est déjà utilisée par un compte." });
        return;
      }

      const newUser = {
        id: `user-${crypto.randomBytes(8).toString("hex")}`,
        email,
        passwordHash: hashPassword(crypto.randomBytes(24).toString("hex")), // remplacé tout de suite par le lien envoyé par e-mail
        firstName,
        lastName,
        jobTitle,
        pharmacyId: null,
        role: "soguasphar_admin",
        active: true,
        mustChangePassword: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
        invitedAt: new Date().toISOString(),
        invitationToken: null
      };
      const users = readUsers();
      users.push(newUser);
      writeUsers(users);
      const invitedUser = issueAccountPasswordLink(newUser, { isNewAccount: true });
      sendJson(response, 201, { member: publicUser(invitedUser) });
      return;
    }

    // --- Rubrique "Paramètres" (refonte du 13/10/2026) -----------------------
    // Vue d'ensemble des accès pharmacies (comptes modernes e-mail/mot de passe,
    // un par pharmacie possible de plusieurs : pharmacy_admin + collaborateurs),
    // et actions génériques (renvoyer l'invitation, modifier l'e-mail, activer/
    // désactiver) réutilisables pour les comptes pharmacie ET administrateur.

    if (url.pathname === "/api/pharmacy-overview" && request.method === "GET") {
      const user = requireAuth(request, response, ["soguasphar_admin"]);
      if (!user) return;

      const pharmacies = readPharmacies();
      const users = readUsers().filter((item) => item.role === "pharmacy_admin" || item.role === "pharmacy_collaborator");
      const overview = pharmacies.map((pharmacy) => {
        const accounts = users
          .filter((item) => String(item.pharmacyId) === String(pharmacy.id))
          .map(publicUser)
          .sort((a, b) => (a.role === "pharmacy_admin" ? -1 : 1) - (b.role === "pharmacy_admin" ? -1 : 1));
        const primaryAccount = accounts.find((item) => item.role === "pharmacy_admin") || accounts[0] || null;
        const lastLoginAt = accounts.reduce((latest, item) => {
          if (!item.lastLoginAt) return latest;
          if (!latest || item.lastLoginAt > latest) return item.lastLoginAt;
          return latest;
        }, null);
        return {
          id: pharmacy.id,
          name: pharmacy.name,
          active: pharmacy.active !== false,
          hasLegacyAccess: Boolean(pharmacy.passwordHash) || Boolean(pharmacy.mustChangePassword !== undefined),
          primaryEmail: primaryAccount ? primaryAccount.email : null,
          lastLoginAt,
          accounts
        };
      });
      sendJson(response, 200, { pharmacies: overview });
      return;
    }

    if (url.pathname === "/api/pharmacy-overview" && request.method === "POST") {
      const user = requireAuth(request, response, ["soguasphar_admin"]);
      if (!user) return;

      const payload = JSON.parse(await readBody(request));
      const email = normalizeEmail(payload.email);
      const newPharmacyName = String(payload.newPharmacyName || "").trim();
      let pharmacyId = String(payload.pharmacyId || "").trim();

      if (!email) {
        sendJson(response, 400, { error: "Indiquez l'adresse e-mail de la pharmacie." });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        sendJson(response, 400, { error: "Adresse e-mail invalide." });
        return;
      }
      if (!pharmacyId && !newPharmacyName) {
        sendJson(response, 400, { error: "Choisissez une pharmacie existante ou indiquez le nom de la nouvelle pharmacie." });
        return;
      }
      if (findUserByEmail(email)) {
        sendJson(response, 409, { error: "Cette adresse e-mail est déjà utilisée par un compte." });
        return;
      }

      let pharmacies = readPharmacies();
      let pharmacy = pharmacyId ? pharmacies.find((item) => item.id === pharmacyId) : null;
      if (!pharmacy) {
        if (!newPharmacyName) {
          sendJson(response, 404, { error: "Pharmacie introuvable." });
          return;
        }
        pharmacy = { id: `pharmacy-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`, name: newPharmacyName, active: true };
        pharmacies = [...pharmacies, pharmacy];
        writePharmacies(pharmacies);
      }
      pharmacyId = pharmacy.id;

      const existingAccount = readUsers().find((item) => item.role === "pharmacy_admin" && String(item.pharmacyId) === String(pharmacyId));
      if (existingAccount) {
        sendJson(response, 409, { error: `${pharmacy.name} a déjà un accès (${existingAccount.email}). Utilisez "Renvoyer l'invitation" plutôt que d'en créer un nouveau.` });
        return;
      }

      const newUser = {
        id: `user-${crypto.randomBytes(8).toString("hex")}`,
        email,
        passwordHash: hashPassword(crypto.randomBytes(24).toString("hex")),
        firstName: "",
        lastName: "",
        jobTitle: "",
        pharmacyId,
        role: "pharmacy_admin",
        active: true,
        mustChangePassword: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
        invitedAt: new Date().toISOString(),
        invitationToken: null
      };
      const users = readUsers();
      users.push(newUser);
      writeUsers(users);
      const invitedUser = issueAccountPasswordLink(newUser, { isNewAccount: true });
      sendJson(response, 201, { pharmacy, account: publicUser(invitedUser) });
      return;
    }

    // Renvoyer le lien d'activation/réinitialisation à un compte EXISTANT,
    // quel que soit son rôle (pharmacie ou administrateur SOGUASPHAR).
    if (url.pathname.startsWith("/api/users/") && url.pathname.endsWith("/resend-invite") && request.method === "POST") {
      const admin = requireAuth(request, response, ["soguasphar_admin"]);
      if (!admin) return;

      const targetId = decodeURIComponent(url.pathname.replace("/api/users/", "").replace("/resend-invite", ""));
      const users = readUsers();
      const target = users.find((item) => item.id === targetId);
      if (!target) {
        sendJson(response, 404, { error: "Compte introuvable." });
        return;
      }

      const updated = issueAccountPasswordLink(target, { isNewAccount: !target.lastLoginAt });
      sendJson(response, 200, { user: publicUser(updated) });
      return;
    }

    // Modifier l'e-mail, le profil (jobTitle) ou activer/désactiver un compte
    // EXISTANT, quel que soit son rôle. Réservé aux administratrices SOGUASPHAR.
    if (url.pathname.startsWith("/api/users/") && request.method === "PUT" && !url.pathname.endsWith("/resend-invite")) {
      const admin = requireAuth(request, response, ["soguasphar_admin"]);
      if (!admin) return;

      const targetId = decodeURIComponent(url.pathname.replace("/api/users/", ""));
      const payload = JSON.parse(await readBody(request));
      const users = readUsers();
      const target = users.find((item) => item.id === targetId);
      if (!target) {
        sendJson(response, 404, { error: "Compte introuvable." });
        return;
      }
      if (payload.active === false && target.id === admin.id) {
        sendJson(response, 400, { error: "Impossible de désactiver votre propre compte." });
        return;
      }

      let nextEmail = target.email;
      if (payload.email !== undefined) {
        nextEmail = normalizeEmail(payload.email);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
          sendJson(response, 400, { error: "Adresse e-mail invalide." });
          return;
        }
        const conflict = findUserByEmail(nextEmail);
        if (conflict && conflict.id !== target.id) {
          sendJson(response, 409, { error: "Cette adresse e-mail est déjà utilisée par un autre compte." });
          return;
        }
      }

      const updatedUsers = users.map((item) => item.id === target.id ? {
        ...item,
        email: nextEmail,
        jobTitle: payload.jobTitle !== undefined ? String(payload.jobTitle || "").trim() : item.jobTitle,
        active: payload.active !== undefined ? payload.active !== false : item.active
      } : item);
      writeUsers(updatedUsers);
      sendJson(response, 200, { user: publicUser(updatedUsers.find((item) => item.id === target.id)) });
      return;
    }

    if (url.pathname === "/api/orders" && request.method === "PUT") {
      if (!requireAdminCode(request, response)) {
        return;
      }

      const previousOrders = readOrders();
      const payload = JSON.parse(await readBody(request));
      const orders = Array.isArray(payload) ? payload.map((order) => ({
        id: String(order.id || Date.now()),
        title: String(order.title || "Commande").trim(),
        type: String(order.type || "Commande").trim(),
        description: String(order.description || "").trim(),
        pharmacyMessage: String(order.pharmacyMessage || "").trim(),
        deliveryDate: String(order.deliveryDate || "").trim(),
        imageData: String(order.imageData || ""),
        imageData2: String(order.imageData2 || ""),
        closed: Boolean(order.closed),
        draft: Boolean(order.draft),
        periods: Array.isArray(order.periods) ? order.periods.map((period) => ({
          id: String(period.id || Date.now()),
          startDate: String(period.startDate || "").trim(),
          endDate: String(period.endDate || "").trim()
        })).filter((period) => period.startDate) : [],
        template: normalizeTemplate(order.template)
      })) : [];
      writeOrders(orders);
      sendJson(response, 200, orders);

      // Opérations qui viennent tout juste de passer à "clôturée" (pas celles déjà
      // clôturées avant cet appel) : envoi de l'e-mail récap, en tâche de fond —
      // ne doit jamais faire échouer la sauvegarde de la campagne.
      const justClosed = orders.filter((order) => {
        const previous = previousOrders.find((item) => item.id === order.id);
        return order.closed && !(previous && previous.closed);
      });
      justClosed.forEach((campaign) => {
        notifyCampaignClosed(campaign).catch((error) => {
          console.error(`[preco] échec de l'e-mail de clôture pour "${campaign.title}" :`, error.message);
        });
      });
      return;
    }

    if (url.pathname === "/api/polls" && request.method === "PUT") {
      if (!requireAdminCode(request, response)) {
        return;
      }

      const payload = JSON.parse(await readBody(request));
      const polls = Array.isArray(payload) ? payload.map((poll) => {
        const questions = Array.isArray(poll.questions) ? poll.questions.map((question, index) => {
          const type = ["choix_unique", "choix_multiple", "texte_libre"].includes(question.type) ? question.type : "choix_unique";
          return {
            id: String(question.id || `question-${index + 1}`),
            label: String(question.label || "").trim(),
            type,
            options: type === "texte_libre" ? [] : (Array.isArray(question.options) ? question.options.map((option) => String(option || "").trim()).filter(Boolean) : [])
          };
        }).filter((question) => question.type === "texte_libre" || question.options.length) : [];
        return {
          id: String(poll.id || Date.now()),
          question: String(poll.question || "Sondage").trim(),
          type: "Sondage",
          category: poll.category === "satisfaction" ? "satisfaction" : "sondage",
          options: Array.isArray(poll.options) ? poll.options.map((option) => String(option || "").trim()).filter(Boolean) : [],
          questions,
          freeTextLabel: String(poll.freeTextLabel || "").trim(),
          freeTextRequired: Boolean(poll.freeTextRequired),
          imageData: String(poll.imageData || ""),
          draft: Boolean(poll.draft),
          closed: Boolean(poll.closed)
        };
      }).filter((poll) => poll.question && (poll.options.length || poll.questions.length)) : [];
      writePolls(polls);
      sendJson(response, 200, polls);
      return;
    }

    if (url.pathname === "/api/order-template" && request.method === "PUT") {
      if (!requireAdminCode(request, response)) {
        return;
      }

      const payload = JSON.parse(await readBody(request));
      const template = normalizeTemplate(payload);

      writeOrderTemplate(template);
      sendJson(response, 200, template);
      return;
    }

    if (url.pathname === "/api/poll-responses" && request.method === "GET") {
      if (!requireAdminCode(request, response)) {
        return;
      }
      sendJson(response, 200, latestPollResponses(readPollResponses()));
      return;
    }

    if (url.pathname === "/api/info-responses" && request.method === "GET") {
      if (!requireAdminCode(request, response)) {
        return;
      }
      sendJson(response, 200, latestInfoResponses(readInfoResponses()));
      return;
    }

    if (url.pathname === "/api/validation-responses" && request.method === "GET") {
      if (!requireAdminCode(request, response)) {
        return;
      }
      sendJson(response, 200, publicValidationResponses(latestValidationResponses(readValidationResponses())));
      return;
    }

    if (url.pathname === "/api/validation-summary" && request.method === "GET") {
      if (!requireAdminCode(request, response)) {
        return;
      }
      sendJson(response, 200, validationSummary());
      return;
    }

    if (url.pathname === "/api/responses" && request.method === "PUT") {
      if (!requireAdminCode(request, response)) {
        return;
      }

      const payload = JSON.parse(await readBody(request));
      const responses = Array.isArray(payload) ? payload.map((item) => ({
        id: String(item.id || Date.now()),
        campaignId: String(item.campaignId || "herboristerie"),
        campaignTitle: String(item.campaignTitle || "Herboristerie"),
        periodId: String(item.periodId || "").trim(),
        createdAt: String(item.createdAt || new Date().toLocaleString("fr-FR")),
        updatedAt: String(item.updatedAt || ""),
        pharmacyId: String(item.pharmacyId || "").trim(),
        pharmacyName: String(item.pharmacyName || "").trim(),
        interest: String(item.interest || "").trim(),
        products: normalizeResponseProducts(item.products, String(item.campaignId || "herboristerie")),
        notes: String(item.notes || "").trim()
      })) : [];
      const invalid = responses
        .map((item) => validateProductsAgainstColisage(item.products, colisageColumnForCampaign(item.campaignId)))
        .find(Boolean);
      if (invalid) {
        sendJson(response, 400, { error: invalid });
        return;
      }
      const latest = latestResponses(responses);
      writeResponses(latest);
      sendJson(response, 200, latest);
      return;
    }

    if (url.pathname === "/api/poll-responses" && request.method === "PUT") {
      if (!requireAdminCode(request, response)) {
        return;
      }

      const payload = JSON.parse(await readBody(request));
      const responses = Array.isArray(payload) ? payload.map((item) => ({
        id: String(item.id || Date.now()),
        pollId: String(item.pollId || ""),
        pollQuestion: String(item.pollQuestion || "").trim(),
        createdAt: String(item.createdAt || new Date().toLocaleString("fr-FR")),
        updatedAt: String(item.updatedAt || ""),
        pharmacyId: String(item.pharmacyId || "").trim(),
        pharmacyName: String(item.pharmacyName || "").trim(),
        answer: String(item.answer || "").trim(),
        answers: normalizePollAnswersMap(item.answers),
        freeText: String(item.freeText || "").trim()
      })) : [];
      const latest = latestPollResponses(responses);
      writePollResponses(latest);
      sendJson(response, 200, latest);
      return;
    }

    if (url.pathname === "/api/info-responses" && request.method === "PUT") {
      if (!requireAdminCode(request, response)) {
        return;
      }

      const payload = JSON.parse(await readBody(request));
      const responses = Array.isArray(payload) ? payload.map(normalizeInfoResponse) : [];
      const latest = latestInfoResponses(responses);
      writeInfoResponses(latest);
      sendJson(response, 200, latest);
      return;
    }

    if (url.pathname === "/api/validation-responses" && request.method === "PUT") {
      if (!requireAdminCode(request, response)) {
        return;
      }

      const payload = JSON.parse(await readBody(request));
      const responses = Array.isArray(payload) ? payload.map(normalizeValidationResponse) : [];
      const latest = latestValidationResponses(responses);
      writeValidationResponses(latest);
      sendJson(response, 200, latest);
      return;
    }

    if (url.pathname === "/api/pharmacy-poll-responses" && request.method === "GET") {
      const pharmacyId = url.searchParams.get("pharmacyId");
      const pharmacyName = normalizeLookup(url.searchParams.get("pharmacyName"));
      const responses = latestPollResponses(readPollResponses())
        .filter((item) => {
          if (pharmacyId && item.pharmacyId === pharmacyId) return true;
          return pharmacyName && normalizeLookup(item.pharmacyName) === pharmacyName;
        })
        .map((item) => ({
          pollId: item.pollId,
          answer: item.answer,
          answers: item.answers || null
        }));
      sendJson(response, 200, responses);
      return;
    }

    if (url.pathname === "/api/pharmacy-info-responses" && request.method === "GET") {
      const pharmacyId = url.searchParams.get("pharmacyId");
      const pharmacyName = normalizeLookup(url.searchParams.get("pharmacyName"));
      const responses = latestInfoResponses(readInfoResponses())
        .filter((item) => {
          if (pharmacyId && item.pharmacyId === pharmacyId) return true;
          return pharmacyName && normalizeLookup(item.pharmacyName) === pharmacyName;
        });
      sendJson(response, 200, publicValidationResponses(responses));
      return;
    }

    if (url.pathname === "/api/pharmacy-validation-responses" && request.method === "GET") {
      const pharmacyId = url.searchParams.get("pharmacyId");
      const pharmacyName = normalizeLookup(url.searchParams.get("pharmacyName"));
      const responses = latestValidationResponses(readValidationResponses())
        .filter((item) => {
          if (pharmacyId && item.pharmacyId === pharmacyId) return true;
          return pharmacyName && normalizeLookup(item.pharmacyName) === pharmacyName;
        });
      sendJson(response, 200, responses);
      return;
    }

    if (url.pathname === "/api/responses" && request.method === "POST") {
      const payload = JSON.parse(await readBody(request));
      const responses = readResponses();
      const campaignId = String(payload.campaignId || "herboristerie");
      const products = normalizeResponseProducts(payload.products, campaignId);
      const invalid = validateProductsAgainstColisage(products, colisageColumnForCampaign(campaignId));
      if (invalid) {
        sendJson(response, 400, { error: invalid });
        return;
      }

      const incoming = {
        id: String(payload.id || Date.now()),
        campaignId,
        campaignTitle: String(payload.campaignTitle || "Herboristerie"),
        periodId: String(payload.periodId || "").trim(),
        createdAt: String(payload.createdAt || new Date().toLocaleString("fr-FR")),
        updatedAt: String(payload.updatedAt || ""),
        pharmacyId: String(payload.pharmacyId || "").trim(),
        pharmacyName: String(payload.pharmacyName || "").trim(),
        interest: String(payload.interest || "").trim(),
        products,
        notes: String(payload.notes || "").trim()
      };
      const pharmacies = readPharmacies();
      const existing = responses.find((item) => responseOwnerKey(item, pharmacies) === responseOwnerKey(incoming, pharmacies));
      const now = new Date().toLocaleString("fr-FR");
      const savedResponse = {
        ...incoming,
        id: existing?.id || incoming.id,
        createdAt: existing?.createdAt || incoming.createdAt || now,
        updatedAt: existing ? now : ""
      };
      const updatedResponses = responses.filter((item) => responseOwnerKey(item, pharmacies) !== responseOwnerKey(savedResponse, pharmacies));
      updatedResponses.push(savedResponse);
      writeResponses(updatedResponses);
      sendJson(response, 201, savedResponse);
      return;
    }

    if (url.pathname === "/api/poll-responses" && request.method === "POST") {
      const payload = JSON.parse(await readBody(request));
      const responses = readPollResponses();
      const poll = readPolls().find((item) => item.id === String(payload.pollId || ""));
      const cleanedAnswers = stripMealAnswerIfAbsent(poll, normalizePollAnswersMap(payload.answers));
      const recomputedAnswer = poll ? pollAnswersToTextMeta(poll, cleanedAnswers) : "";
      const incoming = {
        id: String(payload.id || Date.now()),
        pollId: String(payload.pollId || ""),
        pollQuestion: String(payload.pollQuestion || "").trim(),
        createdAt: String(payload.createdAt || new Date().toLocaleString("fr-FR")),
        updatedAt: String(payload.updatedAt || ""),
        pharmacyId: String(payload.pharmacyId || "").trim(),
        pharmacyName: String(payload.pharmacyName || "").trim(),
        answer: recomputedAnswer || String(payload.answer || "").trim(),
        answers: cleanedAnswers,
        freeText: String(payload.freeText || "").trim()
      };
      const pharmacies = readPharmacies();
      const existing = responses.find((item) => pollResponseOwnerKey(item, pharmacies) === pollResponseOwnerKey(incoming, pharmacies));
      const now = new Date().toLocaleString("fr-FR");
      const savedResponse = {
        ...incoming,
        id: existing?.id || incoming.id,
        createdAt: existing?.createdAt || incoming.createdAt || now,
        updatedAt: existing ? now : ""
      };
      const updatedResponses = responses.filter((item) => pollResponseOwnerKey(item, pharmacies) !== pollResponseOwnerKey(savedResponse, pharmacies));
      updatedResponses.push(savedResponse);
      writePollResponses(updatedResponses);
      sendJson(response, 201, latestPollResponses(updatedResponses));
      return;
    }

    if (url.pathname === "/api/info-responses" && request.method === "POST") {
      const payload = JSON.parse(await readBody(request));
      const responses = readInfoResponses();
      const incoming = normalizeInfoResponse(payload);
      const pharmacies = readPharmacies();
      const existing = responses.find((item) => infoResponseOwnerKey(item, pharmacies) === infoResponseOwnerKey(incoming, pharmacies));
      const now = new Date().toLocaleString("fr-FR");
      const savedResponse = {
        ...incoming,
        id: existing?.id || incoming.id,
        createdAt: existing?.createdAt || incoming.createdAt || now,
        updatedAt: existing ? now : ""
      };
      const updatedResponses = responses.filter((item) => infoResponseOwnerKey(item, pharmacies) !== infoResponseOwnerKey(savedResponse, pharmacies));
      updatedResponses.push(savedResponse);
      writeInfoResponses(updatedResponses);
      sendJson(response, 201, savedResponse);
      return;
    }

    if (url.pathname === "/api/validation-responses" && request.method === "POST") {
      const payload = JSON.parse(await readBody(request));
      const responses = readValidationResponses();
      const incoming = normalizeValidationResponse(payload);
      const pharmacies = readPharmacies();
      const existing = responses.find((item) => validationResponseOwnerKey(item, pharmacies) === validationResponseOwnerKey(incoming, pharmacies));
      const now = new Date().toLocaleString("fr-FR");
      const savedResponse = {
        ...incoming,
        id: existing?.id || incoming.id,
        createdAt: existing?.createdAt || incoming.createdAt || now,
        updatedAt: existing ? now : ""
      };
      const updatedResponses = responses.filter((item) => validationResponseOwnerKey(item, pharmacies) !== validationResponseOwnerKey(savedResponse, pharmacies));
      updatedResponses.push(savedResponse);
      writeValidationResponses(updatedResponses);
      sendJson(response, 201, publicValidationResponse(savedResponse));
      return;
    }

    if (url.pathname === "/api/responses" && request.method === "DELETE") {
      if (!requireAdminCode(request, response)) {
        return;
      }
      writeResponses([]);
      sendJson(response, 200, []);
      return;
    }

    if (url.pathname.startsWith("/api/responses/") && request.method === "DELETE") {
      if (!requireAdminCode(request, response)) {
        return;
      }

      const responseId = decodeURIComponent(url.pathname.replace("/api/responses/", ""));
      const responses = readResponses().filter((item) => item.id !== responseId);
      writeResponses(responses);
      sendJson(response, 200, responses);
      return;
    }

    if (url.pathname === "/api/export.xls" && request.method === "GET") {
      if (!requireAdminCode(request, response, url.searchParams.get("code"))) {
        return;
      }
      const campaignId = url.searchParams.get("campaign");
      const periodId = url.searchParams.get("period");
      const responses = latestResponses(readResponses())
        .filter((item) => responseMatchesCampaign(item, campaignId))
        .filter((item) => responseMatchesPeriod(item, periodId));
      sendExcel(response, responses);
      return;
    }

    if (url.pathname === "/api/poll-export.xls" && request.method === "GET") {
      if (!requireAdminCode(request, response, url.searchParams.get("code"))) {
        return;
      }
      const pollId = url.searchParams.get("poll");
      const responses = pollId
        ? latestPollResponses(readPollResponses()).filter((item) => responseMatchesPoll(item, pollId))
        : latestPollResponses(readPollResponses());
      const poll = pollId ? readPolls().find((item) => item.id === pollId) : null;
      sendPollExcel(response, responses, poll);
      return;
    }

    if (url.pathname === "/api/info-export.xls" && request.method === "GET") {
      if (!requireAdminCode(request, response, url.searchParams.get("code"))) {
        return;
      }
      const formId = url.searchParams.get("form");
      const responses = formId
        ? latestInfoResponses(readInfoResponses()).filter((item) => responseMatchesInfoForm(item, formId))
        : latestInfoResponses(readInfoResponses());
      sendInfoExcel(response, responses);
      return;
    }

    // --- Attestation d'engagement (module séparé de "Validation") ---------

    if (url.pathname === "/api/attestations" && request.method === "GET") {
      if (!requireAdminCode(request, response)) return;
      sendJson(response, 200, readAttestation());
      return;
    }

    if (url.pathname === "/api/attestations" && request.method === "PUT") {
      if (!requireAdminCode(request, response)) return;
      const payload = JSON.parse(await readBody(request));
      sendJson(response, 200, writeAttestation(payload));
      return;
    }

    // Pharmacie : sa fiche pré-remplie + sa réponse (si déjà signée).
    if (url.pathname === "/api/attestation" && request.method === "GET") {
      const user = requireAuth(request, response, PHARMACY_SESSION_ROLES.concat(["soguasphar_admin"]));
      if (!user) return;
      const attestation = readAttestation();
      const pharmacyId = url.searchParams.get("pharmacyId") || user.pharmacyId;
      if (!requireSamePharmacy(user, pharmacyId)) {
        sendJson(response, 403, { error: "Accès refusé" });
        return;
      }
      const document = attestation.documents.find((item) => item.pharmacyId === pharmacyId) || null;
      const existingResponse = readAttestationResponses().find((item) => item.pharmacyId === pharmacyId) || null;
      sendJson(response, 200, {
        title: attestation.title,
        year: attestation.year,
        description: attestation.description,
        cotisationHT: attestation.cotisationHT,
        echeances: attestation.echeances,
        draft: attestation.draft,
        archived: attestation.archived,
        document,
        response: existingResponse
      });
      return;
    }

    // Pharmacie : aperçu du document complet (texte entier de l'attestation),
    // AVANT signature — pour qu'elle puisse le lire en entier et contrôler les
    // informations, pas seulement remplir un petit formulaire à l'aveugle
    // (demandé par Hélène le 13/10/2026). Ne sauvegarde rien, génère juste un
    // PDF à la volée avec les informations actuelles (formulaire ou déjà
    // enregistrées), sans signature.
    if (url.pathname === "/api/attestation/preview" && request.method === "GET") {
      const user = requireAuth(request, response, PHARMACY_SESSION_ROLES);
      if (!user) return;
      const pharmacyId = user.pharmacyId;
      const attestation = readAttestation();
      const document = attestation.documents.find((item) => item.pharmacyId === pharmacyId);
      if (!document) {
        sendJson(response, 404, { error: "Aucune attestation préparée pour votre pharmacie" });
        return;
      }
      const existingResponse = readAttestationResponses().find((item) => item.pharmacyId === pharmacyId) || null;
      const previewResponse = {
        societeExploitante: url.searchParams.get("societeExploitante") || existingResponse?.societeExploitante || document.societeExploitante,
        siren: url.searchParams.get("siren") || existingResponse?.siren || document.siren,
        representant: url.searchParams.get("representant") || existingResponse?.representant || document.representant,
        qualite: url.searchParams.get("qualite") || existingResponse?.qualite || document.qualite,
        faitA: url.searchParams.get("faitA") || existingResponse?.faitA || "",
        signedAt: existingResponse?.signedAt || "(à venir)"
      };
      let pdfBuffer;
      try {
        const html = buildAttestationHtml({ ...document, year: attestation.year, echeances: attestation.echeances, cotisationHT: attestation.cotisationHT }, previewResponse, "");
        pdfBuffer = await htmlToPdf(html);
      } catch (error) {
        sendJson(response, 502, { error: `Aperçu du document impossible : ${error.message}` });
        return;
      }
      response.writeHead(200, { "Content-Type": "application/pdf", "Content-Disposition": "inline; filename=\"attestation-apercu.pdf\"" });
      response.end(pdfBuffer);
      return;
    }

    // Pharmacie : confirme/complète ses infos, ajoute la photo du tampon et
    // de la signature -> génère le PDF final via le service commun PDF.
    if (url.pathname === "/api/attestation/sign" && request.method === "POST") {
      const user = requireAuth(request, response, PHARMACY_SESSION_ROLES);
      if (!user) return;
      const payload = JSON.parse(await readBody(request));
      const pharmacyId = user.pharmacyId;
      const attestation = readAttestation();
      const document = attestation.documents.find((item) => item.pharmacyId === pharmacyId);
      if (!document) {
        sendJson(response, 404, { error: "Aucune attestation préparée pour votre pharmacie" });
        return;
      }
      if (attestation.draft || attestation.archived) {
        sendJson(response, 409, { error: "Cette attestation n'est pas ouverte à la signature" });
        return;
      }
      const signatureDataUrl = String(payload.signatureImage || "");
      if (!/^data:image\/(png|jpe?g);base64,/.test(signatureDataUrl)) {
        sendJson(response, 400, { error: "Photo de signature/tampon manquante ou invalide" });
        return;
      }
      const nowLabel = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
      const responses = readAttestationResponses();
      const existing = responses.find((item) => item.pharmacyId === pharmacyId);
      const savedResponse = normalizeAttestationResponse({
        ...existing,
        id: existing?.id,
        documentId: document.id,
        pharmacyId,
        pharmacyName: document.pharmacyName,
        societeExploitante: payload.societeExploitante || document.societeExploitante,
        siren: payload.siren || document.siren,
        representant: payload.representant || document.representant,
        qualite: payload.qualite || document.qualite,
        faitA: payload.faitA || "",
        signedAt: nowLabel,
        createdAt: existing?.createdAt,
        updatedAt: new Date().toLocaleString("fr-FR")
      });

      let pdfBuffer;
      try {
        const html = buildAttestationHtml({ ...document, year: attestation.year, echeances: attestation.echeances, cotisationHT: attestation.cotisationHT }, savedResponse, signatureDataUrl);
        pdfBuffer = await htmlToPdf(html);
      } catch (error) {
        sendJson(response, 502, { error: `Génération du PDF impossible : ${error.message}` });
        return;
      }

      if (!fs.existsSync(ATTESTATION_PDF_DIR)) fs.mkdirSync(ATTESTATION_PDF_DIR, { recursive: true });
      const pdfFileName = `${pharmacyId}.pdf`;
      fs.writeFileSync(path.join(ATTESTATION_PDF_DIR, pdfFileName), pdfBuffer);
      savedResponse.pdfUrl = `/attestations-2027/${pdfFileName}`;

      const updatedResponses = existing
        ? responses.map((item) => (item.pharmacyId === pharmacyId ? savedResponse : item))
        : [...responses, savedResponse];
      writeAttestationResponses(updatedResponses);
      sendJson(response, 200, savedResponse);
      return;
    }

    // Admin : suivi de qui a signé / pas encore.
    if (url.pathname === "/api/attestation-responses" && request.method === "GET") {
      if (!requireAdminCode(request, response)) return;
      sendJson(response, 200, readAttestationResponses());
      return;
    }

    serveStatic(request, response, url.pathname);
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`SOGUASPHAR demandes pharmacies: http://localhost:${PORT}`);
});

// Vérification des relances : une première fois peu après le démarrage, puis
// une fois par jour — UNIQUEMENT si explicitement activé (voir
// AUTO_REMINDERS_ENABLED tout en haut du fichier). Par défaut, désactivé :
// rien ne part tout seul tant qu'on ne l'a pas sciemment allumé en ligne.
// Heure Guadeloupe = UTC-4 toute l'année (pas de changement d'heure été/hiver
// là-bas) -> 8h00 Guadeloupe = 12h00 UTC. Calcule le délai jusqu'à la
// prochaine occurrence de 12h00 UTC (aujourd'hui si pas encore passé, sinon
// demain), puis reprogramme toutes les 24h pile à cette même heure.
function msUntilNextGuadeloupe8am() {
  const now = new Date();
  let target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0, 0));
  if (target.getTime() <= now.getTime()) target = new Date(target.getTime() + 24 * 60 * 60 * 1000);
  return target.getTime() - now.getTime();
}

if (AUTO_REMINDERS_ENABLED) {
  const delay = msUntilNextGuadeloupe8am();
  console.log(`[preco] relances automatiques ACTIVÉES (ENABLE_AUTO_REMINDERS=true) : prochaine vérification dans ${Math.round(delay / 60000)} min (8h00 heure Guadeloupe)`);
  setTimeout(() => {
    checkReminders();
    setInterval(() => { checkReminders(); }, 24 * 60 * 60 * 1000);
  }, delay);
} else {
  console.log("[preco] relances automatiques désactivées (ENABLE_AUTO_REMINDERS absent ou différent de \"true\")");
}
