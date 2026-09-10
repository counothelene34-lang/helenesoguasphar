const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 56651);
const ADMIN_CODE = process.env.ADMIN_CODE || "SOGUASPHAR2026";
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

function readPharmacies() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(PHARMACIES_FILE, "utf8") || "[]");
}

function writePharmacies(pharmacies) {
  ensureDataFile();
  fs.writeFileSync(PHARMACIES_FILE, JSON.stringify(pharmacies, null, 2), "utf8");
}

function defaultValidation() {
  return {
    title: "",
    description: "",
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
function sendExcel(response, responses) {
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

  const workbook = `
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

  response.writeHead(200, {
    "Content-Type": "application/vnd.ms-excel; charset=utf-8",
    "Content-Disposition": `attachment; filename="recap-soguasphar-${new Date().toISOString().slice(0, 10)}.xls"`
  });
  response.end(workbook);
}

function sendPollExcel(response, responses) {
  const headings = ["Date", "Pharmacie", "Question", "Réponse", "Commentaire / précision"];
  const rows = responses.map((row) => `
    <tr>
      <td>${escapeHtml(row.createdAt)}</td>
      <td>${escapeHtml(row.pharmacyName)}</td>
      <td>${escapeHtml(row.pollQuestion)}</td>
      <td>${escapeHtml(row.answer)}</td>
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
    if (url.pathname === "/api/responses" && request.method === "GET") {
      if (request.headers["x-admin-code"] !== ADMIN_CODE) {
        sendJson(response, 401, { error: "Code administrateur incorrect" });
        return;
      }
      sendJson(response, 200, latestResponses(readResponses()));
      return;
    }

    if (url.pathname === "/api/pharmacy-responses" && request.method === "GET") {
      const pharmacyId = url.searchParams.get("pharmacyId");
      const pharmacyName = normalizeLookup(url.searchParams.get("pharmacyName"));
      const responses = latestResponses(readResponses()).filter((item) => {
        if (pharmacyId && item.pharmacyId === pharmacyId) return true;
        return pharmacyName && normalizeLookup(item.pharmacyName) === pharmacyName;
      });
      sendJson(response, 200, responses);
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

    if (url.pathname === "/api/polls" && request.method === "GET") {
      sendJson(response, 200, readPolls());
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
      if (request.headers["x-admin-code"] !== ADMIN_CODE) {
        sendJson(response, 401, { error: "Code administrateur incorrect" });
        return;
      }

      const payload = JSON.parse(await readBody(request));
      const validation = writeValidation(payload || {});
      sendJson(response, 200, validation);
      return;
    }

    if (url.pathname === "/api/info-forms" && request.method === "PUT") {
      if (request.headers["x-admin-code"] !== ADMIN_CODE) {
        sendJson(response, 401, { error: "Code administrateur incorrect" });
        return;
      }

      const payload = JSON.parse(await readBody(request));
      const forms = Array.isArray(payload) ? payload.map((item) => ({
        id: String(item.id || Date.now()),
        title: String(item.title || "").trim(),
        type: String(item.type || "Fiche pharmacie").trim(),
        intro: String(item.intro || "").trim(),
        closed: Boolean(item.closed)
      })).filter((item) => item.id && item.title) : [];
      writeInfoForms(forms);
      sendJson(response, 200, forms);
      return;
    }

    if (url.pathname === "/api/pharmacies" && request.method === "GET") {
      const pharmacies = readPharmacies();
      if (request.headers["x-admin-code"] === ADMIN_CODE) {
        sendJson(response, 200, pharmacies);
        return;
      }
      sendJson(response, 200, { count: pharmacies.length });
      return;
    }

    if (url.pathname === "/api/pharmacies" && request.method === "PUT") {
      if (request.headers["x-admin-code"] !== ADMIN_CODE) {
        sendJson(response, 401, { error: "Code administrateur incorrect" });
        return;
      }

      const payload = JSON.parse(await readBody(request));
      const pharmacies = Array.isArray(payload) ? payload.map((pharmacy) => ({
        id: String(pharmacy.id || Date.now()),
        name: String(pharmacy.name || "").trim(),
        password: String(pharmacy.password || "").trim(),
        active: pharmacy.active !== false,
        mustChangePassword: pharmacy.mustChangePassword !== false,
        passwordResetRequested: Boolean(pharmacy.passwordResetRequested),
        passwordResetRequestedAt: String(pharmacy.passwordResetRequestedAt || "").trim()
      })).filter((pharmacy) => pharmacy.name && pharmacy.password) : [];
      writePharmacies(pharmacies);
      sendJson(response, 200, pharmacies);
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
      const payload = JSON.parse(await readBody(request));
      const password = String(payload.password || "").trim();
      const pharmacy = readPharmacies().find((item) => item.active !== false && item.password === password);
      if (!pharmacy) {
        sendJson(response, 401, { error: "Mot de passe pharmacie incorrect" });
        return;
      }
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
      const pharmacies = readPharmacies();
      const pharmacy = pharmacies.find((item) => item.active !== false && item.id === pharmacyId && item.password === oldPassword);

      if (!pharmacy) {
        sendJson(response, 401, { error: "Mot de passe actuel incorrect" });
        return;
      }

      if (newPassword.length < 6) {
        sendJson(response, 400, { error: "Le nouveau mot de passe doit contenir au moins 6 caractères" });
        return;
      }

      const updatedPharmacies = pharmacies.map((item) => item.id === pharmacy.id ? {
        ...item,
        password: newPassword,
        mustChangePassword: false,
        passwordResetRequested: false,
        passwordResetRequestedAt: ""
      } : item);
      writePharmacies(updatedPharmacies);
      sendJson(response, 200, { id: pharmacy.id, name: pharmacy.name, mustChangePassword: false });
      return;
    }

    if (url.pathname === "/api/orders" && request.method === "PUT") {
      if (request.headers["x-admin-code"] !== ADMIN_CODE) {
        sendJson(response, 401, { error: "Code administrateur incorrect" });
        return;
      }

      const payload = JSON.parse(await readBody(request));
      const orders = Array.isArray(payload) ? payload.map((order) => ({
        id: String(order.id || Date.now()),
        title: String(order.title || "Commande").trim(),
        type: String(order.type || "Commande").trim(),
        description: String(order.description || "").trim(),
        pharmacyMessage: String(order.pharmacyMessage || "").trim(),
        imageData: String(order.imageData || ""),
        imageData2: String(order.imageData2 || ""),
        closed: Boolean(order.closed),
        periods: Array.isArray(order.periods) ? order.periods.map((period) => ({
          id: String(period.id || Date.now()),
          startDate: String(period.startDate || "").trim(),
          endDate: String(period.endDate || "").trim()
        })).filter((period) => period.startDate) : [],
        template: normalizeTemplate(order.template)
      })) : [];
      writeOrders(orders);
      sendJson(response, 200, orders);
      return;
    }

    if (url.pathname === "/api/polls" && request.method === "PUT") {
      if (request.headers["x-admin-code"] !== ADMIN_CODE) {
        sendJson(response, 401, { error: "Code administrateur incorrect" });
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
          closed: Boolean(poll.closed)
        };
      }).filter((poll) => poll.question && (poll.options.length || poll.questions.length)) : [];
      writePolls(polls);
      sendJson(response, 200, polls);
      return;
    }

    if (url.pathname === "/api/order-template" && request.method === "PUT") {
      if (request.headers["x-admin-code"] !== ADMIN_CODE) {
        sendJson(response, 401, { error: "Code administrateur incorrect" });
        return;
      }

      const payload = JSON.parse(await readBody(request));
      const template = normalizeTemplate(payload);

      writeOrderTemplate(template);
      sendJson(response, 200, template);
      return;
    }

    if (url.pathname === "/api/poll-responses" && request.method === "GET") {
      if (request.headers["x-admin-code"] !== ADMIN_CODE) {
        sendJson(response, 401, { error: "Code administrateur incorrect" });
        return;
      }
      sendJson(response, 200, latestPollResponses(readPollResponses()));
      return;
    }

    if (url.pathname === "/api/info-responses" && request.method === "GET") {
      if (request.headers["x-admin-code"] !== ADMIN_CODE) {
        sendJson(response, 401, { error: "Code administrateur incorrect" });
        return;
      }
      sendJson(response, 200, latestInfoResponses(readInfoResponses()));
      return;
    }

    if (url.pathname === "/api/validation-responses" && request.method === "GET") {
      if (request.headers["x-admin-code"] !== ADMIN_CODE) {
        sendJson(response, 401, { error: "Code administrateur incorrect" });
        return;
      }
      sendJson(response, 200, publicValidationResponses(latestValidationResponses(readValidationResponses())));
      return;
    }

    if (url.pathname === "/api/validation-summary" && request.method === "GET") {
      if (request.headers["x-admin-code"] !== ADMIN_CODE) {
        sendJson(response, 401, { error: "Code administrateur incorrect" });
        return;
      }
      sendJson(response, 200, validationSummary());
      return;
    }

    if (url.pathname === "/api/responses" && request.method === "PUT") {
      if (request.headers["x-admin-code"] !== ADMIN_CODE) {
        sendJson(response, 401, { error: "Code administrateur incorrect" });
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
      if (request.headers["x-admin-code"] !== ADMIN_CODE) {
        sendJson(response, 401, { error: "Code administrateur incorrect" });
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
      if (request.headers["x-admin-code"] !== ADMIN_CODE) {
        sendJson(response, 401, { error: "Code administrateur incorrect" });
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
      if (request.headers["x-admin-code"] !== ADMIN_CODE) {
        sendJson(response, 401, { error: "Code administrateur incorrect" });
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
      if (request.headers["x-admin-code"] !== ADMIN_CODE) {
        sendJson(response, 401, { error: "Code administrateur incorrect" });
        return;
      }
      writeResponses([]);
      sendJson(response, 200, []);
      return;
    }

    if (url.pathname.startsWith("/api/responses/") && request.method === "DELETE") {
      if (request.headers["x-admin-code"] !== ADMIN_CODE) {
        sendJson(response, 401, { error: "Code administrateur incorrect" });
        return;
      }

      const responseId = decodeURIComponent(url.pathname.replace("/api/responses/", ""));
      const responses = readResponses().filter((item) => item.id !== responseId);
      writeResponses(responses);
      sendJson(response, 200, responses);
      return;
    }

    if (url.pathname === "/api/export.xls" && request.method === "GET") {
      if (url.searchParams.get("code") !== ADMIN_CODE) {
        sendJson(response, 401, { error: "Code administrateur incorrect" });
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
      if (url.searchParams.get("code") !== ADMIN_CODE) {
        sendJson(response, 401, { error: "Code administrateur incorrect" });
        return;
      }
      const pollId = url.searchParams.get("poll");
      const responses = pollId
        ? latestPollResponses(readPollResponses()).filter((item) => responseMatchesPoll(item, pollId))
        : latestPollResponses(readPollResponses());
      sendPollExcel(response, responses);
      return;
    }

    if (url.pathname === "/api/info-export.xls" && request.method === "GET") {
      if (url.searchParams.get("code") !== ADMIN_CODE) {
        response.writeHead(401);
        response.end("Code administrateur incorrect");
        return;
      }
      const formId = url.searchParams.get("form");
      const responses = formId
        ? latestInfoResponses(readInfoResponses()).filter((item) => responseMatchesInfoForm(item, formId))
        : latestInfoResponses(readInfoResponses());
      sendInfoExcel(response, responses);
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
