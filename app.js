const STORAGE_KEY = "soguasphar_pharmacy_requests";
const ORDER_TEMPLATE_KEY = "soguasphar_order_template";
const POLL_RESPONSES_KEY = "soguasphar_poll_responses";
const POLL_ANSWERED_KEY = "soguasphar_answered_polls";
const INFO_FORMS_KEY = "soguasphar_info_forms_preview";
const INFO_RESPONSES_KEY = "soguasphar_info_responses_preview";
const BAT_RESPONSES_KEY = "soguasphar_bat_responses_preview";
const VALIDATION_DOCUMENTS_KEY = "soguasphar_validation_documents_preview";
const VALIDATION_TITLE_KEY = "soguasphar_validation_title_preview";
const VALIDATION_MESSAGE_KEY = "soguasphar_validation_message_preview";
const VALIDATION_ARCHIVED_KEY = "soguasphar_validation_archived_preview";
const ADMIN_CODE = "SOGUASPHAR2026";
const API_AVAILABLE = location.protocol === "http:" || location.protocol === "https:";
const PHARMACY_SESSION_KEY = "soguasphar_current_pharmacy";

const form = document.querySelector("#requestForm");
const pharmacyGate = document.querySelector("#pharmacyGate");
const pharmacyLoginForm = document.querySelector("#pharmacyLoginForm");
const pharmacyPassword = document.querySelector("#pharmacyPassword");
const togglePharmacyPassword = document.querySelector("#togglePharmacyPassword");
const forgotPharmacyPasswordBtn = document.querySelector("#forgotPharmacyPasswordBtn");
const forgotPharmacyPasswordForm = document.querySelector("#forgotPharmacyPasswordForm");
const forgotPharmacyName = document.querySelector("#forgotPharmacyName");
const pharmacyPasswordChangeForm = document.querySelector("#pharmacyPasswordChangeForm");
const newPharmacyPassword = document.querySelector("#newPharmacyPassword");
const confirmPharmacyPassword = document.querySelector("#confirmPharmacyPassword");
const pharmacyLoginMessage = document.querySelector("#pharmacyLoginMessage");
const pharmacySessionBar = document.querySelector("#pharmacySessionBar");
const currentPharmacyName = document.querySelector("#currentPharmacyName");
const logoutPharmacyBtn = document.querySelector("#logoutPharmacyBtn");
const heroActionsRow = document.querySelector(".hero-actions-row");
const heroBand = document.querySelector(".hero-band");
const campaignPicker = document.querySelector("#campaignPicker");
const campaignCards = document.querySelector("#campaignCards");
const toggleArchivedOrdersBtn = document.querySelector("#toggleArchivedOrdersBtn");
const archivedOrdersPanel = document.querySelector("#archivedOrdersPanel");
const backToArchivedOrdersMenuBtn = document.querySelector("#backToArchivedOrdersMenuBtn");
const downloadArchivedOrdersPdfBtn = document.querySelector("#downloadArchivedOrdersPdfBtn");
const archivedOrdersRows = document.querySelector("#archivedOrdersRows");
const archivedOrdersEmpty = document.querySelector("#archivedOrdersEmpty");
const batCards = document.querySelector("#batCards");
const pollCards = document.querySelector("#pollCards");
const infoCards = document.querySelector("#infoCards");
const backToCampaignsBtn = document.querySelector("#backToCampaignsBtn");
const campaignNotice = document.querySelector("#campaignNotice");
const responseSuccess = document.querySelector("#responseSuccess");
const returnToMenuBtn = document.querySelector("#returnToMenuBtn");
const batValidationForm = document.querySelector("#batValidationForm");
const backToBatListBtn = document.querySelector("#backToBatListBtn");
const batFormTitle = document.querySelector("#batFormTitle");
const batPdfTitle = document.querySelector("#batPdfTitle");
const batDocumentPreview = document.querySelector("#batDocumentPreview");
const batDocumentPdfPreview = document.querySelector("#batDocumentPdfPreview");
const batPdfOpenLink = document.querySelector("#batPdfOpenLink");
const batPharmacyName = document.querySelector("#batPharmacyName");
const batComment = document.querySelector("#batComment");
const batMessage = document.querySelector("#batMessage");
const pollForm = document.querySelector("#pollForm");
const backToPollsBtn = document.querySelector("#backToPollsBtn");
const pollPharmacyName = document.querySelector("#pollPharmacyName");
const pollQuestionTitle = document.querySelector("#pollQuestionTitle");
const pollOptions = document.querySelector("#pollOptions");
const pollFreeTextBlock = document.querySelector("#pollFreeTextBlock");
const pollFreeTextLabel = document.querySelector("#pollFreeTextLabel");
const pollFreeText = document.querySelector("#pollFreeText");
const pollMessage = document.querySelector("#pollMessage");
const profileUpdateForm = document.querySelector("#profileUpdateForm");
const backToInfoFormsBtn = document.querySelector("#backToInfoFormsBtn");
const profileFormTitle = document.querySelector("#profileFormTitle");
const profileFormIntro = document.querySelector("#profileFormIntro");
const profilePharmacyName = document.querySelector("#profilePharmacyName");
const profileAddress = document.querySelector("#profileAddress");
const profilePostalCode = document.querySelector("#profilePostalCode");
const profileCity = document.querySelector("#profileCity");
const profilePhone = document.querySelector("#profilePhone");
const profileOwnerEmail = document.querySelector("#profileOwnerEmail");
const profileTeamEmail = document.querySelector("#profileTeamEmail");
const profileFacebook = document.querySelector("#profileFacebook");
const profileInstagram = document.querySelector("#profileInstagram");
const profileLinkedin = document.querySelector("#profileLinkedin");
const profileTiktok = document.querySelector("#profileTiktok");
const profileWebsite = document.querySelector("#profileWebsite");
const profileHoursGrid = document.querySelector("#profileHoursGrid");
const profileServicesGrid = document.querySelector("#profileServicesGrid");
const profileOtherServices = document.querySelector("#profileOtherServices");
const profileNotes = document.querySelector("#profileNotes");
const profileMessage = document.querySelector("#profileMessage");
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
const adminResetAlert = document.querySelector("#adminResetAlert");
const adminCampaignTitle = document.querySelector("#adminCampaignTitle");
const adminSectionIntro = document.querySelector("#adminSectionIntro");
const adminCampaignCards = document.querySelector("#adminCampaignCards");
const createValidationForm = document.querySelector("#createValidationForm");
const adminBatBlock = document.querySelector("#adminBatBlock");
const adminBatCards = document.querySelector("#adminBatCards");
const adminBatDetail = document.querySelector("#adminBatDetail");
const backToAdminBatBtn = document.querySelector("#backToAdminBatBtn");
const batAdminMessage = document.querySelector("#batAdminMessage");
const saveBatAdminMessageBtn = document.querySelector("#saveBatAdminMessageBtn");
const validationDocumentInput = document.querySelector("#validationDocumentInput");
const validationImportMessage = document.querySelector("#validationImportMessage");
const adminValidationDocumentInput = document.querySelector("#adminValidationDocumentInput");
const adminValidationImportMessage = document.querySelector("#adminValidationImportMessage");
const batResultsSummary = document.querySelector("#batResultsSummary");
const batValidatedPharmacies = document.querySelector("#batValidatedPharmacies");
const batCorrectionPharmacies = document.querySelector("#batCorrectionPharmacies");
const batUnansweredPharmacies = document.querySelector("#batUnansweredPharmacies");
const batDocumentsTable = document.querySelector("#batDocumentsTable");
const batResponsesTable = document.querySelector("#batResponsesTable");
let batDocumentsExpanded = false;
const createCampaignForm = document.querySelector("#createCampaignForm");
const newCampaignTitle = document.querySelector("#newCampaignTitle");
const createPollForm = document.querySelector("#createPollForm");
const newPollQuestion = document.querySelector("#newPollQuestion");
const newPollOptions = document.querySelector("#newPollOptions");
const newPollFreeLabel = document.querySelector("#newPollFreeLabel");
const newPollFreeRequired = document.querySelector("#newPollFreeRequired");
const createInfoForm = document.querySelector("#createInfoForm");
const newInfoTitle = document.querySelector("#newInfoTitle");
const newInfoIntro = document.querySelector("#newInfoIntro");
const createPharmacyForm = document.querySelector("#createPharmacyForm");
const newPharmacyName = document.querySelector("#newPharmacyName");
const pharmacyAccountsList = document.querySelector("#pharmacyAccountsList");
const showClosedCampaignsBtn = document.querySelector("#showClosedCampaignsBtn");
const adminPollCards = document.querySelector("#adminPollCards");
const adminPollBlock = document.querySelector("#adminPollBlock");
const adminInfoBlock = document.querySelector("#adminInfoBlock");
const adminInfoCards = document.querySelector("#adminInfoCards");
const adminInfoDetail = document.querySelector("#adminInfoDetail");
const backToAdminInfoBtn = document.querySelector("#backToAdminInfoBtn");
const adminInfoTitle = document.querySelector("#adminInfoTitle");
const infoResultsSummary = document.querySelector("#infoResultsSummary");
const infoAnsweredPharmacies = document.querySelector("#infoAnsweredPharmacies");
const infoUnansweredPharmacies = document.querySelector("#infoUnansweredPharmacies");
const infoResponsesTable = document.querySelector("#infoResponsesTable");
const exportInfoExcelBtn = document.querySelector("#exportInfoExcelBtn");
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
let infoForms = [];
let infoResponses = [];
let batResponses = [];
let validationConfigState = {
  title: "",
  description: "",
  archived: false
};
let pharmacies = [];
let currentPharmacy = JSON.parse(localStorage.getItem(PHARMACY_SESSION_KEY) || "null");
let pendingPasswordPharmacy = null;
let pendingInitialPassword = "";
let pharmacyPollAnswers = {};
let pharmacyCampaignResponses = {};
let selectedCampaign = null;
let selectedPoll = null;
let selectedInfoForm = null;
let selectedBatDocument = null;
let selectedAdminCampaign = null;
let selectedAdminPoll = null;
let selectedAdminInfoForm = null;
let currentOrderTemplate = [];
let adminShowingClosedCampaigns = false;
let pollResponseCounts = {};
let activeAdminSection = "new-campaign";
let archivedOrdersVisible = false;

const ADMIN_SECTIONS = {
  "new-campaign": {
    title: "Créer une précommande",
    intro: "Indiquez le nom de la campagne, puis ouvrez-la pour importer son bon de commande."
  },
  "new-poll": {
    title: "Créer un sondage",
    intro: "Créez un sondage rapide ou une demande de mise à jour de fiche pharmacie."
  },
  "new-validation": {
    title: "Nouvelle validation",
    intro: "Creez une validation de document et indiquez le message visible par les pharmacies."
  },
  campaigns: {
    title: "Campagnes en cours",
    intro: "Retrouvez les précommandes actives, leur suivi et leurs exports."
  },
  bat: {
    title: "Validations en attente",
    intro: "Suivez les documents a valider et les corrections demandees."
  },
  polls: {
    title: "Sondages en cours",
    intro: "Consultez les sondages actifs, les fiches pharmacies et les réponses reçues."
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

const ADMIN_GROUP_DEFAULT_SECTION = {
  new: "new-campaign",
  current: "campaigns",
  archives: "archives",
  pharmacies: "pharmacies"
};

function adminGroupForSection(section) {
  if (section === "archives") return "archives";
  if (section === "pharmacies") return "pharmacies";
  if (section === "campaigns" || section === "polls" || section === "bat") return "current";
  return "new";
}

const BAT_VALIDATION = {
  id: "bat-cadeaux-fin-annee-2026",
  title: "Validation en attente",
  description: "Validation et contrôle."
};

function currentValidationConfig() {
  const title = validationConfigState.title || localStorage.getItem(VALIDATION_TITLE_KEY) || "";
  const description = validationConfigState.description || localStorage.getItem(VALIDATION_MESSAGE_KEY) || "";
  const archived = Boolean(validationConfigState.archived) || localStorage.getItem(VALIDATION_ARCHIVED_KEY) === "true";
  return {
    title: title || BAT_VALIDATION.title,
    description: description || BAT_VALIDATION.description,
    archived,
    exists: Boolean(title || description || batDocuments.length || batResponses.length)
  };
}

let batDocuments = [];

const PROFILE_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

const PROFILE_SERVICE_CATEGORIES = [
  {
    category: "Services divers",
    services: [
      "Livraison à domicile",
      "Paiement à distance VAD",
      "Scan ordonnance",
      "Click and collect",
      "Site ecommerce",
      "PDA",
      "Drive",
      "La carte de fidélité SOGUASCARD",
      "Téléconsultation",
      "Préparation magistrale"
    ]
  },
  {
    category: "Matériel médical, contention et orthopédie",
    services: [
      "Vente et location de matériel médical",
      "Location de tire-lait",
      "Contention",
      "Orthopédie de série",
      "Orthopédie : attelles thermoformées",
      "Chaussures de confort et orthopédiques",
      "Spécialité vétérinaire",
      "Semelle orthopédique"
    ]
  },
  {
    category: "Prothèses",
    services: [
      "Prothèses mammaires",
      "Prothèses capillaires"
    ]
  },
  {
    category: "Nouvelles missions : vaccinations",
    services: [
      "Vaccination grippe",
      "Vaccination covid",
      "Autres vaccinations à partir de 11 ans (HPV, dTcP, pneumocoque, méningite...)",
      "Suivi du statut vaccinal du patient et prescription des vaccins"
    ]
  },
  {
    category: "Nouvelles missions : entretiens, BPM et bilans de prévention",
    services: [
      "Entretien femmes enceintes",
      "Entretien antalgiques opioïdes",
      "Entretien anticoagulants AOD",
      "Entretien asthme",
      "Entretien anticancéreux",
      "BPM - Bilan partagé de médication",
      "Bilan de prévention pour les différentes tranches d'âge",
      "Entretien diététique et nutrition"
    ]
  },
  {
    category: "Nouvelles missions : TROD et kits",
    services: [
      "TROD covid",
      "TROD angine",
      "Prescription suite au TROD angine +",
      "TROD cystite",
      "Prescription suite au TROD cystite +",
      "TROD dengue",
      "Kit cancer colorectal"
    ]
  }
];

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

function localInfoForms() {
  const saved = JSON.parse(localStorage.getItem(INFO_FORMS_KEY) || "[]");
  if (saved.length) return saved;

  return [{
    id: "fiche-pharmacie-2026",
    title: "Mise à jour du site internet SOGUASPHAR : informations pharmacies",
    intro: "Merci de noter vos coordonnées, réseaux sociaux, horaires et services proposés.",
    type: "Fiche pharmacie",
    closed: false
  }];
}

function saveLocalInfoForms(nextForms) {
  localStorage.setItem(INFO_FORMS_KEY, JSON.stringify(nextForms));
}

function localInfoResponses() {
  return JSON.parse(localStorage.getItem(INFO_RESPONSES_KEY) || "[]");
}

function saveLocalInfoResponses(nextResponses) {
  localStorage.setItem(INFO_RESPONSES_KEY, JSON.stringify(nextResponses));
}

function localBatResponses() {
  return JSON.parse(localStorage.getItem(BAT_RESPONSES_KEY) || "[]");
}

function saveLocalBatResponses(nextResponses) {
  localStorage.setItem(BAT_RESPONSES_KEY, JSON.stringify(nextResponses));
}

function localValidationDocuments() {
  return JSON.parse(localStorage.getItem(VALIDATION_DOCUMENTS_KEY) || "[]");
}

function saveLocalValidationDocuments(nextDocuments) {
  localStorage.setItem(VALIDATION_DOCUMENTS_KEY, JSON.stringify(nextDocuments));
}

function localValidationState() {
  return {
    title: localStorage.getItem(VALIDATION_TITLE_KEY) || "",
    description: localStorage.getItem(VALIDATION_MESSAGE_KEY) || "",
    archived: localStorage.getItem(VALIDATION_ARCHIVED_KEY) === "true",
    documents: localValidationDocuments()
  };
}

function saveLocalValidationState(state) {
  localStorage.setItem(VALIDATION_TITLE_KEY, state.title || "");
  localStorage.setItem(VALIDATION_MESSAGE_KEY, state.description || "");
  localStorage.setItem(VALIDATION_ARCHIVED_KEY, state.archived ? "true" : "false");
  saveLocalValidationDocuments(state.documents || []);
}

async function getValidationState() {
  if (API_AVAILABLE) {
    try {
      const remote = await requestJson("/api/validation");
      if (remote && typeof remote === "object") return remote;
    } catch {
      // Fallback for preview servers without validation API.
    }
  }
  if (validationConfigState.title || validationConfigState.description || batDocuments.length) {
    return {
      ...validationConfigState,
      documents: batDocuments
    };
  }
  return localValidationState();
}

async function saveValidationState(nextState) {
  const payload = {
    title: nextState.title || "",
    description: nextState.description || "",
    archived: Boolean(nextState.archived),
    documents: Array.isArray(nextState.documents) ? nextState.documents : []
  };

  if (API_AVAILABLE) {
    try {
      const saved = await requestJson("/api/validation", {
        method: "PUT",
        headers: { "X-Admin-Code": ADMIN_CODE },
        body: JSON.stringify(payload)
      });
      validationConfigState = {
        title: saved.title || "",
        description: saved.description || "",
        archived: Boolean(saved.archived)
      };
      batDocuments = Array.isArray(saved.documents) ? saved.documents : [];
      saveLocalValidationState(saved);
      return saved;
    } catch {
      // Fallback for preview servers without validation API.
    }
  }

  saveLocalValidationState(payload);
  validationConfigState = {
    title: payload.title || "",
    description: payload.description || "",
    archived: Boolean(payload.archived)
  };
  batDocuments = payload.documents || [];
  return payload;
}

async function getValidationResponses() {
  if (API_AVAILABLE && adminUnlocked) {
    try {
      const responses = await requestJson("/api/validation-responses", {
        headers: { "X-Admin-Code": ADMIN_CODE }
      });
      if (Array.isArray(responses)) {
        saveLocalBatResponses(responses);
        return responses;
      }
    } catch {
      // Fallback for preview servers without validation API.
    }
  }
  return batResponses.length ? batResponses : localBatResponses();
}

async function refreshAdminValidationData() {
  if (!adminUnlocked) return;
  const validationState = await getValidationState();
  const nextDocuments = Array.isArray(validationState.documents) ? validationState.documents : [];
  validationConfigState = {
    title: validationState.title || "",
    description: validationState.description || "",
    archived: Boolean(validationState.archived)
  };
  if (nextDocuments.length || !batDocuments.length) {
    batDocuments = nextDocuments;
  }
  batResponses = await getValidationResponses();
}

async function refreshAdminValidationResponses() {
  if (!adminUnlocked) return;
  batResponses = await getValidationResponses();
}

async function refreshPharmacyValidationResponses() {
  if (!API_AVAILABLE || !currentPharmacy?.id) {
    batResponses = localBatResponses();
    return;
  }

  try {
    const params = new URLSearchParams({
      pharmacyId: currentPharmacy.id || "",
      pharmacyName: currentPharmacy.name || ""
    });
    const responses = await requestJson(`/api/pharmacy-validation-responses?${params.toString()}`);
    batResponses = Array.isArray(responses) ? responses : [];
  } catch {
    batResponses = localBatResponses();
  }
}

async function saveValidationResponses(nextResponses) {
  if (API_AVAILABLE && adminUnlocked) {
    try {
      const saved = await requestJson("/api/validation-responses", {
        method: "PUT",
        headers: { "X-Admin-Code": ADMIN_CODE },
        body: JSON.stringify(nextResponses)
      });
      saveLocalBatResponses(saved);
      return saved;
    } catch {
      // Fallback for preview servers without validation API.
    }
  }

  saveLocalBatResponses(nextResponses);
  return nextResponses;
}

async function submitValidationResponse(response) {
  if (API_AVAILABLE) {
    try {
      return await requestJson("/api/validation-responses", {
        method: "POST",
        body: JSON.stringify(response)
      });
    } catch {
      // Fallback for preview servers without validation API.
    }
  }
  const previousResponse = batResponses.find((item) => item.documentId === response.documentId);
  const saved = {
    ...response,
    id: previousResponse?.id || response.id,
    createdAt: previousResponse?.createdAt || response.createdAt,
    updatedAt: previousResponse ? new Date().toLocaleString("fr-FR") : ""
  };
  batResponses = batResponses.filter((item) => item.documentId !== response.documentId).concat(saved);
  saveLocalBatResponses(batResponses);
  return saved;
}

function resetValidationState() {
  localStorage.removeItem(VALIDATION_TITLE_KEY);
  localStorage.removeItem(VALIDATION_MESSAGE_KEY);
  localStorage.removeItem(VALIDATION_ARCHIVED_KEY);
  localStorage.removeItem(VALIDATION_DOCUMENTS_KEY);
  localStorage.removeItem(BAT_RESPONSES_KEY);
  validationConfigState = { title: "", description: "", archived: false };
  batDocuments = [];
  batResponses = [];
  const validationTitleInput = document.querySelector("#newValidationTitle");
  if (validationTitleInput) validationTitleInput.value = "";
  if (batAdminMessage) batAdminMessage.value = "";
  if (validationDocumentInput) validationDocumentInput.value = "";
  if (adminValidationDocumentInput) adminValidationDocumentInput.value = "";
  if (validationImportMessage) validationImportMessage.textContent = "";
  if (adminValidationImportMessage) adminValidationImportMessage.textContent = "";
}

function setValidationArchived(archived) {
  validationConfigState = {
    ...validationConfigState,
    archived: Boolean(archived)
  };
  localStorage.setItem(VALIDATION_ARCHIVED_KEY, archived ? "true" : "false");
}

async function getInfoForms() {
  if (API_AVAILABLE) {
    try {
      const remoteForms = await requestJson("/api/info-forms");
      if (Array.isArray(remoteForms)) return remoteForms;
    } catch {
      // Fallback for preview servers without info form API.
    }
  }

  return localInfoForms();
}

async function saveInfoForms(nextForms) {
  if (API_AVAILABLE) {
    try {
      const savedForms = await requestJson("/api/info-forms", {
        method: "PUT",
        headers: { "X-Admin-Code": ADMIN_CODE },
        body: JSON.stringify(nextForms)
      });
      saveLocalInfoForms(savedForms);
      return savedForms;
    } catch {
      // Fallback for preview servers without info form API.
    }
  }

  saveLocalInfoForms(nextForms);
  return nextForms;
}

async function getInfoResponses() {
  if (!API_AVAILABLE) return localInfoResponses();

  try {
    const responses = await requestJson("/api/info-responses", {
      headers: adminUnlocked ? { "X-Admin-Code": ADMIN_CODE } : {}
    });
    if (Array.isArray(responses)) saveLocalInfoResponses(responses);
    return responses;
  } catch {
    return localInfoResponses();
  }
}

async function saveInfoResponses(nextResponses) {
  if (API_AVAILABLE) {
    try {
      const savedResponses = await requestJson("/api/info-responses", {
        method: "PUT",
        headers: { "X-Admin-Code": ADMIN_CODE },
        body: JSON.stringify(nextResponses)
      });
      saveLocalInfoResponses(savedResponses);
      return savedResponses;
    } catch {
      // Fallback for preview servers without info response API.
    }
  }

  saveLocalInfoResponses(nextResponses);
  return nextResponses;
}

async function refreshPharmacyInfoResponses() {
  if (!currentPharmacy) return;

  try {
    if (API_AVAILABLE) {
      const params = new URLSearchParams({
        pharmacyId: currentPharmacy.id || "",
        pharmacyName: currentPharmacy.name || ""
      });
      const responses = await requestJson(`/api/pharmacy-info-responses?${params.toString()}`);
      const localOthers = localInfoResponses().filter((item) => !responses.some((remote) => remote.id === item.id));
      infoResponses = [...localOthers, ...responses];
      return;
    }
  } catch {
    // Fallback to local preview data.
  }

  infoResponses = localInfoResponses();
}

async function appendInfoResponse(response) {
  if (API_AVAILABLE) {
    try {
      return await requestJson("/api/info-responses", {
        method: "POST",
        body: JSON.stringify(response)
      });
    } catch {
      // Fallback for preview servers without info form API.
    }
  }

  const existing = localInfoResponses().find((item) => item.formId === response.formId && responseOwnerKey(item) === responseOwnerKey(response));
  const savedResponse = {
    ...response,
    id: existing?.id || response.id,
    createdAt: existing?.createdAt || response.createdAt,
    updatedAt: existing ? new Date().toLocaleString("fr-FR") : ""
  };
  const responses = localInfoResponses()
    .filter((item) => !(item.formId === savedResponse.formId && responseOwnerKey(item) === responseOwnerKey(savedResponse)))
    .concat(savedResponse);
  saveLocalInfoResponses(responses);
  return savedResponse;
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
  const method = String(options.method || "GET").toUpperCase();
  const attempts = method === "GET" ? 2 : 1;
  const requestUrl = method === "GET" && url.startsWith("/api/")
    ? `${url}${url.includes("?") ? "&" : "?"}_=${Date.now()}`
    : url;
  let lastError = null;
  const { headers: optionHeaders = {}, ...fetchOptions } = options;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 450));
    }

    try {
      const response = await fetch(requestUrl, {
        ...fetchOptions,
        cache: method === "GET" ? "no-store" : "default",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          ...optionHeaders
        }
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
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
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

async function requestPharmacyPasswordReset(pharmacyName) {
  return requestJson("/api/pharmacy-password-reset-request", {
    method: "POST",
    body: JSON.stringify({ pharmacyName })
  });
}

async function refreshPharmacyPollAnswers() {
  pharmacyPollAnswers = {};
  if (!API_AVAILABLE || !currentPharmacy?.id) return;

  try {
    const params = new URLSearchParams({
      pharmacyId: currentPharmacy.id,
      pharmacyName: currentPharmacy.name || ""
    });
    const responses = await requestJson(`/api/pharmacy-poll-responses?${params.toString()}`);
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
    const latest = latestResponses(responses);
    saveLocalResponses(latest);
    return latest;
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
    const responses = await requestJson("/api/poll-responses", {
      headers: adminUnlocked ? { "X-Admin-Code": ADMIN_CODE } : {}
    });
    if (Array.isArray(responses)) saveLocalPollResponses(responses);
    return responses;
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
    const pharmacyKey = responsePharmacyCountKey(response) || response.id;
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

function safeDownloadName(value, fallback = "document.pdf") {
  const cleaned = String(value || fallback)
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || fallback;
}

function validationDocumentDownloadName(document) {
  const fileName = document?.fileName;
  if (fileName) return safeDownloadName(fileName);

  const fileType = String(document?.fileType || "").toLowerCase();
  const extension = fileType.includes("pdf")
    ? "pdf"
    : (fileType.startsWith("image/") ? (fileType.split("/")[1] || "png") : "pdf");
  return safeDownloadName(`${document?.pharmacyName || "document"}.${extension}`);
}

function pharmacyNameKey(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function activePharmacies() {
  return pharmacies
    .filter((pharmacy) => pharmacy && pharmacy.active !== false && pharmacy.name);
}

function activePharmacyNames() {
  return activePharmacies()
    .map((pharmacy) => String(pharmacy.name).trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "fr"));
}

function pharmacyIdentityKeys(pharmacy) {
  return [
    pharmacy?.id ? `id:${String(pharmacy.id).trim()}` : "",
    pharmacy?.name ? `name:${pharmacyNameKey(pharmacy.name)}` : ""
  ].filter(Boolean);
}

function responseIdentityKeys(response) {
  return [
    response?.pharmacyId ? `id:${String(response.pharmacyId).trim()}` : "",
    response?.pharmacyName ? `name:${pharmacyNameKey(response.pharmacyName)}` : ""
  ].filter(Boolean);
}

function responseMatchesPharmacy(response, pharmacy) {
  const responseKeys = new Set(responseIdentityKeys(response));
  return pharmacyIdentityKeys(pharmacy).some((key) => responseKeys.has(key));
}

function pharmacyNamesForResponses(responses = []) {
  return activePharmacies()
    .filter((pharmacy) => responses.some((response) => responseMatchesPharmacy(response, pharmacy)))
    .map((pharmacy) => String(pharmacy.name).trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "fr"));
}

function responsePharmacyCountKey(response) {
  const matchedPharmacy = activePharmacies()
    .find((pharmacy) => responseMatchesPharmacy(response, pharmacy));
  if (matchedPharmacy?.id) return `id:${String(matchedPharmacy.id).trim()}`;
  return response.pharmacyId ? `id:${String(response.pharmacyId).trim()}` : `name:${pharmacyNameKey(response.pharmacyName)}`;
}

function batDocumentForPharmacy(pharmacy) {
  if (!pharmacy?.name) return null;
  const pharmacyKey = pharmacyNameKey(pharmacy.name);
  return batDocuments.find((document) => pharmacyNameKey(document.pharmacyName) === pharmacyKey) || null;
}

function batResponseForDocument(document) {
  if (!document) return null;
  const responses = [...batResponses].reverse();
  const exactResponse = responses.find((response) => response.documentId === document.id);
  if (exactResponse) return exactResponse;

  const documentPharmacy = activePharmacies()
    .find((pharmacy) => pharmacyNameKey(pharmacy.name) === pharmacyNameKey(document.pharmacyName));
  if (documentPharmacy) {
    const pharmacyResponse = responses.find((response) => responseMatchesPharmacy(response, documentPharmacy));
    if (pharmacyResponse) return pharmacyResponse;
  }

  const documentNameKey = pharmacyNameKey(document.pharmacyName);
  return responses.find((response) => pharmacyNameKey(response.pharmacyName) === documentNameKey) || null;
}

function normalizeValidationStatus(status) {
  const cleanStatus = String(status || "").replace(/^BAT\s+/i, "").trim();
  if (cleanStatus === "Validé" || cleanStatus === "Valid\u00c3\u00a9") return "Validé";
  if (cleanStatus === "Correction demandée" || cleanStatus === "Correction demand\u00c3\u00a9e") return "Correction demandée";
  return cleanStatus;
}

function batDocumentsForActivePharmacies() {
  return batDocuments.filter((document) => activePharmacies()
    .some((pharmacy) => pharmacyNameKey(pharmacy.name) === pharmacyNameKey(document.pharmacyName)));
}

function unmatchedValidationDocuments() {
  return batDocuments.filter((document) => !document.matched);
}

function pharmaciesWithoutValidationDocument() {
  const documentedKeys = new Set(batDocuments
    .filter((document) => document.matched)
    .map((document) => pharmacyNameKey(document.pharmacyName)));
  return activePharmacyNames().filter((name) => !documentedKeys.has(pharmacyNameKey(name)));
}

function bestPharmacyMatchForFile(fileName) {
  const fileKey = pharmacyNameKey(String(fileName || "").replace(/\.[^.]+$/, "")
    .replace(/\b(bat|validation|document|calendrier|cadeaux?|noel|noël|controle|contrôle|pdf|image)\b/gi, " "));
  const candidates = activePharmacies()
    .map((pharmacy) => {
      const key = pharmacyNameKey(pharmacy.name);
      const score = fileKey.includes(key) ? key.length : key.includes(fileKey) ? fileKey.length : 0;
      return { pharmacy, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  return candidates[0]?.pharmacy || null;
}

function readValidationFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const matchedPharmacy = bestPharmacyMatchForFile(file.name);
      const fallbackName = String(file.name || "Document").replace(/\.[^.]+$/, "");
      resolve({
        id: `validation-${createId()}`,
        pharmacyId: matchedPharmacy?.id || "",
        pharmacyName: matchedPharmacy?.name || fallbackName,
        matched: Boolean(matchedPharmacy),
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        url: reader.result,
        thumbnailUrl: file.type?.startsWith("image/") ? reader.result : "",
        importedAt: new Date().toLocaleString("fr-FR")
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function importValidationDocuments(fileList, messageElement) {
  const files = Array.from(fileList || []);
  if (!files.length) {
    if (messageElement) messageElement.textContent = "Sélectionnez au moins un PDF ou une image.";
    return [];
  }

  const imported = await Promise.all(files.map(readValidationFile));
  const byKey = new Map(batDocuments.map((document) => [document.matched ? pharmacyNameKey(document.pharmacyName) : document.fileName, document]));
  imported.forEach((document) => {
    const key = document.matched ? pharmacyNameKey(document.pharmacyName) : document.fileName;
    byKey.set(key, document);
  });
  batDocuments = Array.from(byKey.values());
  saveLocalValidationDocuments(batDocuments);
  const config = currentValidationConfig();
  await saveValidationState({
    title: config.exists ? config.title : "",
    description: config.exists ? config.description : "",
    archived: config.archived,
    documents: batDocuments
  });
  renderCampaignPickers();
  renderBatResults();

  const matchedCount = imported.filter((document) => document.matched).length;
  const unmatchedCount = imported.length - matchedCount;
  if (messageElement) {
    messageElement.textContent = `${imported.length} document${imported.length > 1 ? "s" : ""} importé${imported.length > 1 ? "s" : ""} : ${matchedCount} rattaché${matchedCount > 1 ? "s" : ""}, ${unmatchedCount} non reconnu${unmatchedCount > 1 ? "s" : ""}.`;
  }
  return imported;
}

function renderProfileHoursFields(hours = []) {
  if (!profileHoursGrid) return;
  const byDay = new Map((Array.isArray(hours) ? hours : []).map((item) => [item.day, item]));
  profileHoursGrid.innerHTML = PROFILE_DAYS.map((day) => {
    const row = byDay.get(day) || {};
    const split = Boolean(row.split);
    return `
      <div class="hours-row" data-hours-day="${escapeHtml(day)}">
        <strong>${escapeHtml(day)}</strong>
        <label class="closed-day">
          <input type="checkbox" data-hours-closed ${row.closed ? "checked" : ""}>
          <span>Fermé</span>
        </label>
        <label>Ouverture
          <input type="time" data-hours-open value="${escapeHtml(row.open || "")}" ${row.closed ? "disabled" : ""}>
        </label>
        <label>Fermeture
          <input type="time" data-hours-close value="${escapeHtml(row.close || "")}" ${row.closed ? "disabled" : ""}>
        </label>
        <label class="split-day">
          <input type="checkbox" data-hours-split ${split ? "checked" : ""} ${row.closed ? "disabled" : ""}>
          <span>Coupure</span>
        </label>
        <div class="split-hours" ${split ? "" : "hidden"}>
          <label>Matin début
            <input type="time" data-hours-morning-open value="${escapeHtml(row.morningOpen || "")}" ${row.closed ? "disabled" : ""}>
          </label>
          <label>Matin fin
            <input type="time" data-hours-morning-close value="${escapeHtml(row.morningClose || "")}" ${row.closed ? "disabled" : ""}>
          </label>
          <label>Après-midi début
            <input type="time" data-hours-afternoon-open value="${escapeHtml(row.afternoonOpen || "")}" ${row.closed ? "disabled" : ""}>
          </label>
          <label>Après-midi fin
            <input type="time" data-hours-afternoon-close value="${escapeHtml(row.afternoonClose || "")}" ${row.closed ? "disabled" : ""}>
          </label>
        </div>
      </div>
    `;
  }).join("");
}

function renderProfileServiceFields(selectedServices = []) {
  if (!profileServicesGrid) return;
  const selected = new Set(Array.isArray(selectedServices) ? selectedServices : []);
  profileServicesGrid.innerHTML = PROFILE_SERVICE_CATEGORIES.map((group) => `
    <fieldset class="services-category">
      <legend>${escapeHtml(group.category)}</legend>
      <div class="services-options">
        ${group.services.map((service) => `
          <label>
            <input type="checkbox" name="profileService" value="${escapeHtml(service)}" ${selected.has(service) ? "checked" : ""}>
            <span>${escapeHtml(service)}</span>
          </label>
        `).join("")}
      </div>
    </fieldset>
  `).join("");
}

function collectProfileHours() {
  return Array.from(profileHoursGrid?.querySelectorAll("[data-hours-day]") || []).map((row) => ({
    day: row.dataset.hoursDay,
    closed: Boolean(row.querySelector("[data-hours-closed]")?.checked),
    split: Boolean(row.querySelector("[data-hours-split]")?.checked),
    open: row.querySelector("[data-hours-open]")?.value || "",
    close: row.querySelector("[data-hours-close]")?.value || "",
    morningOpen: row.querySelector("[data-hours-morning-open]")?.value || "",
    morningClose: row.querySelector("[data-hours-morning-close]")?.value || "",
    afternoonOpen: row.querySelector("[data-hours-afternoon-open]")?.value || "",
    afternoonClose: row.querySelector("[data-hours-afternoon-close]")?.value || ""
  }));
}

function collectProfileServices() {
  return Array.from(profileServicesGrid?.querySelectorAll('input[name="profileService"]:checked') || [])
    .map((input) => input.value);
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

function pharmacyListMarkup(names, emptyMessage) {
  return names.length
    ? names.map((name) => `<li>${escapeHtml(name)}</li>`).join("")
    : `<li>${escapeHtml(emptyMessage)}</li>`;
}

function unansweredNamesForResponses(responses = []) {
  return activePharmacies()
    .filter((pharmacy) => !responses.some((response) => responseMatchesPharmacy(response, pharmacy)))
    .map((pharmacy) => String(pharmacy.name).trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "fr"));
}

function campaignIsNotInterested(response) {
  return String(response.interest || "").trim().toLowerCase().includes("pas int");
}

function campaignIsInterested(response) {
  return !campaignIsNotInterested(response);
}

function archivedOrderRowsForCurrentPharmacy() {
  return campaigns
    .filter((campaign) => campaign.closed)
    .flatMap((campaign) => {
      const response = pharmacyCampaignResponses[campaign.id];
      if (!response) return [];

      const operation = response.campaignTitle || campaign.title || "Précommande";
      const completedAt = response.updatedAt || response.createdAt || "-";
      if (campaignIsNotInterested(response)) {
        return [{ completedAt, operation, designation: "Pas intéressé", quantity: "-" }];
      }

      const products = Array.isArray(response.products)
        ? response.products.filter((product) => Number(product.quantity) > 0)
        : [];

      if (!products.length) {
        return [{ completedAt, operation, designation: "Réponse enregistrée sans quantité", quantity: "-" }];
      }

      return products.map((product) => ({
        completedAt,
        operation,
        designation: product.designation || product.product || "Produit",
        quantity: product.quantity || ""
      }));
    });
}

function renderArchivedOrdersHistory() {
  if (!toggleArchivedOrdersBtn || !archivedOrdersPanel || !archivedOrdersRows || !archivedOrdersEmpty) return;

  const rows = archivedOrderRowsForCurrentPharmacy();
  const archivedOrdersBlock = toggleArchivedOrdersBtn.closest(".archived-orders-block");
  if (archivedOrdersBlock) archivedOrdersBlock.hidden = !currentPharmacy;
  toggleArchivedOrdersBtn.hidden = !currentPharmacy;
  toggleArchivedOrdersBtn.setAttribute("aria-expanded", archivedOrdersVisible ? "true" : "false");
  archivedOrdersPanel.hidden = !archivedOrdersVisible || !currentPharmacy;
  archivedOrdersRows.innerHTML = rows.map((row) => `
    <tr>
      <td>${escapeHtml(row.completedAt)}</td>
      <td><strong>${escapeHtml(row.operation)}</strong></td>
      <td>${escapeHtml(row.designation)}</td>
      <td>${escapeHtml(row.quantity)}</td>
    </tr>
  `).join("");
  archivedOrdersEmpty.hidden = Boolean(rows.length);
  archivedOrdersPanel.querySelector(".archived-orders-table-wrap").hidden = !rows.length;
}

function setHeroVisible(visible) {
  if (heroBand) heroBand.hidden = !visible;
  if (heroActionsRow) heroActionsRow.hidden = !visible;
  if (!visible && archivedOrdersVisible) {
    archivedOrdersVisible = false;
    renderArchivedOrdersHistory();
  }
}

function showArchivedOrdersPage() {
  if (pharmacyAccessRequired()) {
    renderPharmacyAccess();
    return;
  }

  selectedCampaign = null;
  selectedPoll = null;
  selectedInfoForm = null;
  selectedBatDocument = null;
  setHeroVisible(false);
  archivedOrdersVisible = true;
  campaignPicker.hidden = true;
  form.hidden = true;
  pollForm.hidden = true;
  profileUpdateForm.hidden = true;
  batValidationForm.hidden = true;
  responseSuccess.hidden = true;
  renderArchivedOrdersHistory();
  archivedOrdersPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function exportArchivedOrdersPdf() {
  const rows = archivedOrderRowsForCurrentPharmacy();
  if (!rows.length) {
    alert("Aucune précommande archivée à exporter.");
    return;
  }

  const printedAt = new Date().toLocaleString("fr-FR");
  const pharmacyName = currentPharmacy?.name || "Pharmacie";
  const tableRows = rows.map((row) => `
    <tr>
      <td>${escapeHtml(row.completedAt)}</td>
      <td>${escapeHtml(row.operation)}</td>
      <td>${escapeHtml(row.designation)}</td>
      <td>${escapeHtml(row.quantity)}</td>
    </tr>
  `).join("");
  const printWindow = window.open("", "_blank", "width=980,height=720");
  if (!printWindow) {
    alert("Autorisez l'ouverture de la fenêtre pour télécharger le PDF.");
    return;
  }

  printWindow.document.write(`
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8">
        <title>Historique précommandes - ${escapeHtml(pharmacyName)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 28px; color: #142032; }
          h1 { margin: 0 0 6px; color: #007a3d; font-size: 24px; }
          p { margin: 0 0 18px; color: #5f6b84; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { color: #fff; background: #008c45; text-align: left; }
          th, td { border: 1px solid #cfd8d3; padding: 8px; vertical-align: top; }
          tbody tr:nth-child(even) { background: #f4fbf7; }
          @page { size: A4; margin: 14mm; }
        </style>
      </head>
      <body>
        <h1>Historique des précommandes</h1>
        <p>${escapeHtml(pharmacyName)} - généré le ${escapeHtml(printedAt)}</p>
        <table>
          <thead>
            <tr>
              <th>Date de remplissage</th>
              <th>Opération</th>
              <th>Désignation du produit</th>
              <th>Quantité</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
        <script>
          window.addEventListener("load", () => {
            window.print();
          });
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
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
  return `${response.campaignId || "herboristerie"}|${response.pharmacyId || pharmacyNameKey(response.pharmacyName)}`;
}

function responseMatchesCampaign(response, campaign) {
  if (!response || !campaign) return false;
  if (response.campaignId === campaign.id) return true;
  if (!response.campaignId && campaign.id === "herboristerie") return true;
  return pharmacyNameKey(response.campaignTitle) === pharmacyNameKey(campaign.title);
}

function responseMatchesPoll(response, poll) {
  if (!response || !poll) return false;
  if (response.pollId === poll.id) return true;
  return pharmacyNameKey(response.pollQuestion) === pharmacyNameKey(poll.question);
}

function responseMatchesInfoForm(response, infoForm) {
  if (!response || !infoForm) return false;
  if (response.formId === infoForm.id) return true;
  return pharmacyNameKey(response.formTitle) === pharmacyNameKey(infoForm.title);
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
    forgotPharmacyPasswordBtn.hidden = true;
    forgotPharmacyPasswordForm.hidden = true;
    pharmacyGate.querySelector("h2").textContent = "Créez votre mot de passe";
    pharmacyGate.querySelector(".pharmacy-gate-card > p:not(.eyebrow):not(.status-message)").textContent =
      `Première connexion pour ${pendingPasswordPharmacy.name}. Choisissez un nouveau mot de passe personnel.`;
  } else {
    pharmacyLoginForm.hidden = false;
    pharmacyPasswordChangeForm.hidden = true;
    forgotPharmacyPasswordBtn.hidden = false;
    pharmacyGate.querySelector("h2").textContent = "Identifiez votre pharmacie";
    pharmacyGate.querySelector(".pharmacy-gate-card > p:not(.eyebrow):not(.status-message)").textContent =
      "Entrez le mot de passe transmis par SOGUASPHAR pour accéder aux commandes et sondages.";
  }

  if (requiresLogin) {
    setHeroVisible(false);
    campaignPicker.hidden = true;
    form.hidden = true;
    pollForm.hidden = true;
    profileUpdateForm.hidden = true;
    batValidationForm.hidden = true;
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
  profilePharmacyName.value = name;
  profilePharmacyName.readOnly = true;
}

function renderAdminResetAlert() {
  if (!adminResetAlert) return;
  const requests = pharmacies.filter((pharmacy) => pharmacy && pharmacy.passwordResetRequested);
  adminResetAlert.hidden = requests.length === 0;
  if (!requests.length) {
    adminResetAlert.innerHTML = "";
    return;
  }

  const names = requests
    .map((pharmacy) => pharmacy.name)
    .filter(Boolean)
    .slice(0, 4)
    .join(", ");
  const extra = requests.length > 4 ? `, +${requests.length - 4}` : "";
  adminResetAlert.innerHTML = `
    <div>
      <strong>${requests.length} demande${requests.length > 1 ? "s" : ""} de réinitialisation de mot de passe</strong>
      <p>${escapeHtml(names)}${escapeHtml(extra)}</p>
    </div>
    <button class="primary-btn small-btn" type="button" data-open-reset-requests>Voir les demandes</button>
  `;
}

function renderPharmacyAccounts() {
  if (!pharmacyAccountsList) return;
  if (!pharmacies.length) {
    pharmacyAccountsList.innerHTML = '<p class="empty-campaigns">Aucun accès pharmacie créé pour le moment.</p>';
    return;
  }

  const resetRequestCount = pharmacies.filter((pharmacy) => pharmacy.passwordResetRequested).length;
  const resetNotice = resetRequestCount
    ? `<p class="admin-alert">${resetRequestCount} demande${resetRequestCount > 1 ? "s" : ""} de réinitialisation de mot de passe en attente.</p>`
    : "";

  pharmacyAccountsList.innerHTML = `
    ${resetNotice}
    <div class="table-toolbar pharmacy-export-toolbar">
      <div>
        <h2>Accès pharmacies</h2>
        <p>Exportez la liste des pharmacies avec leurs mots de passe actuels.</p>
      </div>
      <button class="primary-btn" type="button" data-export-pharmacy-passwords>Exporter Excel</button>
    </div>
    <div class="table-wrap compact">
      <table>
        <thead><tr><th>Pharmacie</th><th>Mot de passe actuel</th><th>Statut</th><th>Demande</th><th>Action</th></tr></thead>
        <tbody>
          ${pharmacies.map((pharmacy) => {
            const resetRequested = Boolean(pharmacy.passwordResetRequested);
            const requestDate = pharmacy.passwordResetRequestedAt ? `<small>${escapeHtml(pharmacy.passwordResetRequestedAt)}</small>` : "";
            const requestLabel = resetRequested ? `<span class="request-badge">Réinitialisation demandée</span>${requestDate}` : "-";
            const resetButton = resetRequested ? `<button class="ghost-btn small-btn" type="button" data-reset-pharmacy-password="${escapeHtml(pharmacy.id)}">Réinitialiser</button>` : "";
            return `
              <tr class="${resetRequested ? "needs-reset" : ""}">
                <td><strong>${escapeHtml(pharmacy.name)}</strong></td>
                <td><code>${escapeHtml(pharmacy.password)}</code></td>
                <td>${pharmacy.mustChangePassword === false ? "Personnalisé" : "À changer"}</td>
                <td>${requestLabel}</td>
                <td class="pharmacy-actions">
                  ${resetButton}
                  <button class="delete-response-btn" type="button" data-delete-pharmacy="${escapeHtml(pharmacy.id)}" aria-label="Supprimer ${escapeHtml(pharmacy.name)}">&#128465;</button>
                </td>
              </tr>
            `;
          }).join("")}
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
    })} \u20ac`;
  }
  const clean = cleanTemplateCell(value);
  if (!clean) return "";
  return clean.replace(".", ",").replace(/\s*\u20ac?$/, " \u20ac").trim();
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
  const priceRegex = /(?:\d+[,.]\d{1,2}\s*\u20ac?|\d+\s*\u20ac)/;
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
        return /[a-zA-Z]/.test(cell.normalize("NFD").replace(/[\u0300-\u036f]/g, "")) && !isIgnoredTemplateLine(cell);
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
    const cleanTarif = String(tarif || "").replace(".", ",").replace(/\s*\u20ac?$/, " \u20ac").trim();
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

    const priceMatch = working.match(/(\d+[,.]\d{2})\s*(?:\u20ac|eur)?/i);
    if (!priceMatch) return;
    const tarif = `${priceMatch[1].replace(".", ",")} \u20ac`;
    working = `${working.slice(0, priceMatch.index)} ${working.slice(priceMatch.index + priceMatch[0].length)}`.trim();

    let cip = "";
    const barcodeMatch = working.match(/(?:\d[\s-]*){13}/);
    if (barcodeMatch) {
      cip = barcodeMatch[0].replace(/\D/g, "");
      working = `${working.slice(0, barcodeMatch.index)} ${working.slice(barcodeMatch.index + barcodeMatch[0].length)}`.trim();
    }

    let colisage = "";
    const trailingColisage = working.match(/\s(\d{1,4})$/);
    if (trailingColisage && !/[A-Za-z]\d+$/.test(working.replace(/\s(\d{1,4})$/, "").normalize("NFD").replace(/[\u0300-\u036f]/g, ""))) {
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
    const genericMatches = compact.matchAll(/([\p{L}0-9'().,/\-+& ]{2,}?)\s+((?:\d[\s-]*){13})?\s*(\d+[,.]\d{2})\s*(?:€|eur)?\s*(\d{1,4})?(?=\s+[\p{L}0-9'().,/\-+& ]{2,}?\s+(?:(?:\d[\s-]*){13}\s*)?\d+[,.]\d{2}|\s*$)/giu);

    for (const match of genericMatches) {
      addRow(match[1], match[2] || "", `${match[3]} \u20ac`, match[4] || "");
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
      <span class="whatsapp-poll-circle" aria-hidden="true">${localAnswer === option ? "\u2713" : ""}</span>
      <span class="whatsapp-poll-label">${escapeHtml(option)}</span>
      <span class="whatsapp-poll-count">${localAnswer === option ? "\u2713" : "0"}</span>
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

function infoFormCard(infoForm, target) {
  const isAdmin = target === "admin";
  const responses = infoResponses.filter((response) => responseMatchesInfoForm(response, infoForm));
  const responseCount = pharmacyNamesForResponses(responses).length;
  const currentResponse = !isAdmin && currentPharmacy
    ? responses.find((response) => responseMatchesPharmacy(response, currentPharmacy))
    : null;
  const statusLabel = infoForm.closed ? "Clôturée" : "Fiche pharmacie";
  const actionAttr = isAdmin ? `data-admin-info="${escapeHtml(infoForm.id)}"` : `data-info-form="${escapeHtml(infoForm.id)}"`;

  return `
    <article class="campaign-card info-form-card ${currentResponse ? "completed" : ""} clickable" ${actionAttr} role="button" tabindex="0">
      <div>
        <div class="campaign-card-top">
          <span class="campaign-type ${infoForm.closed ? "closed" : ""}">${statusLabel}</span>
          ${isAdmin ? `<button class="delete-campaign-btn" type="button" title="Supprimer la demande" aria-label="Supprimer ${escapeHtml(infoForm.title)}" data-delete-info="${escapeHtml(infoForm.id)}">&#128465;</button>` : ""}
        </div>
        <h3>${escapeHtml(infoForm.title)}</h3>
        <p>${escapeHtml(infoForm.intro || "Mettez à jour les informations de votre pharmacie.")}</p>
        ${currentResponse ? `<div class="campaign-done-summary"><strong>Fiche déjà transmise</strong><span>Vous pouvez la modifier si nécessaire.</span></div>` : ""}
      </div>
      <div class="campaign-foot">
        <strong>${isAdmin ? `${responseCount} réponse${responseCount > 1 ? "s" : ""}` : "Coordonnées, horaires, services"}</strong>
        <div class="campaign-actions">
          ${isAdmin ? `<button class="ghost-btn" type="button" data-toggle-closed-info="${escapeHtml(infoForm.id)}">${infoForm.closed ? "Rouvrir" : "Clôturer"}</button>` : ""}
          <button class="primary-btn" type="button" ${actionAttr}>${isAdmin ? "Voir le suivi" : (currentResponse ? "Modifier ma fiche" : "Remplir")}</button>
        </div>
      </div>
    </article>
  `;
}

function batValidationCard(document, target) {
  const isAdmin = target === "admin";
  const response = batResponseForDocument(document);
  const validationConfig = currentValidationConfig();
  const displayStatus = normalizeValidationStatus(response?.status);
  const actionAttr = isAdmin
    ? `data-admin-bat-document="${escapeHtml(document.id)}"`
    : `data-form-bat="${escapeHtml(document.id)}"`;

  return `
    <article class="campaign-card bat-card ${response ? "completed" : ""} clickable" ${actionAttr} role="button" tabindex="0">
      <div>
        <h3>${escapeHtml(validationConfig.title)}</h3>
        <p>${escapeHtml(validationConfig.description)}</p>
        ${response ? `
          <div class="campaign-done-summary">
            <strong>${escapeHtml(displayStatus)}</strong>
            <span>${escapeHtml(response.comment || "Réponse enregistrée.")}</span>
          </div>
        ` : ""}
      </div>
      <div class="campaign-foot">
        <strong>${escapeHtml(document.pharmacyName)}</strong>
        <div class="campaign-actions">
          <a class="ghost-btn" href="${escapeHtml(document.url)}" download="${escapeHtml(validationDocumentDownloadName(document))}" data-bat-pdf-link>Télécharger le document</a>
          <button class="primary-btn" type="button" ${actionAttr}>${isAdmin ? "Voir le suivi" : (response ? "Modifier" : "Valider")}</button>
        </div>
      </div>
    </article>
  `;
}

function adminBatOverviewCard() {
  const documents = batDocumentsForActivePharmacies();
  const unmatched = unmatchedValidationDocuments();
  const answered = documents.filter((document) => batResponseForDocument(document));
  const corrections = documents.filter((document) => normalizeValidationStatus(batResponseForDocument(document)?.status) === "Correction demandée");
  const validationConfig = currentValidationConfig();

  return `
    <article class="campaign-card bat-card clickable" data-admin-bat-overview role="button" tabindex="0">
      <div>
        <div class="campaign-card-top">
          <span class="campaign-type ${validationConfig.archived ? "closed" : ""}">${validationConfig.archived ? "Validation archivée" : "Validation"}</span>
          <button class="delete-campaign-btn" type="button" title="Supprimer la validation" aria-label="Supprimer la validation" data-delete-validation>&#128465;</button>
        </div>
        <h3>${escapeHtml(validationConfig.title)}</h3>
        <p>${escapeHtml(validationConfig.description)}</p>
      </div>
      <div class="campaign-foot">
        <strong>${batDocuments.length} document${batDocuments.length > 1 ? "s" : ""} importé${batDocuments.length > 1 ? "s" : ""}</strong>
        <div class="campaign-actions">
          ${corrections.length ? `<span class="request-badge">${corrections.length} correction${corrections.length > 1 ? "s" : ""}</span>` : ""}
          ${unmatched.length ? `<span class="request-badge">${unmatched.length} non reconnu${unmatched.length > 1 ? "s" : ""}</span>` : ""}
          <button class="ghost-btn" type="button" data-toggle-validation-archive>${validationConfig.archived ? "Rouvrir" : "Archiver"}</button>
          <button class="primary-btn" type="button" data-admin-bat-overview>Documents en attente validation</button>
        </div>
      </div>
    </article>
  `;
}

function showAdminSection(section) {
  activeAdminSection = section || "new-campaign";
  const sectionCopy = ADMIN_SECTIONS[activeAdminSection] || ADMIN_SECTIONS["new-campaign"];
  const validationConfig = currentValidationConfig();
  const activeGroup = adminGroupForSection(activeAdminSection);
  const closedActions = showClosedCampaignsBtn?.closest(".closed-campaign-actions");
  const showCampaignList = activeAdminSection === "campaigns" || activeAdminSection === "archives";
  const showPollList = activeAdminSection === "polls" || activeAdminSection === "archives";
  const showInfoList = activeAdminSection === "polls" || activeAdminSection === "archives";
  const showPharmacies = activeAdminSection === "pharmacies";
  const showBatList = activeAdminSection === "bat" || (activeAdminSection === "archives" && validationConfig.exists);

  adminCampaignTitle.textContent = sectionCopy.title;
  adminSectionIntro.textContent = sectionCopy.intro;
  createCampaignForm.hidden = activeAdminSection !== "new-campaign";
  createPollForm.hidden = activeAdminSection !== "new-poll";
  createInfoForm.hidden = activeAdminSection !== "new-poll";
  if (createValidationForm) createValidationForm.hidden = activeAdminSection !== "new-validation";
  createPharmacyForm.hidden = !showPharmacies;
  pharmacyAccountsList.hidden = !showPharmacies;
  adminCampaignCards.hidden = !showCampaignList;
  if (adminBatBlock) adminBatBlock.hidden = !showBatList;
  adminPollBlock.hidden = !showPollList;
  adminInfoBlock.hidden = !showInfoList;
  if (closedActions) closedActions.hidden = true;

  adminDashboardNav?.querySelectorAll("[data-admin-group]").forEach((button) => {
    button.classList.toggle("active", button.dataset.adminGroup === activeGroup);
  });
  adminDashboardNav?.querySelectorAll("[data-admin-subnav]").forEach((subNav) => {
    subNav.hidden = subNav.dataset.adminSubnav !== activeGroup;
  });
  adminDashboardNav?.querySelectorAll("[data-admin-section]").forEach((button) => {
    button.classList.toggle("active", button.dataset.adminSection === activeAdminSection);
  });

  renderCampaignPickers();
}

async function showAdminSectionFresh(section) {
  const nextSection = section || "new-campaign";
  if (adminUnlocked) {
    if (nextSection === "polls" || nextSection === "archives") {
      await refreshPollResponseCounts();
    }
    if (nextSection === "polls" || nextSection === "archives") {
      infoResponses = await getInfoResponses();
    }
    if (nextSection === "bat" || nextSection === "archives") {
      await refreshAdminValidationResponses();
    }
  }
  showAdminSection(nextSection);
}

function renderCampaignPickers() {
  const validationConfig = currentValidationConfig();
  const openCampaigns = campaigns.filter((campaign) => !campaign.closed);
  const adminCampaigns = campaigns.filter((campaign) => activeAdminSection === "archives" ? campaign.closed : !campaign.closed);
  const openPolls = polls.filter((poll) => !poll.closed);
  const adminPolls = polls.filter((poll) => activeAdminSection === "archives" ? poll.closed : !poll.closed);
  const openInfoForms = infoForms.filter((infoForm) => !infoForm.closed);
  const adminInfoForms = infoForms.filter((infoForm) => activeAdminSection === "archives" ? infoForm.closed : !infoForm.closed);
  const currentBatDocument = currentPharmacy ? batDocumentForPharmacy(currentPharmacy) : null;
  const adminBatDocuments = batDocumentsForActivePharmacies();

  campaignCards.innerHTML = openCampaigns.length
    ? openCampaigns.map((campaign) => campaignCard(campaign, "form")).join("")
    : '<p class="empty-campaigns">Aucune précommande disponible pour le moment.</p>';

  renderArchivedOrdersHistory();

  pollCards.innerHTML = openPolls.length
    ? openPolls.map((poll) => pollCard(poll, "form")).join("")
    : '<p class="empty-campaigns">Aucun sondage disponible pour le moment.</p>';

  infoCards.innerHTML = openInfoForms.length
    ? openInfoForms.map((infoForm) => infoFormCard(infoForm, "form")).join("")
    : '<p class="empty-campaigns">Aucune mise à jour de fiche pharmacie disponible pour le moment.</p>';

  if (batCards) {
    batCards.innerHTML = currentBatDocument
      && validationConfig.exists
      && !validationConfig.archived
      ? batValidationCard(currentBatDocument, "form")
      : '<p class="empty-campaigns">Aucun document de validation disponible pour votre pharmacie pour le moment.</p>';
  }

  adminCampaignCards.innerHTML = adminCampaigns.length
    ? adminCampaigns.map((campaign) => campaignCard(campaign, "admin")).join("")
    : `<p class="empty-campaigns">Aucune campagne ${adminShowingClosedCampaigns ? "clôturée" : "active"}.</p>`;

  adminPollCards.innerHTML = adminPolls.length
    ? adminPolls.map((poll) => pollCard(poll, "admin")).join("")
    : '<p class="empty-campaigns">Aucun sondage créé pour le moment.</p>';

  adminInfoCards.innerHTML = adminInfoForms.length
    ? adminInfoForms.map((infoForm) => infoFormCard(infoForm, "admin")).join("")
    : '<p class="empty-campaigns">Aucune mise à jour fiche pharmacie créée pour le moment.</p>';

  if (adminBatCards) {
    const showActiveValidation = activeAdminSection === "bat" && validationConfig.exists && !validationConfig.archived;
    const showArchivedValidation = activeAdminSection === "archives" && validationConfig.exists && validationConfig.archived;
    adminBatCards.innerHTML = (showActiveValidation || showArchivedValidation)
      ? adminBatOverviewCard()
      : `<p class="empty-campaigns">${activeAdminSection === "archives" ? "Aucune validation archivée." : "Aucune validation en cours. Créez une nouvelle validation pour importer des documents."}</p>`;
  }

  showClosedCampaignsBtn.textContent = adminShowingClosedCampaigns ? "Campagnes actives" : "Campagnes clôturées";
}

function selectCampaign(campaignId) {
  if (pharmacyAccessRequired()) {
    renderPharmacyAccess();
    return;
  }
  selectedCampaign = campaigns.find((campaign) => campaign.id === campaignId) || campaigns[0];
  selectedPoll = null;
  selectedInfoForm = null;
  currentOrderTemplate = selectedCampaign?.template || [];
  campaignPicker.hidden = true;
  setHeroVisible(false);
  form.hidden = false;
  pollForm.hidden = true;
  profileUpdateForm.hidden = true;
  batValidationForm.hidden = true;
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
  selectedInfoForm = null;
  if (!selectedPoll) return;

  selectedCampaign = null;
  campaignPicker.hidden = false;
  setHeroVisible(true);
  form.hidden = true;
  pollForm.hidden = true;
  profileUpdateForm.hidden = true;
  batValidationForm.hidden = true;
  responseSuccess.hidden = true;
  renderCampaignPickers();
  const openedCard = Array.from(pollCards.querySelectorAll("[data-inline-poll-form]"))
    .find((item) => item.dataset.inlinePollForm === selectedPoll.id);
  openedCard?.closest(".whatsapp-poll-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function selectInfoForm(infoFormId) {
  if (pharmacyAccessRequired()) {
    renderPharmacyAccess();
    return;
  }

  selectedInfoForm = infoForms.find((infoForm) => infoForm.id === infoFormId) || null;
  if (!selectedInfoForm) return;

  const previousResponse = infoResponses.find((response) => responseMatchesInfoForm(response, selectedInfoForm) && currentPharmacy && responseMatchesPharmacy(response, currentPharmacy));

  selectedCampaign = null;
  selectedPoll = null;
  campaignPicker.hidden = true;
  setHeroVisible(false);
  form.hidden = true;
  pollForm.hidden = true;
  profileUpdateForm.hidden = false;
  batValidationForm.hidden = true;
  responseSuccess.hidden = true;

  profileUpdateForm.reset();
  profileFormTitle.textContent = selectedInfoForm.title;
  profileFormIntro.textContent = selectedInfoForm.intro || "Merci de noter vos coordonnées, réseaux sociaux, horaires et services proposés.";
  profilePharmacyName.value = previousResponse?.pharmacyName || currentPharmacy?.name || "";
  profilePharmacyName.readOnly = Boolean(currentPharmacy?.name);
  profileAddress.value = previousResponse?.address || "";
  profilePostalCode.value = previousResponse?.postalCode || "";
  profileCity.value = previousResponse?.city || "";
  profilePhone.value = previousResponse?.phone || "";
  profileOwnerEmail.value = previousResponse?.ownerEmail || previousResponse?.email || "";
  profileTeamEmail.value = previousResponse?.teamEmail || "";
  profileFacebook.value = previousResponse?.facebook || "";
  profileInstagram.value = previousResponse?.instagram || "";
  profileLinkedin.value = previousResponse?.linkedin || "";
  profileTiktok.value = previousResponse?.tiktok || "";
  profileWebsite.value = previousResponse?.website || "";
  renderProfileHoursFields(previousResponse?.hours || []);
  renderProfileServiceFields(previousResponse?.services || []);
  profileOtherServices.value = previousResponse?.otherServices || "";
  profileNotes.value = previousResponse?.notes || "";
  profileMessage.textContent = "";
  profileUpdateForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function selectBat(documentId) {
  if (pharmacyAccessRequired()) {
    renderPharmacyAccess();
    return;
  }

  selectedBatDocument = batDocuments.find((document) => document.id === documentId) || batDocumentForPharmacy(currentPharmacy);
  if (!selectedBatDocument) return;

  const previousResponse = batResponseForDocument(selectedBatDocument);

  selectedCampaign = null;
  selectedPoll = null;
  selectedInfoForm = null;
  campaignPicker.hidden = true;
  setHeroVisible(false);
  form.hidden = true;
  pollForm.hidden = true;
  profileUpdateForm.hidden = true;
  batValidationForm.hidden = false;
  responseSuccess.hidden = true;

  batFormTitle.textContent = currentValidationConfig().title;
  batPdfTitle.textContent = `Document - ${selectedBatDocument.pharmacyName}`;
  const isImageDocument = selectedBatDocument.fileType?.startsWith("image/");
  if (batDocumentPreview) {
    batDocumentPreview.hidden = !isImageDocument;
    batDocumentPreview.src = isImageDocument ? selectedBatDocument.url : "";
    batDocumentPreview.alt = `Aperçu du document ${selectedBatDocument.pharmacyName}`;
  }
  if (batDocumentPdfPreview) {
    batDocumentPdfPreview.hidden = isImageDocument;
    batDocumentPdfPreview.data = isImageDocument ? "" : selectedBatDocument.url;
  }
  batPdfOpenLink.href = selectedBatDocument.url;
  batPdfOpenLink.download = validationDocumentDownloadName(selectedBatDocument);
  batPdfOpenLink.textContent = "Télécharger le document";
  batPdfOpenLink.removeAttribute("target");
  batPharmacyName.value = previousResponse?.pharmacyName || currentPharmacy?.name || selectedBatDocument.pharmacyName;
  batPharmacyName.readOnly = Boolean(currentPharmacy?.name);
  batComment.value = previousResponse?.comment || "";
  batValidationForm.querySelectorAll('input[name="batStatus"]').forEach((input) => {
    input.checked = input.value === previousResponse?.status;
  });
  batMessage.textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderBatResults() {
  const validationConfig = currentValidationConfig();
  const documents = batDocumentsForActivePharmacies();
  const unmatchedDocuments = unmatchedValidationDocuments();
  const allDisplayedDocuments = documents.concat(unmatchedDocuments);
  adminBatDetail?.querySelectorAll("[data-toggle-validation-archive]").forEach((button) => {
    button.textContent = validationConfig.archived ? "Rouvrir" : "Archiver";
  });
  const validated = documents
    .filter((document) => normalizeValidationStatus(batResponseForDocument(document)?.status) === "Validé")
    .map((document) => document.pharmacyName)
    .sort((a, b) => a.localeCompare(b, "fr"));
  const corrections = documents
    .filter((document) => normalizeValidationStatus(batResponseForDocument(document)?.status) === "Correction demandée")
    .map((document) => document.pharmacyName)
    .sort((a, b) => a.localeCompare(b, "fr"));
  const correctionDetails = documents
    .map((document) => ({ document, response: batResponseForDocument(document) }))
    .filter(({ response }) => normalizeValidationStatus(response?.status) === "Correction demandée")
    .sort((a, b) => a.document.pharmacyName.localeCompare(b.document.pharmacyName, "fr"));
  const unanswered = documents
    .filter((document) => !batResponseForDocument(document))
    .map((document) => document.pharmacyName)
    .sort((a, b) => a.localeCompare(b, "fr"));
  const missingDocuments = pharmaciesWithoutValidationDocument();
  const answered = documents.length - unanswered.length;

  batResultsSummary.innerHTML = `
    <div><span>${batDocuments.length}</span><p>document${batDocuments.length > 1 ? "s" : ""} importé${batDocuments.length > 1 ? "s" : ""}</p></div>
    <div><span>${documents.length}</span><p>rattaché${documents.length > 1 ? "s" : ""}</p></div>
    <div><span>${unmatchedDocuments.length}</span><p>non reconnu${unmatchedDocuments.length > 1 ? "s" : ""}</p></div>
    <div><span>${answered}</span><p>réponse${answered > 1 ? "s" : ""}</p></div>
    <div><span>${validated.length}</span><p>validée${validated.length > 1 ? "s" : ""}</p></div>
    <div><span>${corrections.length}</span><p>correction${corrections.length > 1 ? "s" : ""}</p></div>
    <div><span>${unanswered.length}</span><p>sans réponse</p></div>
    <div><span>${missingDocuments.length}</span><p>sans document</p></div>
  `;
  batValidatedPharmacies.innerHTML = pharmacyListMarkup(validated, "Aucune validation pour le moment.");
  batCorrectionPharmacies.innerHTML = correctionDetails.length
    ? correctionDetails.map(({ document, response }) => `
      <li>
        <strong>${escapeHtml(document.pharmacyName)}</strong>
        <span class="correction-note">${escapeHtml(response.comment || "Correction demandée sans détail.")}</span>
      </li>
    `).join("")
    : "<li>Aucune correction pour le moment.</li>";
  batUnansweredPharmacies.innerHTML = pharmacyListMarkup(unanswered, "Aucune pharmacie à relancer.");

  if (batDocumentsTable) {
    const documentsWrap = batDocumentsTable.closest(".table-wrap");
    const documentsToolbar = documentsWrap?.previousElementSibling;
    const documentsTable = batDocumentsTable.closest("table");
    const documentsHead = documentsTable?.querySelector("thead");
    if (documentsHead) {
      documentsHead.innerHTML = `
        <tr>
          <th>Pharmacie</th>
          <th>Statut</th>
          <th>Correction / commentaire</th>
          <th>Document</th>
        </tr>
      `;
    }
    if (documentsWrap) {
      documentsWrap.classList.toggle("is-collapsed", !batDocumentsExpanded);
    }
    if (documentsToolbar && !documentsToolbar.querySelector("[data-toggle-bat-documents]")) {
      documentsToolbar.classList.add("collapsible-toolbar");
      documentsToolbar.insertAdjacentHTML("beforeend", '<button class="ghost-btn" type="button" data-toggle-bat-documents>Afficher les documents</button>');
    }
    const toggleButton = documentsToolbar?.querySelector("[data-toggle-bat-documents]");
    if (toggleButton) {
      toggleButton.textContent = batDocumentsExpanded ? "Masquer les documents" : "Afficher les documents";
    }

    batDocumentsTable.innerHTML = allDisplayedDocuments.length
      ? allDisplayedDocuments.map((document) => {
        const response = batResponseForDocument(document);
        const status = document.matched ? (normalizeValidationStatus(response?.status) || "En attente") : "Non reconnu";
        return `
          <tr>
            <td><strong>${escapeHtml(document.pharmacyName)}</strong></td>
            <td>${escapeHtml(status)}</td>
            <td>${escapeHtml(response?.comment || "-")}</td>
            <td><a class="ghost-btn small-btn" href="${escapeHtml(document.url)}" download="${escapeHtml(validationDocumentDownloadName(document))}" data-bat-pdf-link>Télécharger</a></td>
          </tr>
        `;
      }).join("")
      : '<tr><td colspan="4" class="empty-state">Aucun document disponible.</td></tr>';
  }

  const answeredRows = documents
    .map((document) => ({ document, response: batResponseForDocument(document) }))
    .filter((item) => item.response);

  batResponsesTable.innerHTML = answeredRows.length
    ? answeredRows.map(({ document, response }) => `
      <tr>
        <td>${escapeHtml(response.updatedAt || response.createdAt || "")}</td>
        <td><strong>${escapeHtml(response.pharmacyName || document.pharmacyName)}</strong></td>
        <td>${escapeHtml(normalizeValidationStatus(response.status))}</td>
        <td>${escapeHtml(response.comment || "-")}</td>
        <td><a class="ghost-btn small-btn" href="${escapeHtml(document.url)}" download="${escapeHtml(validationDocumentDownloadName(document))}" data-bat-pdf-link>Télécharger</a></td>
      </tr>
    `).join("")
    : '<tr><td colspan="5" class="empty-state">Aucune validation pour le moment.</td></tr>';

  const responsesToolbar = batResponsesTable?.closest(".table-wrap")?.previousElementSibling;
  if (responsesToolbar && !responsesToolbar.querySelector("[data-export-bat-excel]")) {
    responsesToolbar.insertAdjacentHTML("beforeend", '<button class="primary-btn" type="button" data-export-bat-excel>Exporter Excel</button>');
  }
}

async function selectAdminBat() {
  selectedAdminCampaign = null;
  selectedAdminPoll = null;
  selectedAdminInfoForm = null;
  adminCampaignPicker.hidden = true;
  adminDetail.hidden = true;
  adminPollDetail.hidden = true;
  adminInfoDetail.hidden = true;
  adminBatDetail.hidden = false;
  renderBatResults();
  await refreshAdminValidationResponses();
  renderBatResults();
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
    selectedInfoForm = null;
    selectedBatDocument = null;
    renderPharmacyAccess();
    return;
  }
  selectedCampaign = null;
  selectedPoll = null;
  selectedInfoForm = null;
  selectedBatDocument = null;
  currentOrderTemplate = [];
  archivedOrdersVisible = false;
  renderArchivedOrdersHistory();
  campaignPicker.hidden = false;
  setHeroVisible(true);
  form.hidden = true;
  pollForm.hidden = true;
  profileUpdateForm.hidden = true;
  batValidationForm.hidden = true;
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
  profileUpdateForm.hidden = true;
  batValidationForm.hidden = true;
  campaignPicker.hidden = false;
  setHeroVisible(true);
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
  adminBatDetail.hidden = true;
  quantitySummaryBtn.textContent = "Récap des quantités";
  renderOrderTemplate();
  await renderAdmin();
}

async function selectAdminPoll(pollId) {
  selectedAdminPoll = polls.find((poll) => poll.id === pollId) || null;
  if (!selectedAdminPoll) return;

  selectedAdminCampaign = null;
  selectedAdminInfoForm = null;
  adminPollTitle.textContent = selectedAdminPoll.question;
  adminCampaignPicker.hidden = true;
  adminDetail.hidden = true;
  adminPollDetail.hidden = false;
  adminInfoDetail.hidden = true;
  adminBatDetail.hidden = true;
  await renderPollResults();
}

async function selectAdminInfoForm(infoFormId) {
  selectedAdminInfoForm = infoForms.find((infoForm) => infoForm.id === infoFormId) || null;
  if (!selectedAdminInfoForm) return;

  selectedAdminCampaign = null;
  selectedAdminPoll = null;
  adminInfoTitle.textContent = selectedAdminInfoForm.title;
  adminCampaignPicker.hidden = true;
  adminDetail.hidden = true;
  adminPollDetail.hidden = true;
  adminInfoDetail.hidden = false;
  adminBatDetail.hidden = true;
  infoResponses = await getInfoResponses();
  renderInfoResults();
}

async function showAdminCampaignPicker() {
  selectedAdminCampaign = null;
  selectedAdminPoll = null;
  selectedAdminInfoForm = null;
  adminShowingClosedCampaigns = false;
  adminCampaignPicker.hidden = false;
  adminDetail.hidden = true;
  adminPollDetail.hidden = true;
  adminInfoDetail.hidden = true;
  adminBatDetail.hidden = true;
  await refreshPollResponseCounts();
  if (adminUnlocked) {
    infoResponses = await getInfoResponses();
    await refreshAdminValidationResponses();
  }
  renderAdminResetAlert();
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
    .filter((item) => responseMatchesCampaign(item, selectedAdminCampaign));
  const answeredNames = pharmacyNamesForResponses(responses);
  const notInterestedNames = pharmacyNamesForResponses(responses.filter(campaignIsNotInterested));
  const interested = responses.filter(campaignIsInterested).length;
  const unansweredNames = unansweredNamesForResponses(responses);

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

  const responses = (await getPollResponses()).filter((item) => responseMatchesPoll(item, selectedAdminPoll));
  const counts = new Map((selectedAdminPoll.options || []).map((option) => [option, 0]));
  responses.forEach((response) => {
    counts.set(response.answer, (counts.get(response.answer) || 0) + 1);
  });

  const pollAnsweredNames = pharmacyNamesForResponses(responses);
  const pollUnansweredNames = unansweredNamesForResponses(responses);

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

function renderInfoResults() {
  if (!adminUnlocked || !selectedAdminInfoForm) return;

  const responses = infoResponses.filter((item) => responseMatchesInfoForm(item, selectedAdminInfoForm));
  const answeredNames = pharmacyNamesForResponses(responses);
  const unansweredNames = unansweredNamesForResponses(responses);

  infoAnsweredPharmacies.innerHTML = pharmacyListMarkup(answeredNames, "Aucune réponse pour le moment.");
  infoUnansweredPharmacies.innerHTML = pharmacyListMarkup(unansweredNames, "Toutes les pharmacies actives ont répondu.");
  infoResultsSummary.innerHTML = [
    `<div><span>${responses.length}</span><p>fiche${responses.length > 1 ? "s" : ""} reçue${responses.length > 1 ? "s" : ""}</p></div>`,
    `<div><span>${answeredNames.length}</span><p>pharmacie${answeredNames.length > 1 ? "s" : ""} à jour</p></div>`,
    `<div><span>${unansweredNames.length}</span><p>sans réponse</p></div>`
  ].join("");

  if (!responses.length) {
    infoResponsesTable.innerHTML = '<tr><td colspan="6" class="empty-state">Aucune fiche reçue pour le moment.</td></tr>';
    return;
  }

  infoResponsesTable.innerHTML = responses
    .slice()
    .reverse()
    .map((response) => `
      <tr>
        <td>${escapeHtml(response.createdAt || "")}</td>
        <td><strong>${escapeHtml(response.pharmacyName || "")}</strong></td>
        <td>
          ${escapeHtml(response.address || "-")}<br>
          ${escapeHtml(response.postalCode || "")} ${escapeHtml(response.city || "")}<br>
          Téléphone : <strong>${escapeHtml(response.phone || "-")}</strong><br>
          Titulaire : <strong>${escapeHtml(response.ownerEmail || response.email || "-")}</strong><br>
          Équipe : <strong>${escapeHtml(response.teamEmail || "-")}</strong>
        </td>
        <td>
          Facebook : ${escapeHtml(response.facebook || "-")}<br>
          Instagram : ${escapeHtml(response.instagram || "-")}<br>
          LinkedIn : ${escapeHtml(response.linkedin || "-")}<br>
          TikTok : ${escapeHtml(response.tiktok || "-")}<br>
          Site : ${escapeHtml(response.website || "-")}
        </td>
        <td>${escapeHtml(formatProfileHours(response.hours || []) || "-").replaceAll("\n", "<br>")}</td>
        <td>
          ${(response.services || []).map((service) => `\u2022 ${escapeHtml(service)}`).join("<br>") || "-"}
          ${response.otherServices ? `<br><strong>Autres :</strong> ${escapeHtml(response.otherServices)}` : ""}
        </td>
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

  const responses = (await getPollResponses()).filter((item) => responseMatchesPoll(item, selectedAdminPoll));
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

function exportInfoToExcel() {
  if (!selectedAdminInfoForm) return;
  if (API_AVAILABLE && adminUnlocked) {
    window.location.href = `/api/info-export.xls?code=${encodeURIComponent(ADMIN_CODE)}&form=${encodeURIComponent(selectedAdminInfoForm.id)}`;
    adminMessage.textContent = "Export Excel des fiches pharmacies généré.";
    return;
  }

  const responses = infoResponses.filter((item) => responseMatchesInfoForm(item, selectedAdminInfoForm));
  if (!responses.length) {
    adminMessage.textContent = "Aucune fiche pharmacie à exporter.";
    return;
  }

  const headings = ["Date", "Pharmacie", "Adresse", "Code postal", "Ville", "Téléphone", "Mail titulaire", "Mail équipe", "Facebook", "Instagram", "LinkedIn", "TikTok", "Site internet", "Horaires", "Services", "Autres services", "Commentaire"];
  const body = responses.map((row) => `
    <tr>
      <td>${escapeHtml(row.createdAt)}</td>
      <td>${escapeHtml(row.pharmacyName)}</td>
      <td>${escapeHtml(row.address)}</td>
      <td>${escapeHtml(row.postalCode)}</td>
      <td>${escapeHtml(row.city)}</td>
      <td>${escapeHtml(row.phone)}</td>
      <td>${escapeHtml(row.ownerEmail || row.email || "")}</td>
      <td>${escapeHtml(row.teamEmail)}</td>
      <td>${escapeHtml(row.facebook)}</td>
      <td>${escapeHtml(row.instagram)}</td>
      <td>${escapeHtml(row.linkedin)}</td>
      <td>${escapeHtml(row.tiktok)}</td>
      <td>${escapeHtml(row.website)}</td>
      <td>${escapeHtml(formatProfileHours(row.hours || []))}</td>
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
          <tbody>${body}</tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([workbook], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fiches-pharmacies-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  adminMessage.textContent = "Export Excel des fiches pharmacies généré.";
}

function exportPharmacyPasswordsToExcel() {
  if (!adminUnlocked) return;
  if (!pharmacies.length) {
    adminMessage.textContent = "Aucun accès pharmacie à exporter.";
    return;
  }

  const sortedPharmacies = pharmacies
    .slice()
    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "fr"));
  const headings = ["Pharmacie", "Mot de passe", "Accès actif", "Mot de passe à changer", "Demande de réinitialisation", "Date de demande"];
  const body = sortedPharmacies.map((pharmacy) => `
    <tr>
      <td>${escapeHtml(pharmacy.name || "")}</td>
      <td>${escapeHtml(pharmacy.password || "")}</td>
      <td>${pharmacy.active === false ? "Non" : "Oui"}</td>
      <td>${pharmacy.mustChangePassword === false ? "Non" : "Oui"}</td>
      <td>${pharmacy.passwordResetRequested ? "Oui" : "Non"}</td>
      <td>${escapeHtml(pharmacy.passwordResetRequestedAt || "")}</td>
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
  link.download = `mots-de-passe-pharmacies-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  adminMessage.textContent = "Export Excel des mots de passe pharmacies généré.";
}

function exportBatToExcel() {
  const documents = batDocumentsForActivePharmacies();
  if (!documents.length) {
    adminMessage.textContent = "Aucun document à exporter.";
    return;
  }

  const headings = ["Pharmacie", "Statut", "Date", "Correction / commentaire", "Document"];
  const body = documents.map((document) => {
    const response = batResponseForDocument(document);
    const status = normalizeValidationStatus(response?.status) || "En attente";
    return `
      <tr>
        <td>${escapeHtml(response?.pharmacyName || document.pharmacyName)}</td>
        <td>${escapeHtml(status)}</td>
        <td>${escapeHtml(response?.updatedAt || response?.createdAt || "")}</td>
        <td>${escapeHtml(response?.comment || "")}</td>
        <td>${escapeHtml(document.url)}</td>
      </tr>
    `;
  }).join("");

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
  link.download = `validations-documents-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  adminMessage.textContent = "Export Excel des validations généré.";
}

async function exportToExcel() {
  if (API_AVAILABLE && adminUnlocked && selectedAdminCampaign) {
    window.location.href = `/api/export.xls?code=${encodeURIComponent(ADMIN_CODE)}&campaign=${encodeURIComponent(selectedAdminCampaign.id)}`;
    adminMessage.textContent = "Export Excel généré.";
    return;
  }

  const responses = (await getResponses())
    .filter((item) => responseMatchesCampaign(item, selectedAdminCampaign));
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

adminDashboardNav?.addEventListener("click", async (event) => {
  const groupButton = event.target.closest("[data-admin-group]");
  if (groupButton) {
    const nextSection = ADMIN_GROUP_DEFAULT_SECTION[groupButton.dataset.adminGroup] || "new-campaign";
    await showAdminSectionFresh(nextSection);
    return;
  }

  const button = event.target.closest("[data-admin-section]");
  if (!button) return;
  await showAdminSectionFresh(button.dataset.adminSection);
});

adminResetAlert?.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-open-reset-requests]");
  if (!button) return;
  await showAdminSectionFresh("pharmacies");
  pharmacyAccountsList?.scrollIntoView({ behavior: "smooth", block: "start" });
});

togglePharmacyPassword?.addEventListener("click", () => {
  const isPassword = pharmacyPassword.type === "password";
  pharmacyPassword.type = isPassword ? "text" : "password";
  togglePharmacyPassword.textContent = isPassword ? "Masquer" : "Voir";
  togglePharmacyPassword.setAttribute("aria-label", isPassword ? "Masquer le mot de passe" : "Afficher le mot de passe");
});

forgotPharmacyPasswordBtn?.addEventListener("click", () => {
  forgotPharmacyPasswordForm.hidden = !forgotPharmacyPasswordForm.hidden;
  if (!forgotPharmacyPasswordForm.hidden) {
    forgotPharmacyName.focus();
  }
});

forgotPharmacyPasswordForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const pharmacyName = forgotPharmacyName.value.trim();
  if (!pharmacyName) {
    pharmacyLoginMessage.textContent = "Indiquez le nom de votre pharmacie.";
    return;
  }

  try {
    await requestPharmacyPasswordReset(pharmacyName);
    forgotPharmacyPasswordForm.reset();
    forgotPharmacyPasswordForm.hidden = true;
    pharmacyLoginMessage.textContent = "Demande transmise. L'administrateur pourra réinitialiser votre mot de passe.";
  } catch (error) {
    pharmacyLoginMessage.textContent = error.message || "Impossible de transmettre la demande. Réessayez.";
  }
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
    archivedOrdersVisible = false;
    localStorage.setItem(PHARMACY_SESSION_KEY, JSON.stringify(currentPharmacy));
    pharmacyPassword.value = "";
    pharmacyLoginMessage.textContent = "";
    await refreshPharmacyPollAnswers();
    await refreshPharmacyCampaignResponses();
    await refreshPharmacyInfoResponses();
    await refreshPharmacyValidationResponses();
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
    archivedOrdersVisible = false;
    localStorage.setItem(PHARMACY_SESSION_KEY, JSON.stringify(currentPharmacy));
    pendingPasswordPharmacy = null;
    pendingInitialPassword = "";
    newPharmacyPassword.value = "";
    confirmPharmacyPassword.value = "";
    pharmacyLoginMessage.textContent = "";
    await refreshPharmacyPollAnswers();
    await refreshPharmacyCampaignResponses();
    await refreshPharmacyInfoResponses();
    await refreshPharmacyValidationResponses();
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
  archivedOrdersVisible = false;
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

toggleArchivedOrdersBtn?.addEventListener("click", () => {
  showArchivedOrdersPage();
});

backToArchivedOrdersMenuBtn?.addEventListener("click", showCampaignPicker);

downloadArchivedOrdersPdfBtn?.addEventListener("click", exportArchivedOrdersPdf);

batCards?.addEventListener("click", (event) => {
  if (event.target.closest("[data-bat-pdf-link]")) return;
  const button = event.target.closest("[data-form-bat]");
  if (!button) return;
  selectBat(button.dataset.formBat);
});

batCards?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  if (event.target.closest("[data-bat-pdf-link], button, input, textarea")) return;
  const card = event.target.closest("[data-form-bat]");
  if (!card) return;
  event.preventDefault();
  selectBat(card.dataset.formBat);
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

infoCards?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-info-form]");
  if (!button) return;
  selectInfoForm(button.dataset.infoForm);
});

infoCards?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-info-form]");
  if (!card) return;
  event.preventDefault();
  selectInfoForm(card.dataset.infoForm);
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

adminInfoCards?.addEventListener("click", async (event) => {
  const deleteButton = event.target.closest("[data-delete-info]");
  if (deleteButton) {
    const infoForm = infoForms.find((item) => item.id === deleteButton.dataset.deleteInfo);
    if (!infoForm) return;
    const confirmed = confirm(`Supprimer définitivement la demande "${infoForm.title}" ?`);
    if (!confirmed) return;
    infoForms = infoForms.filter((item) => item.id !== infoForm.id);
    infoResponses = infoResponses.filter((item) => item.formId !== infoForm.id);
    infoForms = await saveInfoForms(infoForms);
    infoResponses = await saveInfoResponses(infoResponses);
    if (selectedAdminInfoForm?.id === infoForm.id) selectedAdminInfoForm = null;
    renderCampaignPickers();
    adminMessage.textContent = `Demande "${infoForm.title}" supprimée.`;
    return;
  }

  const toggleButton = event.target.closest("[data-toggle-closed-info]");
  if (toggleButton) {
    const infoForm = infoForms.find((item) => item.id === toggleButton.dataset.toggleClosedInfo);
    if (!infoForm) return;
    const nextClosed = !infoForm.closed;
    const confirmed = confirm(nextClosed
      ? `Clôturer la demande "${infoForm.title}" ?\n\nElle ne sera plus visible par les pharmacies.`
      : `Rouvrir la demande "${infoForm.title}" ?\n\nElle redeviendra visible par les pharmacies.`);
    if (!confirmed) return;
    infoForm.closed = nextClosed;
    infoForms = infoForms.map((item) => item.id === infoForm.id ? infoForm : item);
    infoForms = await saveInfoForms(infoForms);
    renderCampaignPickers();
    adminMessage.textContent = nextClosed ? `Demande "${infoForm.title}" clôturée.` : `Demande "${infoForm.title}" rouverte.`;
    return;
  }

  const button = event.target.closest("[data-admin-info]");
  if (!button) return;
  await selectAdminInfoForm(button.dataset.adminInfo);
});

adminBatCards?.addEventListener("click", async (event) => {
  const deleteButton = event.target.closest("[data-delete-validation]");
  if (deleteButton) {
    event.stopPropagation();
    const confirmed = confirm("Supprimer définitivement cette validation ?\n\nLe titre, le message, les documents importés et les réponses seront supprimés.");
    if (!confirmed) return;
    resetValidationState();
    await saveValidationState({ title: "", description: "", archived: false, documents: [] });
    await saveValidationResponses([]);
    showAdminSection("new-validation");
    renderCampaignPickers();
    adminMessage.textContent = "Validation supprimée. Vous pouvez repartir de zéro.";
    return;
  }

  const archiveButton = event.target.closest("[data-toggle-validation-archive]");
  if (archiveButton) {
    event.stopPropagation();
    const validationConfig = currentValidationConfig();
    const nextArchived = !validationConfig.archived;
    const confirmed = confirm(nextArchived
      ? "Archiver cette validation ?\n\nElle ne sera plus visible par les pharmacies, mais restera consultable dans Archivés."
      : "Rouvrir cette validation ?\n\nElle redeviendra visible par les pharmacies concernées.");
    if (!confirmed) return;
    setValidationArchived(nextArchived);
    await saveValidationState({
      title: validationConfig.title,
      description: validationConfig.description,
      archived: nextArchived,
      documents: batDocuments
    });
    renderCampaignPickers();
    adminMessage.textContent = nextArchived ? "Validation archivée." : "Validation rouverte.";
    return;
  }

  const button = event.target.closest("[data-admin-bat-overview], [data-admin-bat-document]");
  if (!button) return;
  await selectAdminBat();
});

createValidationForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = document.querySelector("#newValidationTitle")?.value.trim() || "";
  const message = batAdminMessage?.value.trim() || "";
  if (!title) {
    adminMessage.textContent = "Indiquez le nom de la validation.";
    return;
  }

  validationConfigState = { title, description: message, archived: false };
  localStorage.setItem(VALIDATION_TITLE_KEY, title);
  localStorage.setItem(VALIDATION_MESSAGE_KEY, message);
  setValidationArchived(false);
  batDocuments = [];
  batResponses = [];
  saveLocalValidationDocuments(batDocuments);
  saveLocalBatResponses(batResponses);
  if (validationDocumentInput?.files?.length) {
    await importValidationDocuments(validationDocumentInput.files, validationImportMessage);
    validationDocumentInput.value = "";
  }
  await saveValidationState({ title, description: message, archived: false, documents: batDocuments });
  await saveValidationResponses([]);
  renderCampaignPickers();
  showAdminSection("bat");
  adminMessage.textContent = `Validation "${title}" créée. Les documents rattachés aux pharmacies sont visibles dans validations en attente.`;
});

validationDocumentInput?.addEventListener("change", async () => {
  if (!validationDocumentInput.files.length) return;
  await importValidationDocuments(validationDocumentInput.files, validationImportMessage);
});

adminValidationDocumentInput?.addEventListener("change", async () => {
  if (!adminValidationDocumentInput.files.length) return;
  await importValidationDocuments(adminValidationDocumentInput.files, adminValidationImportMessage);
  adminValidationDocumentInput.value = "";
});

adminBatDetail?.addEventListener("click", async (event) => {
  const deleteButton = event.target.closest("[data-delete-validation]");
  if (deleteButton) {
    const confirmed = confirm("Supprimer définitivement cette validation ?\n\nLe titre, le message, les documents importés et les réponses seront supprimés.");
    if (!confirmed) return;
    resetValidationState();
    await saveValidationState({ title: "", description: "", archived: false, documents: [] });
    await saveValidationResponses([]);
    adminBatDetail.hidden = true;
    showAdminSection("new-validation");
    renderCampaignPickers();
    adminMessage.textContent = "Validation supprimée. Vous pouvez repartir de zéro.";
    return;
  }

  const archiveButton = event.target.closest("[data-toggle-validation-archive]");
  if (archiveButton) {
    const validationConfig = currentValidationConfig();
    const nextArchived = !validationConfig.archived;
    const confirmed = confirm(nextArchived
      ? "Archiver cette validation ?\n\nElle ne sera plus visible par les pharmacies, mais restera consultable dans Archivés."
      : "Rouvrir cette validation ?\n\nElle redeviendra visible par les pharmacies concernées.");
    if (!confirmed) return;
    setValidationArchived(nextArchived);
    await saveValidationState({
      title: validationConfig.title,
      description: validationConfig.description,
      archived: nextArchived,
      documents: batDocuments
    });
    showAdminCampaignPicker();
    adminMessage.textContent = nextArchived ? "Validation archivée." : "Validation rouverte.";
    return;
  }

  const toggleButton = event.target.closest("[data-toggle-bat-documents]");
  if (toggleButton) {
    batDocumentsExpanded = !batDocumentsExpanded;
    renderBatResults();
    return;
  }

  if (event.target.closest("[data-export-bat-excel]")) {
    exportBatToExcel();
  }
});

backToAdminInfoBtn?.addEventListener("click", showAdminCampaignPicker);
backToAdminBatBtn?.addEventListener("click", showAdminCampaignPicker);

backToCampaignsBtn.addEventListener("click", showCampaignPicker);
backToPollsBtn.addEventListener("click", showCampaignPicker);
backToBatListBtn?.addEventListener("click", showCampaignPicker);
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

createInfoForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = newInfoTitle.value.trim();
  if (!title) {
    adminMessage.textContent = "Indiquez le titre de la mise à jour fiche pharmacie.";
    return;
  }

  const baseId = slugify(title);
  let id = baseId;
  let index = 2;
  while (infoForms.some((infoForm) => infoForm.id === id)) {
    id = `${baseId}-${index}`;
    index += 1;
  }

  const infoForm = {
    id,
    title,
    type: "Fiche pharmacie",
    intro: newInfoIntro.value.trim() || "Merci de noter vos coordonnées, réseaux sociaux, horaires et services proposés.",
    closed: false
  };

  infoForms = [...infoForms, infoForm];
  infoForms = await saveInfoForms(infoForms);
  createInfoForm.reset();
  showAdminSection("polls");
  adminMessage.textContent = `Demande "${title}" créée dans les sondages.`;
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
    mustChangePassword: true,
    passwordResetRequested: false,
    passwordResetRequestedAt: ""
  };

  pharmacies = await savePharmacies([...pharmacies, pharmacy]);
  newPharmacyName.value = "";
  renderPharmacyAccounts();
  renderAdminResetAlert();
  renderPharmacyAccess();
  showAdminSection("pharmacies");
  adminMessage.textContent = `Accès créé pour ${name}. Mot de passe : ${pharmacy.password}`;
});

pharmacyAccountsList.addEventListener("click", async (event) => {
  const exportButton = event.target.closest("[data-export-pharmacy-passwords]");
  if (exportButton) {
    exportPharmacyPasswordsToExcel();
    return;
  }

  const resetButton = event.target.closest("[data-reset-pharmacy-password]");
  if (resetButton) {
    const pharmacy = pharmacies.find((item) => item.id === resetButton.dataset.resetPharmacyPassword);
    if (!pharmacy) return;
    const newPassword = generatePharmacyPassword(pharmacy.name);
    const confirmed = confirm(`Réinitialiser le mot de passe de ${pharmacy.name} ?`);
    if (!confirmed) return;
    pharmacies = await savePharmacies(pharmacies.map((item) => item.id === pharmacy.id ? {
      ...item,
      password: newPassword,
      mustChangePassword: true,
      passwordResetRequested: false,
      passwordResetRequestedAt: ""
    } : item));
    renderPharmacyAccounts();
    renderAdminResetAlert();
    adminMessage.textContent = `Mot de passe réinitialisé pour ${pharmacy.name} : ${newPassword}`;
    return;
  }

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
  renderAdminResetAlert();
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

batValidationForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!selectedBatDocument) {
    batMessage.textContent = "Veuillez choisir un document avant d'envoyer une réponse.";
    return;
  }

  const status = batValidationForm.querySelector('input[name="batStatus"]:checked')?.value || "";
  const pharmacyName = batPharmacyName.value.trim();
  const comment = batComment.value.trim();

  if (!pharmacyName || !status) {
    batMessage.textContent = "Le nom de la pharmacie et la validation sont obligatoires.";
    return;
  }

  if (status === "Correction demandée" && !comment) {
    batMessage.textContent = "Merci d'indiquer la correction demandée.";
    return;
  }

  const previousResponse = batResponseForDocument(selectedBatDocument);
  const now = new Date().toLocaleString("fr-FR");
  const response = {
    id: previousResponse?.id || createId(),
    validationId: BAT_VALIDATION.id,
    documentId: selectedBatDocument.id,
    documentUrl: selectedBatDocument.url,
    createdAt: previousResponse?.createdAt || now,
    updatedAt: previousResponse ? now : "",
    pharmacyId: currentPharmacy?.id || "",
    pharmacyName,
    status,
    comment
  };

  const savedResponse = await submitValidationResponse(response);
  batResponses = batResponses
    .filter((item) => item.documentId !== selectedBatDocument.id)
    .concat(savedResponse);
  saveLocalBatResponses(batResponses);
  renderCampaignPickers();
  renderBatResults();
  showSuccessScreen();
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

profileUpdateForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!selectedInfoForm) {
    profileMessage.textContent = "Veuillez choisir une mise à jour avant d'envoyer votre fiche.";
    return;
  }

  const pharmacyName = profilePharmacyName.value.trim();
  if (!pharmacyName) {
    profileMessage.textContent = "Le nom de la pharmacie est obligatoire.";
    return;
  }

  const response = {
    id: createId(),
    formId: selectedInfoForm.id,
    formTitle: selectedInfoForm.title,
    createdAt: new Date().toLocaleString("fr-FR"),
    pharmacyId: currentPharmacy?.id || "",
    pharmacyName,
    address: profileAddress.value.trim(),
    postalCode: profilePostalCode.value.trim(),
    city: profileCity.value.trim(),
    phone: profilePhone.value.trim(),
    ownerEmail: profileOwnerEmail.value.trim(),
    teamEmail: profileTeamEmail.value.trim(),
    facebook: profileFacebook.value.trim(),
    instagram: profileInstagram.value.trim(),
    linkedin: profileLinkedin.value.trim(),
    tiktok: profileTiktok.value.trim(),
    website: profileWebsite.value.trim(),
    hours: collectProfileHours(),
    services: collectProfileServices(),
    otherServices: profileOtherServices.value.trim(),
    notes: profileNotes.value.trim()
  };

  let savedResponse;
  try {
    savedResponse = await appendInfoResponse(response);
  } catch (error) {
    profileMessage.textContent = error.message || "Enregistrement impossible. Merci de réessayer.";
    return;
  }

  infoResponses = infoResponses
    .filter((item) => !(item.formId === response.formId && currentPharmacy && responseMatchesPharmacy(item, currentPharmacy)))
    .concat(savedResponse || response);
  saveLocalInfoResponses(infoResponses);
  renderCampaignPickers();
  showSuccessScreen();
});

backToInfoFormsBtn?.addEventListener("click", showCampaignPicker);

profileHoursGrid?.addEventListener("change", (event) => {
  const row = event.target.closest("[data-hours-day]");
  if (!row) return;

  if (event.target.matches("[data-hours-split]")) {
    const splitBlock = row.querySelector(".split-hours");
    splitBlock.hidden = !event.target.checked;
  }

  if (event.target.matches("[data-hours-closed]")) {
    const disabled = event.target.checked;
    row.querySelectorAll("input[type='time'], [data-hours-split]").forEach((input) => {
      input.disabled = disabled;
      if (disabled) {
        input.value = "";
        if (input.matches("[data-hours-split]")) input.checked = false;
      }
    });
    const splitBlock = row.querySelector(".split-hours");
    if (splitBlock) splitBlock.hidden = true;
  }
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
  infoForms = await getInfoForms();
  infoResponses = await getInfoResponses();
  batResponses = await getValidationResponses();
  renderPharmacyAccounts();
  renderAdminResetAlert();
  await showAdminCampaignPicker();
  adminMessage.textContent = "Accès administrateur ouvert.";
});

exportExcelBtn.addEventListener("click", exportToExcel);
exportPollExcelBtn.addEventListener("click", exportPollToExcel);
exportInfoExcelBtn?.addEventListener("click", exportInfoToExcel);

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
  infoForms = await getInfoForms();
  infoResponses = localInfoResponses();
  const validationState = await getValidationState();
  validationConfigState = {
    title: validationState.title || "",
    description: validationState.description || "",
    archived: Boolean(validationState.archived)
  };
  batDocuments = Array.isArray(validationState.documents) ? validationState.documents : [];
  batResponses = await getValidationResponses();
  const params = new URLSearchParams(window.location.search);
  if (params.get("resetValidation") === "1") {
    resetValidationState();
    params.delete("resetValidation");
    const nextQuery = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`);
  }
  const validationTitleInput = document.querySelector("#newValidationTitle");
  if (validationTitleInput) validationTitleInput.value = localStorage.getItem("soguasphar_validation_title_preview") || "";
  if (batAdminMessage) batAdminMessage.value = localStorage.getItem("soguasphar_validation_message_preview") || "";
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
  await refreshPharmacyInfoResponses();
  await refreshPharmacyValidationResponses();
  renderCampaignPickers();
  showCampaignPicker();
  await showAdminCampaignPicker();
  renderPharmacyAccess();
}

init();
