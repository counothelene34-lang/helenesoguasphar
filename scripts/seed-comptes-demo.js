#!/usr/bin/env node
// Script autonome (à lancer à la main : node scripts/seed-comptes-demo.js).
// Crée des comptes individuels de démonstration dans data/users.json, pour
// tester la nouvelle connexion email + mot de passe sans toucher à
// l'ancien système (data/pharmacies.json garde ses mots de passe pharmacie).
//
// Idempotent : si un email existe déjà, le script le laisse tel quel (ne
// régénère pas de mot de passe, n'écrase rien) et l'indique dans le tableau.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "..", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const PHARMACIES_FILE = path.join(DATA_DIR, "pharmacies.json");

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8") || JSON.stringify(fallback));
  } catch (error) {
    return fallback;
  }
}

function writeUsers(users) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derivedKey = crypto.scryptSync(String(password), salt, 64, { N: 16384 });
  return `scrypt:${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

function generateTempPassword() {
  // 12 caractères lisibles (lettres + chiffres), à usage temporaire : la
  // personne devra le changer (mustChangePassword: true).
  const raw = crypto.randomBytes(12).toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "");
  const body = (raw + "Aa1Bb2Cc3Dd4").slice(0, 10);
  return `${body}!${crypto.randomInt(10, 99)}`;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

const users = readJson(USERS_FILE, []);
const pharmacies = readJson(PHARMACIES_FILE, []);
const activePharmacies = pharmacies.filter((item) => item.active !== false);

if (activePharmacies.length < 2) {
  console.error("Il faut au moins deux pharmacies actives dans data/pharmacies.json pour créer les comptes de démo.");
  process.exit(1);
}

const pharmacy1 = activePharmacies[0];
const pharmacy2 = activePharmacies[1];

const now = new Date().toISOString();

function makeUser({ email, firstName, lastName, role, pharmacyId, jobTitle }) {
  return {
    id: `user-${crypto.randomBytes(8).toString("hex")}`,
    email: normalizeEmail(email),
    passwordHash: null, // rempli juste avant l'ajout
    firstName: firstName || "",
    lastName: lastName || "",
    pharmacyId: pharmacyId || null,
    role,
    jobTitle: jobTitle || "",
    active: true,
    mustChangePassword: true,
    createdAt: now,
    lastLoginAt: null,
    invitedAt: now,
    invitationToken: null
  };
}

const wanted = [
  makeUser({
    email: "helene.counot@soguasphar.com",
    firstName: "Hélène",
    lastName: "Counot",
    role: "soguasphar_admin"
  }),
  makeUser({
    email: "jean-garry+test@soguasphar.fr",
    firstName: "Jean-Garry",
    lastName: "(test)",
    role: "soguasphar_admin"
  }),
  makeUser({
    email: "counothelene34+titulaire@gmail.com",
    firstName: "Titulaire",
    lastName: pharmacy1.name,
    role: "pharmacy_admin",
    pharmacyId: pharmacy1.id,
    jobTitle: "titulaire"
  }),
  makeUser({
    email: "counothelene34+preparateur1@gmail.com",
    firstName: "Préparateur 1",
    lastName: pharmacy1.name,
    role: "pharmacy_collaborator",
    pharmacyId: pharmacy1.id,
    jobTitle: "préparateur"
  }),
  makeUser({
    email: "counothelene34+preparateur2@gmail.com",
    firstName: "Préparateur 2",
    lastName: pharmacy1.name,
    role: "pharmacy_collaborator",
    pharmacyId: pharmacy1.id,
    jobTitle: "préparateur"
  }),
  makeUser({
    email: "counothelene34+autrepharma@gmail.com",
    firstName: "Titulaire",
    lastName: pharmacy2.name,
    role: "pharmacy_admin",
    pharmacyId: pharmacy2.id,
    jobTitle: "titulaire"
  })
];

const recap = [];
let changed = false;

wanted.forEach((candidate) => {
  const existing = users.find((item) => normalizeEmail(item.email) === candidate.email);
  if (existing) {
    recap.push({ email: candidate.email, role: candidate.role, pharmacie: pharmacyLabel(candidate.pharmacyId), motDePasse: "(déjà existant, inchangé)" });
    return;
  }
  const tempPassword = generateTempPassword();
  candidate.passwordHash = hashPassword(tempPassword);
  users.push(candidate);
  changed = true;
  recap.push({ email: candidate.email, role: candidate.role, pharmacie: pharmacyLabel(candidate.pharmacyId), motDePasse: tempPassword });
});

function pharmacyLabel(pharmacyId) {
  if (!pharmacyId) return "(admin SOGUASPHAR)";
  if (pharmacyId === pharmacy1.id) return pharmacy1.name;
  if (pharmacyId === pharmacy2.id) return pharmacy2.name;
  return pharmacyId;
}

if (changed) {
  writeUsers(users);
  console.log(`data/users.json mis à jour (${users.length} compte(s) au total).\n`);
} else {
  console.log("Rien à créer : tous les comptes de démo existent déjà.\n");
}

console.log("Récapitulatif des comptes de démo :");
console.log("------------------------------------------------------------------------");
recap.forEach((row) => {
  console.log(`${row.email}\n  rôle: ${row.role} | pharmacie: ${row.pharmacie}\n  mot de passe temporaire: ${row.motDePasse}\n`);
});
console.log("------------------------------------------------------------------------");
console.log("Ces mots de passe sont temporaires (mustChangePassword=true côté modèle,");
console.log("le changement obligatoire au premier login sera branché côté front plus tard).");
