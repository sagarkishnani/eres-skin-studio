#!/usr/bin/env node

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { execSync } from "node:child_process";
import { gzipSync } from "node:zlib";

const args = process.argv.slice(2);
const DIST = args.includes("--dist") ? args[args.indexOf("--dist") + 1] : "dist";
const STRICT = args.includes("--strict");

const BUDGET_JS = 150 * 1024;
const BUDGET_PAGE = 1024 * 1024;
const BUDGET_IMG = 300 * 1024;

const errors = [];
const warnings = [];
const passes = [];

const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const ok = (m) => passes.push(m);
const kb = (n) => `${Math.round(n / 1024)} KB`;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

if (!existsSync(DIST)) {
  console.error(`No existe ${DIST}/. Corre primero: npm run build`);
  process.exit(1);
}

// dist/admin es la SPA de terceros de TinaCMS: no es entregable y romperia SEO y presupuesto de JS.
const EXCLUDED = [`${DIST}/admin/`];
const isOurs = (f) => !EXCLUDED.some((dir) => f.startsWith(dir));

const files = walk(DIST).filter(isOurs);
const pages = files.filter((f) => f.endsWith(".html"));
const scripts = files.filter((f) => extname(f) === ".js");
const images = files.filter((f) => /\.(png|jpe?g|webp|avif|gif)$/i.test(f));

const SECRET_PATTERNS = [
  [/ck_[a-f0-9]{30,}/i, "consumer key de WooCommerce"],
  [/cs_[a-f0-9]{30,}/i, "consumer secret de WooCommerce"],
  [/service_role/i, "referencia a la service_role key de Supabase"],
  [/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/, "posible JWT"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "clave privada"],
];

let secretFound = false;
for (const file of [...pages, ...scripts]) {
  const body = readFileSync(file, "utf8");
  for (const [re, label] of SECRET_PATTERNS) {
    if (re.test(body)) {
      err(`Secreto en el build: ${label} en ${relative(DIST, file)}`);
      secretFound = true;
    }
  }
}
if (!secretFound) ok("Sin secretos detectados en el build");

try {
  const tracked = execSync("git ls-files", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const bad = tracked
    .split("\n")
    .filter((f) => /(^|\/)\.env$/.test(f) || /(^|\/)(site|woo)-config\.php$/.test(f));
  if (bad.length) err(`Archivos con secretos versionados: ${bad.join(", ")}`);
  else ok("Ningun archivo de secretos esta versionado");
} catch {
  warn("No se pudo revisar git (no es un repositorio)");
}

let missingTitle = 0;
let missingDesc = 0;
let missingOg = 0;
let missingCanonical = 0;
let missingLang = 0;
let badH1 = 0;
let missingAlt = 0;
let heavyPages = [];
let jsonLdPages = 0;

for (const file of pages) {
  const html = readFileSync(file, "utf8");
  const name = relative(DIST, file);

  if (!/<title[^>]*>\s*\S/i.test(html)) { err(`Sin <title>: ${name}`); missingTitle++; }
  if (!/<meta[^>]+name=["']description["'][^>]+content=["']\s*\S/i.test(html)) {
    err(`Sin meta description: ${name}`); missingDesc++;
  }
  if (!/property=["']og:image["']/i.test(html)) missingOg++;
  if (!/rel=["']canonical["']/i.test(html)) missingCanonical++;
  if (!/<html[^>]+lang=["'][a-z]{2}/i.test(html)) missingLang++;

  const h1 = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1 !== 1) badH1++;

  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  missingAlt += imgs.filter((t) => !/\balt=/i.test(t)).length;

  if (/application\/ld\+json/i.test(html)) jsonLdPages++;

  const size = statSync(file).size;
  if (size > 300 * 1024) heavyPages.push(`${name} (${kb(size)} de HTML)`);
}

if (!missingTitle && !missingDesc) ok(`${pages.length} paginas con title y description`);
if (missingOg) warn(`${missingOg} pagina(s) sin og:image`);
if (missingCanonical) warn(`${missingCanonical} pagina(s) sin canonical`);
if (missingLang) warn(`${missingLang} pagina(s) sin lang en <html>`);
if (badH1) warn(`${badH1} pagina(s) sin exactamente un <h1>`);
if (missingAlt) warn(`${missingAlt} imagen(es) sin atributo alt`);
if (!jsonLdPages) warn("Ninguna pagina tiene datos estructurados JSON-LD");
for (const p of heavyPages) warn(`HTML pesado: ${p}`);

for (const f of ["sitemap-index.xml", "sitemap.xml"]) {
  if (existsSync(join(DIST, f))) { ok(`${f} presente`); break; }
  if (f === "sitemap.xml") warn("No se encontro sitemap");
}

const robotsPath = join(DIST, "robots.txt");
if (!existsSync(robotsPath)) {
  warn("No hay robots.txt");
} else {
  const robots = readFileSync(robotsPath, "utf8");
  if (/^\s*Disallow:\s*\/\s*$/im.test(robots)) err("robots.txt bloquea todo el sitio (queda del staging)");
  else ok("robots.txt correcto");
  if (!/sitemap:/i.test(robots)) warn("robots.txt no declara el sitemap");
}

if (!existsSync(join(DIST, "404.html"))) warn("No hay pagina 404");
if (!files.some((f) => /favicon\.(ico|svg|png)$/i.test(f))) warn("No hay favicon");

// Gzipped y por pagina: sumar todos los chunks del sitio penaliza codigo que nunca se carga junto.
const gzipOf = (file) => gzipSync(readFileSync(file)).length;

const gzipCache = new Map();
const gzipCached = (f) => {
  if (!gzipCache.has(f)) gzipCache.set(f, gzipOf(f));
  return gzipCache.get(f);
};

function scriptsOf(htmlFile) {
  const html = readFileSync(htmlFile, "utf8");
  const refs = new Set(html.match(/[\w./-]*_astro\/[\w.-]+\.js/g) || []);
  const out = [];
  for (const ref of refs) {
    const p = join(DIST, ref.replace(/^.*?_astro\//, "_astro/"));
    if (existsSync(p)) out.push(p);
  }
  return out;
}

let worstPage = null;
for (const page of pages) {
  const weight = scriptsOf(page).reduce((sum, f) => sum + gzipCached(f), 0);
  if (!worstPage || weight > worstPage.weight) worstPage = { name: relative(DIST, page), weight };
}

if (worstPage) {
  const { name, weight } = worstPage;
  if (weight > BUDGET_JS * 2) err(`JavaScript: ${kb(weight)} gzipped en ${name} (mas del doble del presupuesto de ${kb(BUDGET_JS)})`);
  else if (weight > BUDGET_JS) warn(`JavaScript: ${kb(weight)} gzipped en ${name} (presupuesto ${kb(BUDGET_JS)})`);
  else ok(`JavaScript: ${kb(weight)} gzipped en la pagina mas pesada (${name}), dentro del presupuesto`);
}

for (const img of images) {
  const size = statSync(img).size;
  if (size > BUDGET_IMG) warn(`Imagen pesada: ${relative(DIST, img)} (${kb(size)})`);
}

const legacy = images.filter((f) => /\.(png|jpe?g)$/i.test(f) && statSync(f).size > 100 * 1024);
if (legacy.length) warn(`${legacy.length} imagen(es) grandes en PNG/JPG: conviene WebP o AVIF`);

const home = join(DIST, "index.html");
if (existsSync(home)) {
  const homeHtml = readFileSync(home, "utf8");
  const cssRefs = new Set(homeHtml.match(/[\w./-]*_astro\/[\w.-]+\.css/g) || []);
  let homeWeight = gzipOf(home) + scriptsOf(home).reduce((sum, f) => sum + gzipCached(f), 0);
  for (const ref of cssRefs) {
    const p = join(DIST, ref.replace(/^.*?_astro\//, "_astro/"));
    if (existsSync(p)) homeWeight += gzipCached(p);
  }
  if (homeWeight > BUDGET_PAGE) warn(`Peso de la home: ${kb(homeWeight)} gzipped (presupuesto ${kb(BUDGET_PAGE)})`);
  else ok(`Peso de la home: ${kb(homeWeight)} gzipped, dentro del presupuesto`);
}

const line = "-".repeat(60);
console.log(`\n${line}\nEstandar de desarrollo web - TWNSTUDIOS\n${line}`);
console.log(`Paginas: ${pages.length}   Scripts: ${scripts.length}   Imagenes: ${images.length}\n`);

for (const m of passes) console.log(`  OK    ${m}`);
if (warnings.length) console.log("");
for (const m of warnings) console.log(`  AVISO ${m}`);
if (errors.length) console.log("");
for (const m of errors) console.log(`  ERROR ${m}`);

console.log(`\n${line}`);
console.log(`${errors.length} error(es), ${warnings.length} aviso(s)`);
console.log(`${line}\n`);

if (errors.length) {
  console.log("Corrige los errores antes de mergear a main.\n");
  process.exit(1);
}
if (STRICT && warnings.length) {
  console.log("Modo estricto: los avisos tambien bloquean.\n");
  process.exit(1);
}
console.log("Estandar cumplido. Los avisos no bloquean, pero conviene revisarlos.\n");
