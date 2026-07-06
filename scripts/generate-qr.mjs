import QRCode from "qrcode";
import { writeFileSync, mkdirSync } from "node:fs";

const url = "https://lecomptoirdenath.com/carte";
const opts = {
  errorCorrectionLevel: "H", // haute correction = robuste a l'impression
  margin: 3,
  color: { dark: "#0d4a63", light: "#ffffff" }, // bleu ocean sur blanc
};

mkdirSync("qr", { recursive: true });

// PNG haute resolution (pour un aperçu / usage web)
await QRCode.toFile("qr/qr-carte.png", url, { ...opts, width: 1400, type: "png" });

// SVG vectoriel (impression nette a n'importe quelle taille)
const svg = await QRCode.toString(url, { ...opts, type: "svg" });
writeFileSync("qr/qr-carte.svg", svg);

console.log("QR genere -> qr/qr-carte.png + qr/qr-carte.svg  (vers " + url + ")");
