// Recupere les avis Google via l'API Places (New) et les ecrit dans src/data/reviews.json.
// Lance automatiquement au build, ou manuellement : npm run reviews
// Ne fait JAMAIS planter le build : si la cle / le Place ID manquent ou si l'API repond mal,
// on conserve simplement le reviews.json existant (derniers avis connus).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "src", "data", "reviews.json");

// Mini-chargeur .env (sans dependance externe)
function loadEnv() {
  const p = join(root, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      process.env[m[1]] = v;
    }
  }
}

loadEnv();

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACE_ID = process.env.GOOGLE_PLACE_ID;

function keep(msg) {
  console.warn(`[reviews] ${msg} -> on garde le reviews.json existant.`);
  process.exit(0);
}

if (!API_KEY || !PLACE_ID) keep("GOOGLE_PLACES_API_KEY ou GOOGLE_PLACE_ID manquant");

const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(PLACE_ID)}?languageCode=fr`;
const fieldMask = ["id", "displayName", "rating", "userRatingCount", "googleMapsUri", "reviews"].join(",");

try {
  const res = await fetch(url, {
    headers: { "X-Goog-Api-Key": API_KEY, "X-Goog-FieldMask": fieldMask },
  });
  if (!res.ok) keep(`API HTTP ${res.status} : ${(await res.text()).slice(0, 300)}`);

  const data = await res.json();
  const reviews = (data.reviews || []).map((r) => ({
    author: r.authorAttribution?.displayName || "Client Google",
    photo: r.authorAttribution?.photoUri || "",
    profileUrl: r.authorAttribution?.uri || "",
    rating: r.rating || 0,
    text: (r.text?.text || r.originalText?.text || "").trim(),
    relative: r.relativePublishTimeDescription || "",
  }));

  const out = {
    rating: data.rating || 0,
    total: data.userRatingCount || 0,
    mapsUri: data.googleMapsUri || "",
    updatedAt: new Date().toISOString().slice(0, 10),
    reviews,
  };

  writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`[reviews] OK : ${reviews.length} avis ecrits (note ${out.rating}/5, ${out.total} au total).`);
} catch (e) {
  keep(`erreur reseau : ${e.message}`);
}
