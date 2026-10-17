// Calcula los hashes de los <script> inline de las páginas y los escribe en
// script-src de dstar-store/netlify.toml. Correr después de editar cualquier
// script inline: node scripts/csp-hashes.js  (con --check solo verifica).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SITE = path.join(__dirname, '..', 'dstar-store');
const TOML = path.join(SITE, 'netlify.toml');
const NO_EJECUTABLES = /^(application\/ld\+json|application\/json)$/i;

function paginas() {
  const html = (dir) => fs.readdirSync(path.join(SITE, dir)).filter((f) => f.endsWith('.html')).map((f) => path.join(dir, f));
  return [...html('.'), ...html('blog')];
}

function hashes() {
  const set = new Set();
  for (const file of paginas()) {
    const html = fs.readFileSync(path.join(SITE, file), 'utf8');
    for (const m of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi)) {
      const attrs = m[1] || '';
      if (/\ssrc=/i.test(attrs)) continue;
      const type = (attrs.match(/\stype="([^"]*)"/i) || [])[1];
      if (type && NO_EJECUTABLES.test(type)) continue;
      const codigo = m[2].replace(/\r\n?/g, '\n');
      set.add(`'sha256-${crypto.createHash('sha256').update(codigo, 'utf8').digest('base64')}'`);
    }
  }
  return [...set].sort();
}

function scriptSrc() {
  return ["script-src 'self'", ...hashes()].join(' ');
}

if (require.main === module) {
  const toml = fs.readFileSync(TOML, 'utf8');
  const actual = (toml.match(/script-src [^;]*/) || [])[0];
  const nuevo = scriptSrc();
  if (process.argv.includes('--check')) {
    if (actual !== nuevo) { process.stderr.write(`CSP desactualizada.\nEsperado: ${nuevo}\nActual:   ${actual}\n`); process.exit(1); }
    process.stdout.write('CSP al día\n');
  } else {
    fs.writeFileSync(TOML, toml.replace(/script-src [^;]*/, nuevo));
    process.stdout.write(`${nuevo}\n`);
  }
}

module.exports = { scriptSrc };
