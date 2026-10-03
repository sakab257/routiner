// Generates the square PWA / favicon icons from the official logo
// (public/icons/logo-white.png) placed on the brand gradient.
// Run with `pnpm icons` after changing the logo.
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const icons = (file) => path.join(root, "public/icons", file);

const LOGO = icons("logo-white.png");

/** Brand gradient square on a 512 canvas; `radius` 0 = full bleed (maskable / Apple icons). */
function background(radius) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5A63FF"/><stop offset="0.45" stop-color="#3843FF"/><stop offset="1" stop-color="#0000FF"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${radius}" fill="url(#g)"/>
</svg>`);
}

/**
 * @param {object} o
 * @param {number} o.size output size in px
 * @param {number} o.radius corner radius on a 512 canvas
 * @param {number} o.logoWidth logo width on a 512 canvas
 */
async function icon({ size, radius, logoWidth }) {
  const logo = await sharp(LOGO).resize({ width: logoWidth }).toBuffer();
  const canvas = await sharp(background(radius))
    .resize(512, 512)
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toBuffer();
  return sharp(canvas).resize(size, size).png();
}

await Promise.all([
  (await icon({ size: 192, radius: 112, logoWidth: 300 })).toFile(icons("app-icon-192.png")),
  (await icon({ size: 512, radius: 112, logoWidth: 300 })).toFile(icons("app-icon-512.png")),
  // Maskable icons must keep the logo inside the central 80% safe zone.
  (await icon({ size: 512, radius: 0, logoWidth: 270 })).toFile(icons("app-icon-maskable-512.png")),
  (await icon({ size: 180, radius: 0, logoWidth: 300 })).toFile(icons("apple-touch-icon.png")),
  (await icon({ size: 48, radius: 112, logoWidth: 320 })).toFile(icons("favicon-48.png")),
]);
console.log("Icons written to public/icons");
