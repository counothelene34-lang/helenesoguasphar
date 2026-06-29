const STORAGE_KEY = "soguasphar_pharmacy_requests";
const ORDER_TEMPLATE_KEY = "soguasphar_order_template";
const POLL_RESPONSES_KEY = "soguasphar_poll_responses";
const POLL_ANSWERED_KEY = "soguasphar_answered_polls";
const ADMIN_CODE = "SOGUASPHAR2026";
const API_AVAILABLE = location.protocol === "http:" || location.protocol === "https:";
const PHARMACY_SESSION_KEY = "soguasphar_current_pharmacy";

const form = document.querySelector("#requestForm");
const pharmacyGate = document.querySelector("#pharmacyGate");
const pharmacyLoginForm = document.querySelector("#pharmacyLoginForm");
const pharmacyPassword = document.querySelector("#pharmacyPassword");
const pharmacyPasswordChangeForm = document.querySelector("#pharmacyPasswordChangeForm");
const newPharmacyPassword = document.querySelector("#newPharmacyPassword");
const confirmPharmacyPassword = document.querySelector("#confirmPharmacyPassword");
const pharmacyLoginMessage = document.querySelector("#pharmacyLoginMessage");
const pharmacySessionBar = document.querySelector("#pharmacySessionBar");
const currentPharmacyName = document.querySelector("#currentPharmacyName");
const logoutPharmacyBtn = document.querySelector("#logoutPharmacyBtn");
const heroBand = document.querySelector(".hero-band");
const campaignPicker = document.querySelector("#campaignPicker");
const campaignCards = document.querySelector("#campaignCards");
const pollCards = document.querySelector("#pollCards");
const backToCampaignsBtn = document.querySelector("#backToCampaignsBtn");
const campaignNotice = document.querySelector("#campaignNotice");
const responseSuccess = document.querySelector("#responseSuccess");
const returnToMenuBtn = document.querySelector("#returnToMenuBtn");
const pollForm = document.querySelector("#pollForm");
const backToPollsBtn = document.querySelector("#backToPollsBtn");
const pollPharmacyName = document.querySelector("#pollPharmacyName");
const pollQuestionTitle = document.querySelector("#pollQuestionTitle");
const pollOptions = document.querySelector("#pollOptions");
const pollFreeTextBlock = document.querySelector("#pollFreeTextBlock");
const pollFreeTextLabel = document.querySelector("#pollFreeTextLabel");
const pollFreeText = document.querySelector("#pollFreeText");
const pollMessage = document.querySelector("#pollMessage");
const formMessage = document.querySelector("#formMessage");
const productRows = document.querySelector("#productRows");
const quantitySection = document.querySelector("#quantitySection");
const orderMessage = document.querySelector("#orderMessage");
const lineCount = document.querySelector("#lineCount");
const adminLogin = document.querySelector("#adminLogin");
const adminPanel = document.querySelector(".admin-panel");
const adminContent = document.querySelector("#adminContent");
const adminCampaignPicker = document.querySelector("#adminCampaignPicker");
const adminDashboardNav = document.querySelector("#adminDashboardNav");
const adminCampaignTitle = document.querySelector("#adminCampaignTitle");
const adminSectionIntro = document.querySelector("#adminSectionIntro");
const adminCampaignCards = document.querySelector("#adminCampaignCards");
const createCampaignForm = document.querySelector("#createCampaignForm");
const newCampaignTitle = document.querySelector("#newCampaignTitle");
const createPollForm = document.querySelector("#createPollForm");
const newPollQuestion = document.querySelector("#newPollQuestion");
const newPollOptions = document.querySelector("#newPollOptions");
const newPollFreeLabel = document.querySelector("#newPollFreeLabel");
const newPollFreeRequired = document.querySelector("#newPollFreeRequired");
const createPharmacyForm = document.querySelector("#createPharmacyForm");
const newPharmacyName = document.querySelector("#newPharmacyName");
const pharmacyAccountsList = document.querySelector("#pharmacyAccountsList");
const showClosedCampaignsBtn = document.querySelector("#showClosedCampaignsBtn");
const adminPollCards = document.querySelector("#adminPollCards");
const adminPollBlock = adminCampaignPicker.querySelector(".poll-picker-block");
const adminPollDetail = document.querySelector("#adminPollDetail");
const backToAdminPollsBtn = document.querySelector("#backToAdminPollsBtn");
const adminPollTitle = document.querySelector("#adminPollTitle");
const pollResultsSummary = document.querySelector("#pollResultsSummary");
const pollResponsesTable = document.querySelector("#pollResponsesTable");
const exportPollExcelBtn = document.querySelector("#exportPollExcelBtn");
const adminDetail = document.querySelector("#adminDetail");
const backToAdminCampaignsBtn = document.querySelector("#backToAdminCampaignsBtn");
const adminSelectedCampaignName = document.querySelector("#adminSelectedCampaignName");
const campaignPharmacyMessage = document.querySelector("#campaignPharmacyMessage");
const saveCampaignMessageBtn = document.querySelector("#saveCampaignMessageBtn");
const campaignImageBlock = document.querySelector("#campaignImageBlock");
const campaignImageLink = document.querySelector("#campaignImageLink");
const campaignImage = document.querySelector("#campaignImage");
const campaignImageBlock2 = document.querySelector("#campaignImageBlock2");
const campaignImageLink2 = document.querySelector("#campaignImageLink2");
const campaignImage2 = document.querySelector("#campaignImage2");
const campaignImageFile = document.querySelector("#campaignImageFile");
const campaignImageFile2 = document.querySelector("#campaignImageFile2");
const campaignImageAdminPreview = document.querySelector("#campaignImageAdminPreview");
const campaignImageAdminLink = document.querySelector("#campaignImageAdminLink");
const campaignImageAdmin = document.querySelector("#campaignImageAdmin");
const campaignImageAdminPreview2 = document.querySelector("#campaignImageAdminPreview2");
const campaignImageAdminLink2 = document.querySelector("#campaignImageAdminLink2");
const campaignImageAdmin2 = document.querySelector("#campaignImageAdmin2");
const campaignImageMessage = document.querySelector("#campaignImageMessage");
const removeCampaignImageBtn = document.querySelector("#removeCampaignImageBtn");
const removeCampaignImageBtn2 = document.querySelector("#removeCampaignImageBtn2");
const adminMessage = document.querySelector("#adminMessage");
const responsesTable = document.querySelector("#responsesTable");
const answeredPharmacies = document.querySelector("#answeredPharmacies");
const notInterestedPharmacies = document.querySelector("#notInterestedPharmacies");
const exportExcelBtn = document.querySelector("#exportExcelBtn");
const quantitySummaryBtn = document.querySelector("#quantitySummaryBtn");
const quantitySummary = document.querySelector("#quantitySummary");
const quantitySummaryTable = document.querySelector("#quantitySummaryTable");
const orderFile = document.querySelector("#orderFile");
const orderTemplateTable = document.querySelector("#orderTemplateTable");
const orderAdminMessage = document.querySelector("#orderAdminMessage");
const downloadTemplateBtn = document.querySelector("#downloadTemplateBtn");
const imagePreviewModal = document.querySelector("#imagePreviewModal");
const imagePreviewImg = document.querySelector("#imagePreviewImg");
const imagePreviewClose = document.querySelector("#imagePreviewClose");
const imagePreviewCloseBtn = document.querySelector("#imagePreviewCloseBtn");
let preserveSubmitMessage = false;
let adminUnlocked = false;
let campaigns = [];
let polls = [];
let pharmacies = [];
let currentPharmacy = JSON.parse(localStorage.getItem(PHARMACY_SESSION_KEY) || "null");
let pendingPasswordPharmacy = null;
let pendingInitialPassword = "";
let pharmacyPollAnswers = {};
let pharmacyCampaignResponses = {};
let selectedCampaign = null;
let selectedPoll = null;
let selectedAdminCampaign = null;
let selectedAdminPoll = null;
let currentOrderTemplate = [];
let adminShowingClosedCampaigns = false;
let pollResponseCounts = {};
let activeAdminSection = "new-campaign";

const ADMIN_SECTIONS = {
  "new-campaign": {
    title: "Créer une précommande",
    intro: "Indiquez le nom de la campagne, puis ouvrez-la pour importer son bon de commande."
  },
  "new-poll": {
    title: "Créer un sondage",
    intro: "Renseignez la question, les réponses possibles et le champ libre si nécessaire."
  },
  campaigns: {
    title: "Campagnes en cours",
    intro: "Retrouvez les précommandes actives, leur suivi et leurs exports."
  },
  polls: {
    title: "Sondages en cours",
    intro: "Consultez les sondages actifs et les réponses reçues."
  },
  pharmacies: {
    title: "Accès pharmacies",
    intro: "Créez ou supprimez les accès pharmacies et retrouvez leurs mots de passe."
  },
  archives: {
    title: "Archivés",
    intro: "Retrouvez les campagnes et sondages clôturés, avec possibilité de les rouvrir."
  }
};

function localResponses() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveLocalResponses(responses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
}

function localOrderTemplate() {
  return JSON.parse(localStorage.getItem(ORDER_TEMPLATE_KEY) || "[]");
}

function saveLocalOrderTemplate(template) {
  localStorage.setItem(ORDER_TEMPLATE_KEY, JSON.stringify(template));
}

function localPolls() {
  return JSON.parse(localStorage.getItem("soguasphar_polls") || "[]");
}

function saveLocalPolls(nextPolls) {
  localStorage.setItem("soguasphar_polls", JSON.stringify(nextPolls));
}

function localPollResponses() {
  return JSON.parse(localStorage.getItem(POLL_RESPONSES_KEY) || "[]");
}

function saveLocalPollResponses(responses) {
  localStorage.setItem(POLL_RESPONSES_KEY, JSON.stringify(responses));
}

function localAnsweredPolls() {
  return JSON.parse(localStorage.getItem(POLL_ANSWERED_KEY) || "{}");
}

function saveLocalAnsweredPoll(pollId, answer) {
  const answered = localAnsweredPolls();
  answered[pollId] = answer;
  localStorage.setItem(POLL_ANSWERED_KEY, JSON.stringify(answered));
}

function buildDefaultCampaigns(orderTemplate = []) {
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
      template: orderTemplate
    }
  ];
}

function slugify(value) {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || `precommande-${Date.now()}`;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  if (!response.ok) {
    let message = `Erreur serveur ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.error) message = payload.error;
    } catch {
      // Keep the generic server error if the response is not JSON.
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function getCampaigns() {
  if (API_AVAILABLE) {
    try {
      const remoteCampaigns = await requestJson("/api/orders");
      if (Array.isArray(remoteCampaigns) && remoteCampaigns.length) return remoteCampaigns;
    } catch {
      // Fallback for preview servers without multi-campaign API.
    }
  }

  return buildDefaultCampaigns(await getOrderTemplate());
}

async function saveCampaigns(nextCampaigns) {
  if (API_AVAILABLE) {
    try {
      await requestJson("/api/orders", {
        method: "PUT",
        headers: { "X-Admin-Code": ADMIN_CODE },
        body: JSON.stringify(nextCampaigns)
      });
      return;
    } catch {
      // Fallback for preview servers without multi-campaign API.
    }
  }

  const active = selectedAdminCampaign || selectedCampaign;
  if (active) saveLocalOrderTemplate(active.template || []);
}

async function getPolls() {
  if (API_AVAILABLE) {
    try {
      const remotePolls = await requestJson("/api/polls");
      if (Array.isArray(remotePolls)) return remotePolls;
    } catch {
      // Fallback for preview servers without poll API.
    }
  }

  return localPolls();
}

async function savePolls(nextPolls) {
  if (API_AVAILABLE) {
    try {
      const savedPolls = await requestJson("/api/polls", {
        method: "PUT",
        headers: { "X-Admin-Code": ADMIN_CODE },
        body: JSON.stringify(nextPolls)
      });
      saveLocalPolls(savedPolls);
      return savedPolls;
    } catch {
      // Fallback for preview servers without poll API.
    }
  }

  saveLocalPolls(nextPolls);
  return nextPolls;
}

async function getPharmacies(admin = false) {
  if (!API_AVAILABLE) return [];

  try {
    return await requestJson("/api/pharmacies", {
      headers: admin ? { "X-Admin-Code": ADMIN_CODE } : {}
    });
  } catch {
    return admin ? [] : { count: 0 };
  }
}

async function savePharmacies(nextPharmacies) {
  if (!API_AVAILABLE) return nextPharmacies;

  return requestJson("/api/pharmacies", {
    method: "PUT",
    headers: { "X-Admin-Code": ADMIN_CODE },
    body: JSON.stringify(nextPharmacies)
  });
}

async function loginPharmacy(password) {
  return requestJson("/api/pharmacy-login", {
    method: "POST",
    body: JSON.stringify({ password })
  });
}

async function changePharmacyPassword(pharmacyId, oldPassword, newPassword) {
  return requestJson("/api/pharmacy-password", {
    method: "PUT",
    body: JSON.stringify({ pharmacyId, oldPassword, newPassword })
  });
}

async function refreshPharmacyPollAnswers() {
  pharmacyPollAnswers = {};
  if (!API_AVAILABLE || !currentPharmacy?.id) return;

  try {
    const responses = await requestJson(`/api/pharmacy-poll-responses?pharmacyId=${encodeURIComponent(currentPharmacy.id)}`);
    responses.forEach((response) => {
      pharmacyPollAnswers[response.pollId] = response.answer;
    });
  } catch {
    pharmacyPollAnswers = {};
  }
}

async function refreshPharmacyCampaignResponses() {
  pharmacyCampaignResponses = {};
  if (!currentPharmacy) return;

  try {
    let responses = [];
    if (API_AVAILABLE) {
      const params = new URLSearchParams();
      if (currentPharmacy.id) params.set("pharmacyId", currentPharmacy.id);
      if (currentPharmacy.name) params.set("pharmacyName", currentPharmacy.name);
      responses = await requestJson(`/api/pharmacy-responses?${params.toString()}`);
    } else {
      responses = localResponses().filter((response) => response.pharmacyName === currentPharmacy.name);
    }

    latestResponses(responses).forEach((response) => {
      if (!response.campaignId) return;
      pharmacyCampaignResponses[response.campaignId] = response;
    });
  } catch {
    pharmacyCampaignResponses = {};
  }
}

function generatePharmacyPassword(name) {
  const prefix = slugify(name).replace(/-/g, "").slice(0, 4).toUpperCase() || "PHAR";
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}${random}`;
}

function pharmacyAccessRequired() {
  return pharmacies.length > 0 && (!currentPharmacy || pendingPasswordPharmacy);
}

async function getOrderTemplate() {
  if (!API_AVAILABLE) return localOrderTemplate();

  try {
    return await requestJson("/api/order-template");
  } catch {
    return localOrderTemplate();
  }
}

async function saveOrderTemplate(template) {
  if (API_AVAILABLE) {
    try {
      await requestJson("/api/order-template", {
        method: "PUT",
        headers: { "X-Admin-Code": ADMIN_CODE },
        body: JSON.stringify(template)
      });
      saveLocalOrderTemplate(template);
      return;
    } catch {
      // Fallback for direct preview servers without API routes.
    }
  }

  saveLocalOrderTemplate(template);
}

async function getResponses() {
  if (!API_AVAILABLE) return latestResponses(localResponses());

  try {
    const responses = await requestJson("/api/responses", {
      headers: adminUnlocked ? { "X-Admin-Code": ADMIN_CODE } : {}
    });
    return latestResponses(responses);
  } catch {
    return latestResponses(localResponses());
  }
}

async function appendResponse(response) {
  if (API_AVAILABLE) {
    try {
      return await requestJson("/api/responses", {
        method: "POST",
        body: JSON.stringify(response)
      });
    } catch (error) {
      if (error.status === 400) throw error;
      // Fallback for direct preview servers without API routes.
    }
  }

  const responses = localResponses().filter((item) => responseOwnerKey(item) !== responseOwnerKey(response));
  responses.push(response);
  saveLocalResponses(responses);
  return response;
}

async function clearResponses() {
  if (API_AVAILABLE) {
    try {
      await requestJson("/api/responses", {
        method: "DELETE",
        headers: { "X-Admin-Code": ADMIN_CODE }
      });
      saveLocalResponses([]);
      return;
    } catch {
      // Fallback for direct preview servers without API routes.
    }
  }

  saveLocalResponses([]);
}

async function deleteResponse(responseId) {
  if (API_AVAILABLE) {
    await requestJson(`/api/responses/${encodeURIComponent(responseId)}`, {
      method: "DELETE",
      headers: { "X-Admin-Code": ADMIN_CODE }
    });
    return;
  }

  saveLocalResponses(localResponses().filter((response) => response.id !== responseId));
}

async function getPollResponses() {
  if (!API_AVAILABLE) return localPollResponses();

  try {
    return await requestJson("/api/poll-responses", {
      headers: adminUnlocked ? { "X-Admin-Code": ADMIN_CODE } : {}
    });
  } catch {
    return localPollResponses();
  }
}

async function refreshPollResponseCounts() {
  pollResponseCounts = {};
  if (!adminUnlocked) return;

  const responses = await getPollResponses();
  const countsByPoll = new Map();

  responses.forEach((response) => {
    if (!response.pollId) return;
    const pharmacyKey = response.pharmacyId || response.pharmacyName || response.id;
    const pollPharmacies = countsByPoll.get(response.pollId) || new Set();
    pollPharmacies.add(pharmacyKey);
    countsByPoll.set(response.pollId, pollPharmacies);
  });

  countsByPoll.forEach((pharmaciesSet, pollId) => {
    pollResponseCounts[pollId] = pharmaciesSet.size;
  });
}

async function appendPollResponse(response) {
  if (API_AVAILABLE) {
    try {
      return await requestJson("/api/poll-responses", {
        method: "POST",
        body: JSON.stringify(response)
      });
    } catch {
      // Fallback for direct preview servers without API routes.
    }
  }

  const responses = [...localPollResponses(), response];
  saveLocalPollResponses(responses);
  return responses;
}

function createId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `response-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function pharmacyNameKey(name) {
  return String(name || "").trim().toLowerCase();
}

function activePharmacyNames() {
  return pharmacies
    .filter((pharmacy) => pharmacy && pharmacy.active !== false && pharmacy.name)
    .map((pharmacy) => String(pharmacy.name).trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "fr"));
}

function pharmacyListMarkup(names, emptyMessage) {
  return names.length
    ? names.map((name) => `<li>${escapeHtml(name)}</li>`).join("")
    : `<li>${escapeHtml(emptyMessage)}</li>`;
}

function unansweredNamesFor(answeredNames) {
  const answeredKeys = new Set(answeredNames.map(pharmacyNameKey));
  return activePharmacyNames().filter((name) => !answeredKeys.has(pharmacyNameKey(name)));
}

function campaignIsNotInterested(response) {
  return String(response.interest || "").trim().toLowerCase().includes("pas int");
}

function campaignIsInterested(response) {
  return !campaignIsNotInterested(response);
}
function campaignResponseSummary(response) {
  if (!response) return "";
  if (String(response.interest || "").toLowerCase().includes("pas int")) {
    return "Réponse : pas intéressé.";
  }

  const products = Array.isArray(response.products) ? response.products.filter((product) => Number(product.quantity) > 0) : [];
  const productSummary = products.slice(0, 4).map((product) => `${product.designation} : ${product.quantity}`).join(", ");
  const extraCount = products.length > 4 ? `, + ${products.length - 4} autre${products.length - 4 > 1 ? "s" : ""}` : "";
  const notes = response.notes ? ` Commentaire : ${response.notes}` : "";

  if (!products.length) {
    return `Réponse enregistrée sans quantité.${notes}`;
  }

  return `Commande : ${productSummary}${extraCount}.${notes}`;
}

function responseOwnerKey(response) {
  return `${response.campaignId || "herboristerie"}|${response.pharmacyId || String(response.pharmacyName || "").trim().toLowerCase()}`;
}

function latestResponses(responses = []) {
  const byOwner = new Map();
  responses.forEach((response) => {
    const key = responseOwnerKey(response);
    const previous = byOwner.get(key);
    if (!previous) {
      byOwner.set(key, response);
      return;
    }

    const previousDate = Date.parse(previous.updatedAt || previous.createdAt || "") || 0;
    const nextDate = Date.parse(response.updatedAt || response.createdAt || "") || 0;
    if (nextDate >= previousDate) byOwner.set(key, response);
  });
  return [...byOwner.values()];
}

function productKey(product) {
  return product?.cip || product?.designation || product?.product || product?.id || "";
}

function parseColisageMinimum(value) {
  const match = String(value || "").replace(",", ".").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function colisageErrorMessage(minimum) {
  return minimum ? `Veuillez inscrire au minimum le colisage indiqué (${minimum} unités).` : "Inscrire le colisage minimum.";
}

function refreshCampaignImagePreview(campaign) {
  const imageData = campaign?.imageData || "";
  const imageData2 = campaign?.imageData2 || "";
  if (campaignImageBlock && campaignImage) {
    campaignImageBlock.hidden = !imageData;
    campaignImageLink.href = imageData || "#";
    campaignImage.src = imageData;
    campaignImage.alt = imageData ? `Image ${campaign?.title || "commande"}` : "";
  }

  if (campaignImageBlock2 && campaignImage2) {
    campaignImageBlock2.hidden = !imageData2;
    campaignImageLink2.href = imageData2 || "#";
    campaignImage2.src = imageData2;
    campaignImage2.alt = imageData2 ? `Deuxième image ${campaign?.title || "commande"}` : "";
  }

  if (campaignImageAdminPreview && campaignImageAdmin) {
    campaignImageAdminPreview.hidden = !imageData;
    campaignImageAdminLink.href = imageData || "#";
    campaignImageAdmin.src = imageData;
    campaignImageAdmin.alt = imageData ? `Image ${campaign?.title || "commande"}` : "";
  }

  if (campaignImageAdminPreview2 && campaignImageAdmin2) {
    campaignImageAdminPreview2.hidden = !imageData2;
    campaignImageAdminLink2.href = imageData2 || "#";
    campaignImageAdmin2.src = imageData2;
    campaignImageAdmin2.alt = imageData2 ? `Deuxième image ${campaign?.title || "commande"}` : "";
  }
}

function openImagePreview(src, alt = "Image") {
  if (!src || !imagePreviewModal || !imagePreviewImg) return;
  imagePreviewImg.src = src;
  imagePreviewImg.alt = alt;
  imagePreviewModal.hidden = false;
  document.body.classList.add("modal-open");
  imagePreviewClose?.focus();
}

function closeImagePreview() {
  if (!imagePreviewModal || imagePreviewModal.hidden) return;
  imagePreviewModal.hidden = true;
  imagePreviewImg.src = "";
  imagePreviewImg.alt = "";
  document.body.classList.remove("modal-open");
}

function renderPharmacyAccess() {
  const requiresLogin = pharmacyAccessRequired();
  pharmacyGate.hidden = !requiresLogin;
  pharmacySessionBar.hidden = !currentPharmacy;
  currentPharmacyName.textContent = currentPharmacy ? `Connecté : ${currentPharmacy.name}` : "";
  if (pendingPasswordPharmacy) {
    pharmacyLoginForm.hidden = true;
    pharmacyPasswordChangeForm.hidden = false;
    pharmacyGate.querySelector("h2").textContent = "Créez votre mot de passe";
    pharmacyGate.querySelector(".pharmacy-gate-card > p:not(.eyebrow):not(.status-message)").textContent =
      `Première connexion pour ${pendingPasswordPharmacy.name}. Choisissez un nouveau mot de passe personnel.`;
  } else {
    pharmacyLoginForm.hidden = false;
    pharmacyPasswordChangeForm.hidden = true;
    pharmacyGate.querySelector("h2").textContent = "Identifiez votre pharmacie";
    pharmacyGate.querySelector(".pharmacy-gate-card > p:not(.eyebrow):not(.status-message)").textContent =
      "Entrez le mot de passe transmis par SOGUASPHAR pour accéder aux commandes et sondages.";
  }

  if (requiresLogin) {
    heroBand.hidden = true;
    campaignPicker.hidden = true;
    form.hidden = true;
    pollForm.hidden = true;
    responseSuccess.hidden = true;
  }
}

function applyCurrentPharmacyToForms() {
  const name = currentPharmacy?.name || "";
  if (!name) return;
  const pharmacyInput = document.querySelector("#pharmacyName");
  pharmacyInput.value = name;
  pharmacyInput.readOnly = true;
  pollPharmacyName.value = name;
  pollPharmacyName.readOnly = true;
}

function renderPharmacyAccounts() {
  if (!pharmacyAccountsList) return;
  if (!pharmacies.length) {
    pharmacyAccountsList.innerHTML = '<p class="empty-campaigns">Aucun accès pharmacie créé pour le moment.</p>';
    return;
  }

  pharmacyAccountsList.innerHTML = `
    <div class="table-wrap compact">
      <table>
        <thead><tr><th>Pharmacie</th><th>Mot de passe actuel</th><th>Statut</th><th>Action</th></tr></thead>
        <tbody>
          ${pharmacies.map((pharmacy) => `
            <tr>
              <td><strong>${escapeHtml(pharmacy.name)}</strong></td>
              <td><code>${escapeHtml(pharmacy.password)}</code></td>
              <td>${pharmacy.mustChangePassword === false ? "Personnalisé" : "À changer"}</td>
              <td><button class="delete-response-btn" type="button" data-delete-pharmacy="${escapeHtml(pharmacy.id)}" aria-label="Supprimer ${escapeHtml(pharmacy.name)}">&#128465;</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function imageFileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Choisissez un fichier image."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Image impossible à lire."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Image impossible à préparer."));
      image.onload = () => {
        const maxWidth = 1100;
        const maxHeight = 760;
        const ratio = Math.min(1, maxWidth / image.width, maxHeight / image.height);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * ratio));
        canvas.height = Math.max(1, Math.round(image.height * ratio));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

const TEMPLATE_HEADER_ALIASES = {
  designation: [
    "designation", "desig", "libelle", "article", "articles", "produit", "produits",
    "description", "nom", "intitule", "reference", "ref"
  ],
  cip: ["cip", "codecip", "cip7", "cip13", "code", "codeean", "ean", "ean13", "gencode"],
  tarif: [
    "tarif", "tarifunitaire", "prix", "prixunitaire", "prixht", "tarifht", "pvc",
    "pu", "punitaire", "montant", "prixpublic"
  ],
  colisage: ["colisage", "conditionnement", "colis", "parcolis", "uvc", "pcb"]
};

function findTemplateColumn(headers, kind) {
  return headers.findIndex((header) => (TEMPLATE_HEADER_ALIASES[kind] || []).includes(header));
}

function cleanTemplateCell(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function formatTemplateTarif(value) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value.toLocaleString("fr-FR", {
      minimumFractionDigits: value % 1 ? 2 : 0,
      maximumFractionDigits: 2
    })} €`;
  }
  const clean = cleanTemplateCell(value);
  if (!clean) return "";
  return clean.replace(".", ",").replace(/\s*€?$/, " €").trim();
}

function looksLikeHeaderRow(headers) {
  const score = ["designation", "cip", "tarif", "colisage"]
    .reduce((total, kind) => total + (findTemplateColumn(headers, kind) !== -1 ? 1 : 0), 0);
  return score >= 2 || (findTemplateColumn(headers, "designation") !== -1 && score >= 1);
}

function isIgnoredTemplateLine(text) {
  const header = normalizeHeader(text);
  return !header
    || [
      "designation", "desig", "libelle", "article", "produit", "produits", "tarif",
      "tarifunitaire", "cip", "colisage", "commandes", "quantite", "quantites"
    ].includes(header)
    || /^(total|soustotal|bondecommande|commande|precommande)$/.test(header);
}

function inferTemplateRows(rows) {
  const priceRegex = /(?:\d+[,.]\d{1,2}\s*€?|\d+\s*€)/;
  const cipRegex = /\b(?:\d[\s.-]*){7,14}\b/;

  return rows
    .map((row, index) => {
      const cells = row.map(cleanTemplateCell);
      const joined = cells.filter(Boolean).join(" ");
      if (isIgnoredTemplateLine(joined)) return null;

      const cipMatch = joined.match(cipRegex);
      const priceIndex = cells.findIndex((cell) => priceRegex.test(cell));
      const designationCell = cells.find((cell, cellIndex) => {
        if (!cell || cellIndex === priceIndex) return false;
        if (cipMatch && cell.replace(/\D/g, "") === cipMatch[0].replace(/\D/g, "")) return false;
        if (priceRegex.test(cell)) return false;
        return /[a-zA-ZÀ-ÿ]/.test(cell) && !isIgnoredTemplateLine(cell);
      });
      const designation = cleanTemplateCell(designationCell || cells.find(Boolean));

      if (!designation || isIgnoredTemplateLine(designation)) return null;

      return {
        id: `line-${Date.now()}-${index}`,
        designation,
        cip: cipMatch ? cipMatch[0].replace(/\D/g, "") : "",
        tarif: priceIndex !== -1 ? formatTemplateTarif(cells[priceIndex]) : "",
        colisage: ""
      };
    })
    .filter(Boolean);
}

function normalizeTemplateRows(rows) {
  const cleanRows = rows
    .map((row) => Array.isArray(row) ? row : [])
    .filter((row) => row.some((cell) => cleanTemplateCell(cell)));
  if (!cleanRows.length) return [];

  const headerIndex = cleanRows.findIndex((row) => looksLikeHeaderRow(row.map(normalizeHeader)));
  if (headerIndex === -1) {
    const inferredRows = inferTemplateRows(cleanRows);
    if (inferredRows.length) return inferredRows;
    throw new Error("Aucune ligne produit exploitable n'a été trouvée.");
  }

  const headers = cleanRows[headerIndex].map(normalizeHeader);
  const indexes = {
    designation: findTemplateColumn(headers, "designation"),
    cip: findTemplateColumn(headers, "cip"),
    tarif: findTemplateColumn(headers, "tarif"),
    colisage: findTemplateColumn(headers, "colisage")
  };

  if (indexes.designation === -1) {
    const inferredRows = inferTemplateRows(cleanRows.slice(headerIndex + 1));
    if (inferredRows.length) return inferredRows;
    throw new Error("Colonnes attendues : désignation, CIP, tarif, colisage.");
  }

  const importedRows = cleanRows.slice(headerIndex + 1)
    .map((row, index) => ({
      id: `line-${Date.now()}-${index}`,
      designation: cleanTemplateCell(row[indexes.designation]),
      cip: indexes.cip === -1 ? "" : cleanTemplateCell(row[indexes.cip]),
      tarif: indexes.tarif === -1 ? "" : formatTemplateTarif(row[indexes.tarif]),
      colisage: indexes.colisage === -1 ? "" : cleanTemplateCell(row[indexes.colisage])
    }))
    .filter((row) => row.designation && !isIgnoredTemplateLine(row.designation));

  if (importedRows.length) return importedRows;

  const inferredRows = inferTemplateRows(cleanRows.slice(headerIndex + 1));
  if (inferredRows.length) return inferredRows;
  throw new Error("Aucune ligne produit exploitable n'a été trouvée.");
}

function parseDelimited(text) {
  const delimiter = text.includes(";") ? ";" : text.includes("\t") ? "\t" : ",";
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => line.split(delimiter).map((cell) => cell.trim().replace(/^"|"$/g, "")));
}

function parsePdfOrderText(text) {
  const rows = [["Désignation", "CIP", "Tarif", "Colisage"]];
  const seen = new Set();

  function cleanDesignation(value) {
    return String(value || "")
      .replace(/\b(BON DE COMMANDE|Pharmacie|Cachet|Signature|Bon pour accord)\b/gi, " ")
      .replace(/\b(Produits?|Produit|Désignation|Designation|Libellé|Libelle|Référence|Reference)\b/gi, " ")
      .replace(/\b(Code|CIP|EAN|EAN 13|Prix|Tarif|PU|P\.U\.|Montant|Colisage|Commande|Quantité|Quantite|Qté|Qte)\b/gi, " ")
      .replace(/\s+/g, " ")
      .replace(/^[\s:;,\-/]+|[\s:;,\-/]+$/g, "")
      .trim();
  }

  function addRow(designation, cip = "", tarif = "", colisage = "") {
    const cleanName = cleanDesignation(designation);
    const cleanCip = String(cip || "").replace(/\D/g, "");
    const cleanTarif = String(tarif || "").replace(".", ",").replace(/\s*€?$/, " €").trim();
    const cleanColisage = String(colisage || "").trim();
    const key = `${cleanName.toLowerCase()}|${cleanCip}|${cleanTarif}`;

    if (!cleanName || !cleanTarif || seen.has(key)) return;
    seen.add(key);
    rows.push([cleanName, cleanCip, cleanTarif, cleanColisage]);
  }

  function parseProductLine(line) {
    let working = String(line || "").replace(/\s+/g, " ").trim();
    if (!working || !/\d+[,.]\d{2}/.test(working)) return;
    if (/^(produits?|prix|tarif|colisage|commande|quantité|quantite|code|cip|ean)\b/i.test(working)) return;

    const priceMatch = working.match(/(\d+[,.]\d{2})\s*(?:€|eur)?/i);
    if (!priceMatch) return;
    const tarif = `${priceMatch[1].replace(".", ",")} €`;
    working = `${working.slice(0, priceMatch.index)} ${working.slice(priceMatch.index + priceMatch[0].length)}`.trim();

    let cip = "";
    const barcodeMatch = working.match(/(?:\d[\s-]*){13}/);
    if (barcodeMatch) {
      cip = barcodeMatch[0].replace(/\D/g, "");
      working = `${working.slice(0, barcodeMatch.index)} ${working.slice(barcodeMatch.index + barcodeMatch[0].length)}`.trim();
    }

    let colisage = "";
    const trailingColisage = working.match(/\s(\d{1,4})$/);
    if (trailingColisage && !/[A-Za-zÀ-ÿ]\d+$/.test(working.replace(/\s(\d{1,4})$/, ""))) {
      colisage = trailingColisage[1];
      working = working.replace(/\s\d{1,4}$/, "").trim();
    }

    addRow(working, cip, tarif, colisage);
  }

  String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach(parseProductLine);

  if (rows.length === 1) {
    const compact = String(text || "")
      .replace(/\s+/g, " ")
      .replace(/TARIF HORS LIVRAISON.*?Quantités commandées/i, " ")
      .trim();
    const genericMatches = compact.matchAll(/([A-Za-zÀ-ÿ0-9'’().,/\-+& ]{2,}?)\s+((?:\d[\s-]*){13})?\s*(\d+[,.]\d{2})\s*(?:€|eur)?\s*(\d{1,4})?(?=\s+[A-Za-zÀ-ÿ0-9'’().,/\-+& ]{2,}?\s+(?:(?:\d[\s-]*){13}\s*)?\d+[,.]\d{2}|\s*$)/gi);

    for (const match of genericMatches) {
      addRow(match[1], match[2] || "", `${match[3]} €`, match[4] || "");
    }
  }

  if (rows.length === 1) {
    throw new Error("PDF lu, mais aucune ligne produit exploitable n'a été trouvée.");
  }

  return normalizeTemplateRows(rows);
}

async function parsePdfFile(file) {
  if (!globalThis.pdfjsLib) {
    throw new Error("Le module PDF n'est pas encore chargé. Réessayez dans quelques secondes.");
  }

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer, disableWorker: true }).promise;
  let text = "";

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const lines = new Map();

    content.items.forEach((item) => {
      const value = String(item.str || "").trim();
      if (!value) return;
      const x = Math.round(item.transform[4]);
      const y = Math.round(item.transform[5] / 3) * 3;
      const line = lines.get(y) || [];
      line.push({ x, value });
      lines.set(y, line);
    });

    text += "\n" + [...lines.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, line]) => line.sort((a, b) => a.x - b.x).map((item) => item.value).join(" "))
      .join("\n");
  }

  return parsePdfOrderText(text);
}

async function parseOrderFile(file) {
  if (/\.pdf$/i.test(file.name)) {
    return parsePdfFile(file);
  }

  if (globalThis.XLSX && /\.(xlsx|xls)$/i.test(file.name)) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    return normalizeTemplateRows(XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" }));
  }

  const text = await file.text();
  return normalizeTemplateRows(parseDelimited(text));
}

function campaignCard(campaign, target) {
  const count = (campaign.template || []).length;
  const isAdmin = target === "admin";
  const completedResponse = !isAdmin ? pharmacyCampaignResponses[campaign.id] : null;
  const isCompleted = Boolean(completedResponse);
  const imageMarkup = [campaign.imageData, campaign.imageData2]
    .filter(Boolean)
    .map((imageData, index) => `<a class="campaign-card-image" href="${imageData}" data-preview-image title="Voir la photo ${index + 1}"><img src="${imageData}" alt="Image ${index + 1} ${escapeHtml(campaign.title)}"></a>`)
    .join("");
  const statusLabel = campaign.closed ? "Clôturée" : (campaign.type || "Commande");
  const displayStatusLabel = isCompleted ? "Réalisée" : statusLabel;
  const summary = campaignResponseSummary(completedResponse);
  const completedDate = completedResponse?.updatedAt
    ? `Modifiée le ${escapeHtml(completedResponse.updatedAt)}`
    : `Réalisée le ${escapeHtml(completedResponse?.createdAt || "")}`;
  const cardAction = !isAdmin && !isCompleted
    ? `data-form-campaign="${escapeHtml(campaign.id)}" role="button" tabindex="0"`
    : "";
  return `
    <article class="campaign-card ${isCompleted ? "completed" : ""} ${cardAction ? "clickable" : ""}" ${cardAction}>
      ${imageMarkup}
      <div>
        <div class="campaign-card-top">
          <span class="campaign-type ${campaign.closed ? "closed" : ""}">${escapeHtml(displayStatusLabel)}</span>
          ${isAdmin ? `<button class="delete-campaign-btn" type="button" title="Supprimer la campagne" aria-label="Supprimer ${escapeHtml(campaign.title)}" data-delete-campaign="${escapeHtml(campaign.id)}">&#128465;</button>` : ""}
        </div>
        <h3>${escapeHtml(campaign.title)}</h3>
        <p>${escapeHtml(campaign.description || campaign.pharmacyMessage || "")}</p>
        ${isCompleted ? `<div class="campaign-done-summary"><strong>Réponse déjà envoyée</strong><span>${escapeHtml(summary)}</span></div>` : ""}
      </div>
      <div class="campaign-foot">
        <span>${isCompleted ? completedDate : `${count} ligne${count > 1 ? "s" : ""}`}</span>
        <div class="campaign-actions">
          ${isAdmin ? `<button class="ghost-btn" type="button" data-toggle-closed-campaign="${escapeHtml(campaign.id)}">${campaign.closed ? "Rouvrir" : "Clôturer"}</button>` : ""}
          ${isCompleted
            ? `<button class="primary-btn" type="button" data-form-campaign="${escapeHtml(campaign.id)}">Modifier ma commande</button>`
            : `<button class="primary-btn" type="button" data-${target}-campaign="${escapeHtml(campaign.id)}">
                ${target === "admin" ? "Voir le suivi" : "Remplir"}
              </button>`}
        </div>
      </div>
    </article>
  `;
}

function pollCard(poll, target) {
  const isAdmin = target === "admin";
  const optionCount = (poll.options || []).length;
  const responseCount = isAdmin ? (pollResponseCounts[poll.id] || 0) : optionCount;
  const localAnswer = !isAdmin ? (currentPharmacy ? pharmacyPollAnswers[poll.id] : localAnsweredPolls()[poll.id]) : null;
  const optionsPreview = (poll.options || []).map((option) => `
    <div class="whatsapp-poll-option ${localAnswer === option ? "is-answered" : ""}">
      <span class="whatsapp-poll-circle" aria-hidden="true">${localAnswer === option ? "✓" : ""}</span>
      <span class="whatsapp-poll-label">${escapeHtml(option)}</span>
      <span class="whatsapp-poll-count">${localAnswer === option ? "✓" : "0"}</span>
      <span class="whatsapp-poll-bar" aria-hidden="true"></span>
    </div>
  `).join("");
  const inlineOptions = (poll.options || []).map((option, index) => `
    <label class="whatsapp-poll-option inline-whatsapp-option">
      <input type="radio" name="inlinePollAnswer" value="${escapeHtml(option)}" ${index === 0 ? "required" : ""}>
      <span class="whatsapp-poll-circle" aria-hidden="true"></span>
      <span class="whatsapp-poll-label">${escapeHtml(option)}</span>
      <span class="whatsapp-poll-count">0</span>
      <span class="whatsapp-poll-bar" aria-hidden="true"></span>
    </label>
  `).join("");
  const inlineFreeText = poll.freeTextLabel ? `
    <label class="inline-poll-free-label" for="inlineFreeText-${escapeHtml(poll.id)}">${escapeHtml(poll.freeTextLabel)}</label>
    <textarea id="inlineFreeText-${escapeHtml(poll.id)}" name="inlinePollFreeText" rows="3" ${poll.freeTextRequired ? "required" : ""}></textarea>
  ` : "";

  if (!isAdmin) {
    return `
      <article class="whatsapp-poll-card ${localAnswer ? "answered" : "is-open"}">
        <div class="whatsapp-poll-title">${escapeHtml(poll.question)}</div>
        ${localAnswer ? `
          <div class="whatsapp-poll-options">
            ${optionsPreview}
          </div>
          <div class="whatsapp-poll-answered">Réponse enregistrée : ${escapeHtml(localAnswer)}</div>
        ` : `
          <form class="inline-poll-form" data-inline-poll-form="${escapeHtml(poll.id)}">
            <input type="hidden" name="inlinePollPharmacy" value="${escapeHtml(currentPharmacy?.name || "")}">
            <div class="whatsapp-poll-options inline-poll-options">${inlineOptions}</div>
            ${inlineFreeText}
            <button class="primary-btn" type="submit">Valider ma réponse</button>
            <p class="status-message inline-poll-message" role="status"></p>
          </form>
        `}
      </article>
    `;
  }

  return `
    <article class="campaign-card poll-card">
      <div>
        <div class="campaign-card-top">
          <span class="campaign-type ${poll.closed ? "closed" : ""}">${poll.closed ? "Sondage clôturé" : "Sondage"}</span>
          <button class="delete-campaign-btn" type="button" title="Supprimer le sondage" aria-label="Supprimer le sondage ${escapeHtml(poll.question)}" data-delete-poll="${escapeHtml(poll.id)}">&#128465;</button>
        </div>
        <h3>${escapeHtml(poll.question)}</h3>
        <p>${escapeHtml(poll.freeTextLabel || "Réponse rapide en un clic.")}</p>
      </div>
      <div class="campaign-foot">
        <span>${responseCount} réponse${responseCount > 1 ? "s" : ""}</span>
        <div class="campaign-actions">
          <button class="ghost-btn" type="button" data-toggle-closed-poll="${escapeHtml(poll.id)}">${poll.closed ? "Rouvrir" : "Clôturer"}</button>
          <button class="primary-btn" type="button" data-${target}-poll="${escapeHtml(poll.id)}">
            ${isAdmin ? "Voir les résultats" : "Répondre"}
          </button>
        </div>
      </div>
    </article>
  `;
}

function showAdminSection(section) {
  activeAdminSection = section || "new-campaign";
  const sectionCopy = ADMIN_SECTIONS[activeAdminSection] || ADMIN_SECTIONS["new-campaign"];
  const closedActions = showClosedCampaignsBtn?.closest(".closed-campaign-actions");
  const showCampaignList = activeAdminSection === "campaigns" || activeAdminSection === "archives";
  const showPollList = activeAdminSection === "polls" || activeAdminSection === "archives";
  const showPharmacies = activeAdminSection === "pharmacies";

  adminCampaignTitle.textContent = sectionCopy.title;
  adminSectionIntro.textContent = sectionCopy.intro;
  createCampaignForm.hidden = activeAdminSection !== "new-campaign";
  createPollForm.hidden = activeAdminSection !== "new-poll";
  createPharmacyForm.hidden = !showPharmacies;
  pharmacyAccountsList.hidden = !showPharmacies;
  adminCampaignCards.hidden = !showCampaignList;
  adminPollBlock.hidden = !showPollList;
  if (closedActions) closedActions.hidden = true;

  adminDashboardNav?.querySelectorAll("[data-admin-section]").forEach((button) => {
    button.classList.toggle("active", button.dataset.adminSection === activeAdminSection);
  });

  renderCampaignPickers();
}

function renderCampaignPickers() {
  const openCampaigns = campaigns.filter((campaign) => !campaign.closed);
  const adminCampaigns = campaigns.filter((campaign) => activeAdminSection === "archives" ? campaign.closed : !campaign.closed);
  const openPolls = polls.filter((poll) => !poll.closed);
  const adminPolls = polls.filter((poll) => activeAdminSection === "archives" ? poll.closed : !poll.closed);

  campaignCards.innerHTML = openCampaigns.length
    ? openCampaigns.map((campaign) => campaignCard(campaign, "form")).join("")
    : '<p class="empty-campaigns">Aucune précommande disponible pour le moment.</p>';

  pollCards.innerHTML = openPolls.length
    ? openPolls.map((poll) => pollCard(poll, "form")).join("")
    : '<p class="empty-campaigns">Aucun sondage disponible pour le moment.</p>';

  adminCampaignCards.innerHTML = adminCampaigns.length
    ? adminCampaigns.map((campaign) => campaignCard(campaign, "admin")).join("")
    : `<p class="empty-campaigns">Aucune campagne ${adminShowingClosedCampaigns ? "clôturée" : "active"}.</p>`;

  adminPollCards.innerHTML = adminPolls.length
    ? adminPolls.map((poll) => pollCard(poll, "admin")).join("")
    : '<p class="empty-campaigns">Aucun sondage créé pour le moment.</p>';

  showClosedCampaignsBtn.textContent = adminShowingClosedCampaigns ? "Campagnes actives" : "Campagnes clôturées";
}

function selectCampaign(campaignId) {
  if (pharmacyAccessRequired()) {
    renderPharmacyAccess();
    return;
  }
  selectedCampaign = campaigns.find((campaign) => campaign.id === campaignId) || campaigns[0];
  selectedPoll = null;
  currentOrderTemplate = selectedCampaign?.template || [];
  campaignPicker.hidden = true;
  heroBand.hidden = true;
  form.hidden = false;
  pollForm.hidden = true;
  responseSuccess.hidden = true;
  document.querySelector("#formTitle").textContent = "Commande, précommande, confirmation";
  if (selectedCampaign.pharmacyMessage) {
    campaignNotice.hidden = false;
    campaignNotice.textContent = selectedCampaign.pharmacyMessage;
  } else {
    campaignNotice.hidden = true;
    campaignNotice.textContent = "";
  }
  refreshCampaignImagePreview(selectedCampaign);
  formMessage.textContent = "";
  form.reset();
  applyCurrentPharmacyToForms();
  renderOrderTemplate();
  prefillCampaignResponse(pharmacyCampaignResponses[selectedCampaign.id]);
  updateQuantityVisibility();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectPoll(pollId) {
  if (pharmacyAccessRequired()) {
    renderPharmacyAccess();
    return;
  }
  selectedPoll = polls.find((poll) => poll.id === pollId) || null;
  if (!selectedPoll) return;

  selectedCampaign = null;
  campaignPicker.hidden = false;
  heroBand.hidden = false;
  form.hidden = true;
  pollForm.hidden = true;
  responseSuccess.hidden = true;
  renderCampaignPickers();
  const openedCard = Array.from(pollCards.querySelectorAll("[data-inline-poll-form]"))
    .find((item) => item.dataset.inlinePollForm === selectedPoll.id);
  openedCard?.closest(".whatsapp-poll-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function updatePollChoiceSelection() {
  pollOptions.querySelectorAll(".poll-choice").forEach((choice) => {
    choice.classList.toggle("is-selected", Boolean(choice.querySelector("input")?.checked));
  });
}

async function savePollAnswer(poll, answer, pharmacyName, freeText) {
  await appendPollResponse({
    id: createId(),
    pollId: poll.id,
    pollQuestion: poll.question,
    createdAt: new Date().toLocaleString("fr-FR"),
    pharmacyId: currentPharmacy?.id || "",
    pharmacyName,
    answer,
    freeText
  });

  saveLocalAnsweredPoll(poll.id, answer);
  if (currentPharmacy?.id) {
    pharmacyPollAnswers[poll.id] = answer;
  }
}

function showCampaignPicker() {
  if (pharmacyAccessRequired()) {
    selectedCampaign = null;
    selectedPoll = null;
    renderPharmacyAccess();
    return;
  }
  selectedCampaign = null;
  selectedPoll = null;
  currentOrderTemplate = [];
  campaignPicker.hidden = false;
  heroBand.hidden = false;
  form.hidden = true;
  pollForm.hidden = true;
  responseSuccess.hidden = true;
  campaignNotice.hidden = true;
  campaignNotice.textContent = "";
  refreshCampaignImagePreview(null);
  form.reset();
  formMessage.textContent = "";
}

function showSuccessScreen() {
  form.hidden = true;
  pollForm.hidden = true;
  campaignPicker.hidden = false;
  heroBand.hidden = false;
  responseSuccess.hidden = false;
}

async function selectAdminCampaign(campaignId) {
  selectedAdminCampaign = campaigns.find((campaign) => campaign.id === campaignId) || campaigns[0];
  selectedAdminPoll = null;
  currentOrderTemplate = selectedAdminCampaign?.template || [];
  adminSelectedCampaignName.textContent = selectedAdminCampaign.title;
  campaignPharmacyMessage.value = selectedAdminCampaign.pharmacyMessage || selectedAdminCampaign.description || "";
  campaignImageMessage.textContent = "";
  campaignImageFile.value = "";
  campaignImageFile2.value = "";
  refreshCampaignImagePreview(selectedAdminCampaign);
  adminCampaignPicker.hidden = true;
  adminDetail.hidden = false;
  adminPollDetail.hidden = true;
  quantitySummary.hidden = true;
  quantitySummaryBtn.textContent = "Récap des quantités";
  renderOrderTemplate();
  await renderAdmin();
}

async function selectAdminPoll(pollId) {
  selectedAdminPoll = polls.find((poll) => poll.id === pollId) || null;
  if (!selectedAdminPoll) return;

  selectedAdminCampaign = null;
  adminPollTitle.textContent = selectedAdminPoll.question;
  adminCampaignPicker.hidden = true;
  adminDetail.hidden = true;
  adminPollDetail.hidden = false;
  await renderPollResults();
}

async function showAdminCampaignPicker() {
  selectedAdminCampaign = null;
  selectedAdminPoll = null;
  adminShowingClosedCampaigns = false;
  adminCampaignPicker.hidden = false;
  adminDetail.hidden = true;
  adminPollDetail.hidden = true;
  await refreshPollResponseCounts();
  showAdminSection(activeAdminSection);
}

function renderOrderTemplate() {
  lineCount.textContent = `${currentOrderTemplate.length} ligne${currentOrderTemplate.length > 1 ? "s" : ""}`;

  if (!currentOrderTemplate.length) {
    orderMessage.style.display = "block";
    productRows.innerHTML = "";
    orderTemplateTable.innerHTML = '<tr><td colspan="4" class="empty-state">Aucun bon de commande chargé.</td></tr>';
    return;
  }

  orderMessage.style.display = "none";
  productRows.innerHTML = currentOrderTemplate.map((item) => {
    const colisageMinimum = parseColisageMinimum(item.colisage);
    return `
    <tr class="order-row" data-line-id="${escapeHtml(item.id)}">
      <td>${escapeHtml(item.designation)}</td>
      <td>${escapeHtml(item.cip)}</td>
      <td>${escapeHtml(item.tarif)}</td>
      <td>${escapeHtml(item.colisage)}</td>
      <td>
        <input
          type="number"
          class="product-quantity"
          min="0"
          step="1"
          inputmode="numeric"
          data-id="${escapeHtml(item.id)}"
          data-min-colisage="${escapeHtml(colisageMinimum)}"
          aria-label="Quantité pour ${escapeHtml(item.designation)}"
        >
      </td>
    </tr>
  `;
  }).join("");

  orderTemplateTable.innerHTML = currentOrderTemplate.map((item) => `
    <tr>
      <td>${escapeHtml(item.designation)}</td>
      <td>${escapeHtml(item.cip)}</td>
      <td>${escapeHtml(item.tarif)}</td>
      <td>${escapeHtml(item.colisage)}</td>
    </tr>
  `).join("");
}

function collectProducts() {
  return [...document.querySelectorAll(".product-quantity")]
    .map((row) => ({
      template: currentOrderTemplate.find((item) => item.id === row.dataset.id),
      quantity: row.value.trim()
    }))
    .filter((item) => item.template && Number(item.quantity) > 0)
    .map((item) => ({
      designation: item.template.designation,
      cip: item.template.cip,
      tarif: item.template.tarif,
      colisage: item.template.colisage,
      quantity: item.quantity
    }));
}

function prefillCampaignResponse(response) {
  if (!response) return;

  const interestInput = [...form.querySelectorAll('input[name="interest"]')]
    .find((input) => input.value === (response.interest || ""));
  if (interestInput) interestInput.checked = true;
  document.querySelector("#notes").value = response.notes || "";

  const quantitiesByKey = new Map();
  (response.products || []).forEach((product) => {
    quantitiesByKey.set(productKey(product), product.quantity || "");
  });

  currentOrderTemplate.forEach((template) => {
    const input = [...productRows.querySelectorAll(".product-quantity")]
      .find((item) => item.dataset.id === template.id);
    if (!input) return;
    input.value = quantitiesByKey.get(productKey(template)) || "";
    validateQuantityInput(input);
  });
}

function validateQuantityInput(input) {
  const quantity = Number(String(input.value || "").replace(",", "."));
  const minimum = Number(input.dataset.minColisage || "0");
  const invalid = input.value.trim() && minimum > 0 && quantity > 0 && quantity < minimum;
  const message = invalid ? colisageErrorMessage(minimum) : "";
  input.setCustomValidity(message);
  input.classList.toggle("is-invalid", Boolean(invalid));
  return message;
}

function validateColisageQuantities() {
  const invalidInput = [...document.querySelectorAll(".product-quantity")]
    .find((input) => validateQuantityInput(input));
  if (!invalidInput) return "";
  invalidInput.reportValidity();
  return invalidInput.validationMessage || "Inscrire le colisage minimum.";
}

function resetQuantities() {
  document.querySelectorAll(".product-quantity").forEach((input) => {
    input.value = "";
    input.setCustomValidity("");
    input.classList.remove("is-invalid");
  });
}

function updateQuantityVisibility() {
  const selected = document.querySelector('input[name="interest"]:checked')?.value;
  quantitySection.style.display = selected === "Pas intéressé" ? "none" : "block";
}

async function renderAdmin() {
  if (!adminUnlocked || !selectedAdminCampaign) return;

  const responses = (await getResponses())
    .filter((item) => item.campaignId === selectedAdminCampaign.id || (!item.campaignId && selectedAdminCampaign.id === "herboristerie"));
  const answeredNames = [...new Set(responses.map((item) => item.pharmacyName).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "fr"));
  const notInterestedNames = [...new Set(responses
    .filter(campaignIsNotInterested)
    .map((item) => item.pharmacyName)
    .filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "fr"));
  const interested = responses.filter(campaignIsInterested).length;
  const unansweredNames = unansweredNamesFor(answeredNames);

  document.querySelector("#totalResponses").textContent = responses.length;
  document.querySelector("#interestedResponses").textContent = interested;
  document.querySelector("#notInterestedResponses").textContent = notInterestedNames.length;
  document.querySelector("#unansweredResponses").textContent = unansweredNames.length;

  answeredPharmacies.innerHTML = pharmacyListMarkup(answeredNames, "Aucune réponse pour le moment.");
  notInterestedPharmacies.innerHTML = pharmacyListMarkup(notInterestedNames, "Aucune pharmacie pour le moment.");
  unansweredPharmacies.innerHTML = pharmacyListMarkup(unansweredNames, "Toutes les pharmacies actives ont répondu.");
  if (!responses.length) {
    responsesTable.innerHTML = '<tr><td colspan="6" class="empty-state">Aucune réponse enregistrée pour le moment.</td></tr>';
    return;
  }

  responsesTable.innerHTML = responses
    .slice()
    .reverse()
    .map((response) => {
      const products = response.products.length
        ? response.products.map((item) => {
            const label = item.designation || item.product || item.cip || "Produit";
            return `${escapeHtml(label)} : ${escapeHtml(item.quantity || "0")}`;
          }).join("<br>")
        : "-";

      const modifiedLabel = response.updatedAt
        ? `<br><span class="updated-at">Modifié le : ${escapeHtml(response.updatedAt)}</span>`
        : "";

      return `
        <tr>
          <td>
            <button class="delete-response-btn" type="button" title="Supprimer cette réponse" aria-label="Supprimer la réponse de ${escapeHtml(response.pharmacyName)}" data-delete-response="${escapeHtml(response.id)}">&#128465;</button>
          </td>
          <td>${escapeHtml(response.createdAt)}${modifiedLabel}</td>
          <td><strong>${escapeHtml(response.pharmacyName)}</strong></td>
          <td>${escapeHtml(response.interest)}</td>
          <td>${products}</td>
          <td>${escapeHtml(response.notes || "-")}</td>
        </tr>
      `;
    })
    .join("");

  renderQuantitySummary(responses);
}

function renderQuantitySummary(responses = []) {
  const totals = new Map();

  responses.forEach((response) => {
    (response.products || []).forEach((product) => {
      const key = product.cip || product.designation || product.product || "Produit";
      const existing = totals.get(key) || {
        designation: product.designation || product.product || "",
        cip: product.cip || "",
        tarif: product.tarif || "",
        colisage: product.colisage || "",
        quantity: 0
      };

      existing.quantity += Number(String(product.quantity || "0").replace(",", ".")) || 0;
      totals.set(key, existing);
    });
  });

  const rows = [...totals.values()].filter((row) => row.quantity > 0);
  if (!rows.length) {
    quantitySummaryTable.innerHTML = '<tr><td colspan="5" class="empty-state">Aucune quantité commandée pour le moment.</td></tr>';
    return;
  }

  quantitySummaryTable.innerHTML = rows
    .sort((a, b) => a.designation.localeCompare(b.designation, "fr"))
    .map((row) => `
      <tr>
        <td>${escapeHtml(row.designation)}</td>
        <td>${escapeHtml(row.cip)}</td>
        <td>${escapeHtml(row.tarif)}</td>
        <td>${escapeHtml(row.colisage)}</td>
        <td><strong>${escapeHtml(row.quantity)}</strong></td>
      </tr>
    `)
    .join("");
}

async function renderPollResults() {
  if (!adminUnlocked || !selectedAdminPoll) return;

  const responses = (await getPollResponses()).filter((item) => item.pollId === selectedAdminPoll.id);
  const counts = new Map((selectedAdminPoll.options || []).map((option) => [option, 0]));
  responses.forEach((response) => {
    counts.set(response.answer, (counts.get(response.answer) || 0) + 1);
  });

  const pollAnsweredNames = [...new Set(responses.map((item) => item.pharmacyName).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "fr"));
  const pollUnansweredNames = unansweredNamesFor(pollAnsweredNames);

  if (pollAnsweredPharmacies) {
    pollAnsweredPharmacies.innerHTML = pharmacyListMarkup(pollAnsweredNames, "Aucune réponse pour le moment.");
  }

  if (pollUnansweredPharmacies) {
    pollUnansweredPharmacies.innerHTML = pharmacyListMarkup(pollUnansweredNames, "Toutes les pharmacies actives ont répondu.");
  }
  const metricCards = [
    `<div><span>${responses.length}</span><p>Réponse${responses.length > 1 ? "s" : ""}</p></div>`,
    `<div><span>${pollUnansweredNames.length}</span><p>sans réponse</p></div>`,
    ...(selectedAdminPoll.options || []).map((option) => `
      <div>
        <span>${counts.get(option) || 0}</span>
        <p>${escapeHtml(option)}</p>
      </div>
    `)
  ];
  pollResultsSummary.innerHTML = metricCards.join("");

  if (!responses.length) {
    pollResponsesTable.innerHTML = '<tr><td colspan="4" class="empty-state">Aucune réponse enregistrée pour le moment.</td></tr>';
    return;
  }

  pollResponsesTable.innerHTML = responses
    .slice()
    .reverse()
    .map((response) => `
      <tr>
        <td>${escapeHtml(response.createdAt)}</td>
        <td><strong>${escapeHtml(response.pharmacyName)}</strong></td>
        <td>${escapeHtml(response.answer)}</td>
        <td>${escapeHtml(response.freeText || "-")}</td>
      </tr>
    `)
    .join("");
}

async function exportPollToExcel() {
  if (!selectedAdminPoll) return;

  if (API_AVAILABLE && adminUnlocked) {
    window.location.href = `/api/poll-export.xls?code=${encodeURIComponent(ADMIN_CODE)}&poll=${encodeURIComponent(selectedAdminPoll.id)}`;
    adminMessage.textContent = "Export Excel du sondage généré.";
    return;
  }

  const responses = (await getPollResponses()).filter((item) => item.pollId === selectedAdminPoll.id);
  if (!responses.length) {
    adminMessage.textContent = "Aucune donnée de sondage à exporter.";
    return;
  }

  const headings = ["Date", "Pharmacie", "Question", "Réponse", "Commentaire / précision"];
  const body = responses.map((row) => `
    <tr>
      <td>${escapeHtml(row.createdAt)}</td>
      <td>${escapeHtml(row.pharmacyName)}</td>
      <td>${escapeHtml(row.pollQuestion)}</td>
      <td>${escapeHtml(row.answer)}</td>
      <td>${escapeHtml(row.freeText || "")}</td>
    </tr>
  `).join("");

  const workbook = `
    <html>
      <head><meta charset="utf-8"></head>
      <body>
        <table border="1">
          <thead><tr>${headings.map((heading) => `<th>${heading}</th>`).join("")}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([workbook], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `sondage-soguasphar-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  adminMessage.textContent = "Export Excel du sondage généré.";
}

async function exportToExcel() {
  if (API_AVAILABLE && adminUnlocked && selectedAdminCampaign) {
    window.location.href = `/api/export.xls?code=${encodeURIComponent(ADMIN_CODE)}&campaign=${encodeURIComponent(selectedAdminCampaign.id)}`;
    adminMessage.textContent = "Export Excel généré.";
    return;
  }

  const responses = (await getResponses())
    .filter((item) => item.campaignId === selectedAdminCampaign?.id || (!item.campaignId && selectedAdminCampaign?.id === "herboristerie"));
  if (!responses.length) {
    adminMessage.textContent = "Aucune donnée à exporter.";
    return;
  }

  const rows = responses.flatMap((response) => {
    if (!response.products.length) {
      return [{
        date: response.createdAt,
        updatedAt: response.updatedAt || "",
        pharmacie: response.pharmacyName,
        statut: response.interest,
        designation: "",
        cip: "",
        tarif: "",
        colisage: "",
        quantite: "",
        commentaire: response.notes || ""
      }];
    }

    return response.products.map((item) => ({
      date: response.createdAt,
      updatedAt: response.updatedAt || "",
      pharmacie: response.pharmacyName,
      statut: response.interest,
      designation: item.designation || item.product || "",
      cip: item.cip || "",
      tarif: item.tarif || "",
      colisage: item.colisage || "",
      quantite: item.quantity,
      commentaire: response.notes || ""
    }));
  });

  const headings = ["Date", "Modifié le", "Pharmacie", "Statut", "Désignation", "CIP", "Tarif", "Colisage", "Quantité", "Commentaire"];
  const body = rows.map((row) => `
    <tr>
      <td>${escapeHtml(row.date)}</td>
      <td>${escapeHtml(row.updatedAt)}</td>
      <td>${escapeHtml(row.pharmacie)}</td>
      <td>${escapeHtml(row.statut)}</td>
      <td>${escapeHtml(row.designation)}</td>
      <td>${escapeHtml(row.cip)}</td>
      <td>${escapeHtml(row.tarif)}</td>
      <td>${escapeHtml(row.colisage)}</td>
      <td>${escapeHtml(row.quantite)}</td>
      <td>${escapeHtml(row.commentaire)}</td>
    </tr>
  `).join("");

  const workbook = `
    <html>
      <head><meta charset="utf-8"></head>
      <body>
        <table border="1">
          <thead><tr>${headings.map((heading) => `<th>${heading}</th>`).join("")}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([workbook], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `recap-soguasphar-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  adminMessage.textContent = "Export Excel généré.";
}

document.querySelectorAll(".switch-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    document.querySelectorAll(".switch-btn").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".view").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.view}`).classList.add("active");
    await renderAdmin();
  });
});

document.addEventListener("click", (event) => {
  const previewLink = event.target.closest("[data-preview-image]");
  if (previewLink) {
    event.preventDefault();
    const image = previewLink.querySelector("img");
    openImagePreview(previewLink.getAttribute("href"), image?.alt || "Image");
    return;
  }

  if (event.target.closest("[data-close-image-preview]")) {
    closeImagePreview();
  }
});

imagePreviewClose?.addEventListener("click", closeImagePreview);
imagePreviewCloseBtn?.addEventListener("click", closeImagePreview);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeImagePreview();
  }
});

document.querySelectorAll('input[name="interest"]').forEach((input) => {
  input.addEventListener("change", updateQuantityVisibility);
});

productRows?.addEventListener("input", (event) => {
  const input = event.target.closest(".product-quantity");
  if (input) validateQuantityInput(input);
});

productRows?.addEventListener("change", (event) => {
  const input = event.target.closest(".product-quantity");
  if (input) validateQuantityInput(input);
});

adminDashboardNav?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-admin-section]");
  if (!button) return;
  showAdminSection(button.dataset.adminSection);
});

pharmacyLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = pharmacyPassword.value.trim();
  if (!password) {
    pharmacyLoginMessage.textContent = "Indiquez le mot de passe pharmacie.";
    return;
  }

  try {
    const pharmacy = await loginPharmacy(password);
    if (pharmacy.mustChangePassword) {
      pendingPasswordPharmacy = pharmacy;
      pendingInitialPassword = password;
      pharmacyPassword.value = "";
      pharmacyLoginMessage.textContent = "";
      renderPharmacyAccess();
      newPharmacyPassword.focus();
      return;
    }

    currentPharmacy = pharmacy;
    localStorage.setItem(PHARMACY_SESSION_KEY, JSON.stringify(currentPharmacy));
    pharmacyPassword.value = "";
    pharmacyLoginMessage.textContent = "";
    await refreshPharmacyPollAnswers();
    await refreshPharmacyCampaignResponses();
    renderCampaignPickers();
    showCampaignPicker();
    renderPharmacyAccess();
  } catch {
    pharmacyLoginMessage.textContent = "Mot de passe pharmacie incorrect.";
  }
});

pharmacyPasswordChangeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!pendingPasswordPharmacy || !pendingInitialPassword) {
    pharmacyLoginMessage.textContent = "Reconnectez-vous avec le mot de passe transmis.";
    pendingPasswordPharmacy = null;
    pendingInitialPassword = "";
    renderPharmacyAccess();
    return;
  }

  const newPassword = newPharmacyPassword.value.trim();
  const confirmation = confirmPharmacyPassword.value.trim();

  if (newPassword.length < 6) {
    pharmacyLoginMessage.textContent = "Le nouveau mot de passe doit contenir au moins 6 caractères.";
    return;
  }

  if (newPassword !== confirmation) {
    pharmacyLoginMessage.textContent = "Les deux mots de passe ne sont pas identiques.";
    return;
  }

  try {
    currentPharmacy = await changePharmacyPassword(pendingPasswordPharmacy.id, pendingInitialPassword, newPassword);
    localStorage.setItem(PHARMACY_SESSION_KEY, JSON.stringify(currentPharmacy));
    pendingPasswordPharmacy = null;
    pendingInitialPassword = "";
    newPharmacyPassword.value = "";
    confirmPharmacyPassword.value = "";
    pharmacyLoginMessage.textContent = "";
    await refreshPharmacyPollAnswers();
    await refreshPharmacyCampaignResponses();
    renderCampaignPickers();
    showCampaignPicker();
    renderPharmacyAccess();
  } catch {
    pharmacyLoginMessage.textContent = "Impossible d'enregistrer ce mot de passe. Réessayez.";
  }
});

logoutPharmacyBtn.addEventListener("click", () => {
  currentPharmacy = null;
  pendingPasswordPharmacy = null;
  pendingInitialPassword = "";
  pharmacyPollAnswers = {};
  pharmacyCampaignResponses = {};
  localStorage.removeItem(PHARMACY_SESSION_KEY);
  renderCampaignPickers();
  showCampaignPicker();
});

campaignCards.addEventListener("click", (event) => {
  if (event.target.closest("[data-preview-image]")) return;
  const button = event.target.closest("[data-form-campaign]");
  if (!button) return;
  selectCampaign(button.dataset.formCampaign);
});

campaignCards.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  if (event.target.closest("[data-preview-image], button, input, textarea")) return;
  const card = event.target.closest("[data-form-campaign]");
  if (!card) return;
  event.preventDefault();
  selectCampaign(card.dataset.formCampaign);
});

pollCards.addEventListener("click", (event) => {
  if (event.target.closest("form")) return;
  const button = event.target.closest("[data-form-poll]");
  if (!button) return;
  selectPoll(button.dataset.formPoll);
});

pollCards.addEventListener("change", (event) => {
  const form = event.target.closest("[data-inline-poll-form]");
  if (!form) return;
  form.querySelectorAll(".poll-choice").forEach((choice) => {
    choice.classList.toggle("is-selected", Boolean(choice.querySelector("input")?.checked));
  });
});

pollCards.addEventListener("submit", async (event) => {
  const inlineForm = event.target.closest("[data-inline-poll-form]");
  if (!inlineForm) return;
  event.preventDefault();

  const poll = polls.find((item) => item.id === inlineForm.dataset.inlinePollForm);
  const message = inlineForm.querySelector(".inline-poll-message");
  if (!poll) return;

  const selectedAnswer = inlineForm.querySelector('input[name="inlinePollAnswer"]:checked')?.value || "";
  const pharmacyName = currentPharmacy?.name || inlineForm.querySelector('[name="inlinePollPharmacy"]')?.value.trim() || "";
  const freeText = inlineForm.querySelector('[name="inlinePollFreeText"]')?.value.trim() || "";

  if (!pharmacyName || !selectedAnswer) {
    if (message) message.textContent = "Le nom de la pharmacie et la réponse sont obligatoires.";
    return;
  }

  if (poll.freeTextRequired && !freeText) {
    if (message) message.textContent = "Merci de remplir le champ demandé.";
    return;
  }

  await savePollAnswer(poll, selectedAnswer, pharmacyName, freeText);
  selectedPoll = null;
  renderCampaignPickers();
  await renderPollResults();
});

pollOptions.addEventListener("change", updatePollChoiceSelection);

adminCampaignCards.addEventListener("click", async (event) => {
  const deleteButton = event.target.closest("[data-delete-campaign]");
  if (deleteButton) {
    const campaign = campaigns.find((item) => item.id === deleteButton.dataset.deleteCampaign);
    if (!campaign) return;
    const confirmed = confirm(`Supprimer définitivement la campagne "${campaign.title}" ?\n\nCette action supprimera aussi son bon de commande de la liste des campagnes.`);
    if (!confirmed) return;
    campaigns = campaigns.filter((item) => item.id !== campaign.id);
    if (selectedAdminCampaign?.id === campaign.id) selectedAdminCampaign = null;
    await saveCampaigns(campaigns);
    renderCampaignPickers();
    adminMessage.textContent = `Campagne "${campaign.title}" supprimée.`;
    return;
  }

  const toggleButton = event.target.closest("[data-toggle-closed-campaign]");
  if (toggleButton) {
    const campaign = campaigns.find((item) => item.id === toggleButton.dataset.toggleClosedCampaign);
    if (!campaign) return;
    const nextClosed = !campaign.closed;
    const confirmed = confirm(nextClosed
      ? `Clôturer la campagne "${campaign.title}" ?\n\nElle ne sera plus visible par les adhérents, mais restera consultable côté admin.`
      : `Rouvrir la campagne "${campaign.title}" ?\n\nElle redeviendra visible par les adhérents.`);
    if (!confirmed) return;
    campaign.closed = nextClosed;
    campaigns = campaigns.map((item) => item.id === campaign.id ? campaign : item);
    await saveCampaigns(campaigns);
    renderCampaignPickers();
    adminMessage.textContent = nextClosed ? `Campagne "${campaign.title}" clôturée.` : `Campagne "${campaign.title}" rouverte.`;
    return;
  }

  const button = event.target.closest("[data-admin-campaign]");
  if (!button) return;
  await selectAdminCampaign(button.dataset.adminCampaign);
});

adminPollCards.addEventListener("click", async (event) => {
  const deleteButton = event.target.closest("[data-delete-poll]");
  if (deleteButton) {
    const poll = polls.find((item) => item.id === deleteButton.dataset.deletePoll);
    if (!poll) return;
    const confirmed = confirm(`Supprimer définitivement le sondage "${poll.question}" ?`);
    if (!confirmed) return;
    polls = polls.filter((item) => item.id !== poll.id);
    if (selectedAdminPoll?.id === poll.id) selectedAdminPoll = null;
    await savePolls(polls);
    showAdminCampaignPicker();
    adminMessage.textContent = `Sondage "${poll.question}" supprimé.`;
    return;
  }

  const toggleButton = event.target.closest("[data-toggle-closed-poll]");
  if (toggleButton) {
    const poll = polls.find((item) => item.id === toggleButton.dataset.toggleClosedPoll);
    if (!poll) return;
    const nextClosed = !poll.closed;
    const confirmed = confirm(nextClosed
      ? `Clôturer le sondage "${poll.question}" ?\n\nIl ne sera plus visible par les adhérents, mais restera consultable côté admin.`
      : `Rouvrir le sondage "${poll.question}" ?\n\nIl redeviendra visible par les adhérents.`);
    if (!confirmed) return;
    poll.closed = nextClosed;
    polls = polls.map((item) => item.id === poll.id ? poll : item);
    await savePolls(polls);
    renderCampaignPickers();
    adminMessage.textContent = nextClosed ? `Sondage "${poll.question}" clôturé.` : `Sondage "${poll.question}" rouvert.`;
    return;
  }

  const button = event.target.closest("[data-admin-poll]");
  if (!button) return;
  await selectAdminPoll(button.dataset.adminPoll);
});

backToCampaignsBtn.addEventListener("click", showCampaignPicker);
backToPollsBtn.addEventListener("click", showCampaignPicker);
backToAdminCampaignsBtn.addEventListener("click", async () => {
  activeAdminSection = "campaigns";
  await showAdminCampaignPicker();
});
backToAdminPollsBtn.addEventListener("click", async () => {
  activeAdminSection = "polls";
  await showAdminCampaignPicker();
});
returnToMenuBtn.addEventListener("click", showCampaignPicker);

showClosedCampaignsBtn.addEventListener("click", () => {
  adminShowingClosedCampaigns = !adminShowingClosedCampaigns;
  renderCampaignPickers();
});

saveCampaignMessageBtn.addEventListener("click", async () => {
  if (!selectedAdminCampaign) return;
  selectedAdminCampaign.pharmacyMessage = campaignPharmacyMessage.value.trim();
  selectedAdminCampaign.description = selectedAdminCampaign.pharmacyMessage || selectedAdminCampaign.description || "Précommande à compléter.";
  campaigns = campaigns.map((campaign) => campaign.id === selectedAdminCampaign.id ? selectedAdminCampaign : campaign);
  await saveCampaigns(campaigns);
  renderCampaignPickers();
  adminMessage.textContent = "Message pharmacie enregistré.";
});

campaignImageFile.addEventListener("change", async () => {
  const file = campaignImageFile.files[0];
  if (!file || !selectedAdminCampaign) return;

  try {
    campaignImageMessage.textContent = "Préparation de l'image...";
    selectedAdminCampaign.imageData = await imageFileToDataUrl(file);
    campaigns = campaigns.map((campaign) => campaign.id === selectedAdminCampaign.id ? selectedAdminCampaign : campaign);
    await saveCampaigns(campaigns);
    refreshCampaignImagePreview(selectedAdminCampaign);
    renderCampaignPickers();
    campaignImageMessage.textContent = "Image enregistrée.";
  } catch (error) {
    campaignImageMessage.textContent = error.message;
  } finally {
    campaignImageFile.value = "";
  }
});

campaignImageFile2.addEventListener("change", async () => {
  const file = campaignImageFile2.files[0];
  if (!file || !selectedAdminCampaign) return;

  try {
    campaignImageMessage.textContent = "Préparation de la deuxième image...";
    selectedAdminCampaign.imageData2 = await imageFileToDataUrl(file);
    campaigns = campaigns.map((campaign) => campaign.id === selectedAdminCampaign.id ? selectedAdminCampaign : campaign);
    await saveCampaigns(campaigns);
    refreshCampaignImagePreview(selectedAdminCampaign);
    renderCampaignPickers();
    campaignImageMessage.textContent = "Deuxième image enregistrée.";
  } catch (error) {
    campaignImageMessage.textContent = error.message;
  } finally {
    campaignImageFile2.value = "";
  }
});

removeCampaignImageBtn.addEventListener("click", async () => {
  if (!selectedAdminCampaign) return;
  const confirmed = selectedAdminCampaign.imageData ? confirm("Retirer l'image de cette commande ?") : true;
  if (!confirmed) return;
  selectedAdminCampaign.imageData = "";
  campaigns = campaigns.map((campaign) => campaign.id === selectedAdminCampaign.id ? selectedAdminCampaign : campaign);
  await saveCampaigns(campaigns);
  refreshCampaignImagePreview(selectedAdminCampaign);
  renderCampaignPickers();
  campaignImageMessage.textContent = "Image retirée.";
});

removeCampaignImageBtn2.addEventListener("click", async () => {
  if (!selectedAdminCampaign) return;
  const confirmed = selectedAdminCampaign.imageData2 ? confirm("Retirer la deuxième image de cette commande ?") : true;
  if (!confirmed) return;
  selectedAdminCampaign.imageData2 = "";
  campaigns = campaigns.map((campaign) => campaign.id === selectedAdminCampaign.id ? selectedAdminCampaign : campaign);
  await saveCampaigns(campaigns);
  refreshCampaignImagePreview(selectedAdminCampaign);
  renderCampaignPickers();
  campaignImageMessage.textContent = "Deuxième image retirée.";
});

createCampaignForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = newCampaignTitle.value.trim();
  if (!title) {
    adminMessage.textContent = "Indiquez un nom de précommande.";
    return;
  }

  const baseId = slugify(title);
  let id = baseId;
  let index = 2;
  while (campaigns.some((campaign) => campaign.id === id)) {
    id = `${baseId}-${index}`;
    index += 1;
  }

  const campaign = {
    id,
    title,
    type: "Précommande",
    description: "Nouvelle précommande à paramétrer.",
    pharmacyMessage: "",
    imageData: "",
    imageData2: "",
    closed: false,
    template: []
  };

  campaigns = [...campaigns, campaign];
  await saveCampaigns(campaigns);
  newCampaignTitle.value = "";
  showAdminSection("campaigns");
  adminMessage.textContent = `Précommande "${title}" ajoutée. Ouvrez-la puis importez son bon Excel.`;
});

createPollForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = newPollQuestion.value.trim();
  const options = newPollOptions.value
    .split(/\r?\n/)
    .map((option) => option.trim())
    .filter(Boolean);

  if (!question) {
    adminMessage.textContent = "Indiquez la question du sondage.";
    return;
  }

  if (options.length < 2) {
    adminMessage.textContent = "Indiquez au moins deux réponses possibles, une par ligne.";
    return;
  }

  const baseId = slugify(question);
  let id = baseId;
  let index = 2;
  while (polls.some((poll) => poll.id === id)) {
    id = `${baseId}-${index}`;
    index += 1;
  }

  const poll = {
    id,
    question,
    type: "Sondage",
    options,
    freeTextLabel: newPollFreeLabel.value.trim(),
    freeTextRequired: newPollFreeRequired.checked,
    closed: false
  };

  polls = [...polls, poll];
  await savePolls(polls);
  createPollForm.reset();
  showAdminSection("polls");
  adminMessage.textContent = `Sondage "${question}" créé.`;
});

createPharmacyForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = newPharmacyName.value.trim();
  if (!name) {
    adminMessage.textContent = "Indiquez le nom de la pharmacie.";
    return;
  }

  const pharmacy = {
    id: `pharmacy-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    password: generatePharmacyPassword(name),
    active: true,
    mustChangePassword: true
  };

  pharmacies = await savePharmacies([...pharmacies, pharmacy]);
  newPharmacyName.value = "";
  renderPharmacyAccounts();
  renderPharmacyAccess();
  showAdminSection("pharmacies");
  adminMessage.textContent = `Accès créé pour ${name}. Mot de passe : ${pharmacy.password}`;
});

pharmacyAccountsList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-pharmacy]");
  if (!button) return;
  const pharmacy = pharmacies.find((item) => item.id === button.dataset.deletePharmacy);
  if (!pharmacy) return;
  const confirmed = confirm(`Supprimer l'accès de ${pharmacy.name} ?`);
  if (!confirmed) return;
  pharmacies = await savePharmacies(pharmacies.filter((item) => item.id !== pharmacy.id));
  if (currentPharmacy?.id === pharmacy.id) {
    currentPharmacy = null;
    localStorage.removeItem(PHARMACY_SESSION_KEY);
  }
  renderPharmacyAccounts();
  renderPharmacyAccess();
  adminMessage.textContent = `Accès supprimé pour ${pharmacy.name}.`;
});

orderFile.addEventListener("change", async () => {
  const file = orderFile.files[0];
  if (!file) return;

  try {
    const rows = await parseOrderFile(file);
    if (selectedAdminCampaign) {
      selectedAdminCampaign.template = rows;
      campaigns = campaigns.map((campaign) => campaign.id === selectedAdminCampaign.id ? selectedAdminCampaign : campaign);
      await saveCampaigns(campaigns);
    } else {
      await saveOrderTemplate(rows);
    }
    currentOrderTemplate = rows;
    renderOrderTemplate();
    renderCampaignPickers();
    orderAdminMessage.textContent = `${rows.length} lignes importées dans le bon de commande.`;
  } catch (error) {
    orderAdminMessage.textContent = error.message;
  } finally {
    orderFile.value = "";
  }
});

downloadTemplateBtn.addEventListener("click", () => {
  const workbook = `
    <html>
      <head><meta charset="utf-8"></head>
      <body>
        <table border="1">
          <thead>
            <tr><th>Désignation</th><th>CIP</th><th>Tarif</th><th>Colisage</th></tr>
          </thead>
          <tbody>
            <tr><td>Exemple produit</td><td>3400000000000</td><td>12,50</td><td>6</td></tr>
          </tbody>
        </table>
      </body>
    </html>
  `;
  const blob = new Blob([workbook], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "modele-bon-commande-soguasphar.xls";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

pollForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!selectedPoll) {
    pollMessage.textContent = "Veuillez choisir un sondage avant d'envoyer une réponse.";
    return;
  }

  const selectedAnswer = pollForm.querySelector('input[name="pollAnswer"]:checked')?.value || "";
  const pharmacyName = pollPharmacyName.value.trim();
  const freeText = pollFreeText.value.trim();

  if (!pharmacyName || !selectedAnswer) {
    pollMessage.textContent = "Le nom de la pharmacie et la réponse sont obligatoires.";
    return;
  }

  if (selectedPoll.freeTextRequired && !freeText) {
    pollMessage.textContent = "Merci de remplir le champ demandé.";
    return;
  }

  await savePollAnswer(selectedPoll, selectedAnswer, pharmacyName, freeText);
  renderCampaignPickers();
  pollForm.reset();
  await renderPollResults();
  showSuccessScreen();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!selectedCampaign) {
    formMessage.textContent = "Veuillez choisir une commande avant d'envoyer une réponse.";
    return;
  }

  const formData = new FormData(form);
  const pharmacyName = String(formData.get("pharmacyName") || "").trim();
  const interest = String(formData.get("interest") || "").trim();

  if (!pharmacyName || !interest) {
    formMessage.textContent = "Le nom de la pharmacie et la réponse sont obligatoires.";
    return;
  }

  if (interest !== "Pas intéressé") {
    const colisageError = validateColisageQuantities();
    if (colisageError) {
      formMessage.textContent = colisageError;
      return;
    }
  }

  const existingResponse = pharmacyCampaignResponses[selectedCampaign.id];
  const now = new Date().toLocaleString("fr-FR");
  const response = {
    id: existingResponse?.id || createId(),
    campaignId: selectedCampaign.id,
    campaignTitle: selectedCampaign.title,
    createdAt: existingResponse?.createdAt || now,
    updatedAt: existingResponse ? now : "",
    pharmacyId: currentPharmacy?.id || "",
    pharmacyName,
    interest,
    products: interest === "Pas intéressé" ? [] : collectProducts(),
    notes: String(formData.get("notes") || "").trim()
  };

  let savedResponse;
  try {
    savedResponse = await appendResponse(response);
  } catch (error) {
    formMessage.textContent = error.message || "Enregistrement impossible. Merci de vérifier les quantités.";
    return;
  }

  pharmacyCampaignResponses[selectedCampaign.id] = savedResponse || response;
  renderCampaignPickers();
  preserveSubmitMessage = true;
  form.reset();
  resetQuantities();
  updateQuantityVisibility();
  await renderAdmin();
  showSuccessScreen();
});

form.addEventListener("reset", () => {
  setTimeout(() => {
    resetQuantities();
    updateQuantityVisibility();
    if (preserveSubmitMessage) {
      preserveSubmitMessage = false;
    } else {
      formMessage.textContent = "";
    }
  });
});

adminLogin.addEventListener("submit", async (event) => {
  event.preventDefault();
  const code = document.querySelector("#adminCode").value.trim();
  if (code !== ADMIN_CODE) {
    adminMessage.textContent = "Code administrateur incorrect.";
    return;
  }

  adminUnlocked = true;
  adminPanel.hidden = true;
  document.querySelector(".admin-layout").classList.add("unlocked");
  adminContent.hidden = false;
  adminContent.classList.remove("locked");
  pharmacies = await getPharmacies(true);
  renderPharmacyAccounts();
  await showAdminCampaignPicker();
  adminMessage.textContent = "Accès administrateur ouvert.";
});

exportExcelBtn.addEventListener("click", exportToExcel);
exportPollExcelBtn.addEventListener("click", exportPollToExcel);

responsesTable.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-response]");
  if (!button) return;
  const row = button.closest("tr");
  const pharmacy = row?.children[2]?.textContent?.trim() || "cette pharmacie";
  const confirmed = confirm(`Supprimer la réponse de ${pharmacy} ?`);
  if (!confirmed) return;
  try {
    await deleteResponse(button.dataset.deleteResponse);
    await renderAdmin();
    adminMessage.textContent = `Réponse de ${pharmacy} supprimée.`;
  } catch (error) {
    adminMessage.textContent = "Suppression impossible. Redémarrez le site puis réessayez.";
  }
});

quantitySummaryBtn.addEventListener("click", () => {
  quantitySummary.hidden = !quantitySummary.hidden;
  quantitySummaryBtn.textContent = quantitySummary.hidden ? "Récap des quantités" : "Masquer le récap";
});

async function init() {
  campaigns = await getCampaigns();
  polls = await getPolls();
  const pharmacyInfo = await getPharmacies(false);
  if (pharmacyInfo && typeof pharmacyInfo.count === "number" && pharmacyInfo.count === 0) {
    pharmacies = [];
  } else if (adminUnlocked) {
    pharmacies = await getPharmacies(true);
  } else {
    pharmacies = new Array(pharmacyInfo.count || 0).fill(null);
  }
  await refreshPharmacyPollAnswers();
  await refreshPharmacyCampaignResponses();
  renderCampaignPickers();
  showCampaignPicker();
  await showAdminCampaignPicker();
  renderPharmacyAccess();
}

init();
