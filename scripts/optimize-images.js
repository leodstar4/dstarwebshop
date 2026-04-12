/**
 * DSTAR — Script de optimización de imágenes con Sharp
 *
 * Convierte PNG / JPG / TIFF / WebP → WebP optimizado
 * Genera versión MAIN (1200×1500) + THUMB (400×500) por imagen de producto
 *
 * USO:
 *   node scripts/optimize-images.js
 *
 * NOTA: Los archivos .CR3 (RAW de Canon) NO son compatibles con Sharp.
 *       Expórtalos primero desde Lightroom / Camera Raw / RawTherapee
 *       a TIFF o JPG y colócalos en la carpeta de origen correspondiente.
 */

const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

// ─────────────────────────────────────────────
// CONFIGURACIÓN DE TAMAÑOS (tabla DSTAR)
// ─────────────────────────────────────────────
const SIZES = {
  main: {
    width:   1200,
    height:  1500,
    quality: 84,
    effort:  6,
    suffix:  '',
    targetKB: 150
  },
  thumb: {
    width:   400,
    height:  500,
    quality: 82,
    effort:  6,
    suffix:  '-thumb',
    targetKB: 40
  }
};

const BASE = path.resolve(__dirname, '../dstar-store/images/products');

// ─────────────────────────────────────────────
// MAPEO: src (relativo a BASE) → dest (relativo a BASE) + name
// ─────────────────────────────────────────────
const IMAGES = [

  // ── DROP 01 — BORN TO SHINE ──────────────────────────────
  // born-to-shine (born-to-shine-1 ya existe)
  { src: 'drop-01-born-to-shine/born-to-shine/borntoshine1.png',  dest: 'drop-01-born-to-shine/born-to-shine', name: 'born-to-shine-2' },
  { src: 'drop-01-born-to-shine/born-to-shine/borntoshine3.png',  dest: 'drop-01-born-to-shine/born-to-shine', name: 'born-to-shine-3' },
  { src: 'drop-01-born-to-shine/born-to-shine/brn1.png',          dest: 'drop-01-born-to-shine/born-to-shine', name: 'born-to-shine-4' },

  // over-as-fk (over-as-fk-1 ya existe)
  { src: 'drop-01-born-to-shine/over-as-fk/overas1.png', dest: 'drop-01-born-to-shine/over-as-fk', name: 'over-as-fk-2' },
  { src: 'drop-01-born-to-shine/over-as-fk/overas2.png', dest: 'drop-01-born-to-shine/over-as-fk', name: 'over-as-fk-3' },

  // ── DROP 02 — EL ANIMAL PRINT NUNCA MUERE ────────────────
  // under-my-skin
  { src: 'drop-02-animal-print/under-my-skin/undermyskin1.png', dest: 'drop-02-animal-print/under-my-skin', name: 'under-my-skin-1' },
  { src: 'drop-02-animal-print/under-my-skin/undermyskin2.png', dest: 'drop-02-animal-print/under-my-skin', name: 'under-my-skin-2' },
  { src: 'drop-02-animal-print/under-my-skin/undermyskin3.png', dest: 'drop-02-animal-print/under-my-skin', name: 'under-my-skin-3' },
  { src: 'drop-02-animal-print/under-my-skin/undermyskin4.png', dest: 'drop-02-animal-print/under-my-skin', name: 'under-my-skin-4' },
  { src: 'drop-02-animal-print/under-my-skin/undermyskin5.png', dest: 'drop-02-animal-print/under-my-skin', name: 'under-my-skin-5' },
  { src: 'drop-02-animal-print/under-my-skin/undermyskin6.png', dest: 'drop-02-animal-print/under-my-skin', name: 'under-my-skin-6' },

  // be-a-depredator
  { src: 'drop-02-animal-print/be-a-depredator/beadepredator1.png', dest: 'drop-02-animal-print/be-a-depredator', name: 'be-a-depredator-1' },
  { src: 'drop-02-animal-print/be-a-depredator/beadepredator2.png', dest: 'drop-02-animal-print/be-a-depredator', name: 'be-a-depredator-2' },
  { src: 'drop-02-animal-print/be-a-depredator/beadepredator3.png', dest: 'drop-02-animal-print/be-a-depredator', name: 'be-a-depredator-3' },
  { src: 'drop-02-animal-print/be-a-depredator/beadepredator4.png', dest: 'drop-02-animal-print/be-a-depredator', name: 'be-a-depredator-4' },
  { src: 'drop-02-animal-print/be-a-depredator/beadepredator5.png', dest: 'drop-02-animal-print/be-a-depredator', name: 'be-a-depredator-5' },
  { src: 'drop-02-animal-print/be-a-depredator/beadepredator6.png', dest: 'drop-02-animal-print/be-a-depredator', name: 'be-a-depredator-6' },

  // bendecido
  { src: 'drop-02-animal-print/bendecido/bendecido1.png', dest: 'drop-02-animal-print/bendecido', name: 'bendecido-1' },
  { src: 'drop-02-animal-print/bendecido/bendecido2.png', dest: 'drop-02-animal-print/bendecido', name: 'bendecido-2' },

];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const SUPPORTED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.webp']);

function fileSizeKB(filePath) {
  return (fs.statSync(filePath).size / 1024).toFixed(1);
}

function checkSizeTarget(filePath, targetKB, label) {
  const sizeKB = parseFloat(fileSizeKB(filePath));
  const ok = sizeKB <= targetKB;
  const icon = ok ? '✓' : '⚠';
  const note = ok ? '' : ` (objetivo: <${targetKB}KB)`;
  console.log(`     ${icon} ${label}: ${sizeKB}KB${note}`);
}

// ─────────────────────────────────────────────
// PROCESAMIENTO
// ─────────────────────────────────────────────
async function processImage(entry) {
  const srcPath = path.join(BASE, entry.src);
  const ext = path.extname(entry.src).toLowerCase();

  if (!fs.existsSync(srcPath)) {
    console.warn(`  ⏭  OMITIDO (no existe): ${entry.src}`);
    return false;
  }

  if (!SUPPORTED_EXTS.has(ext)) {
    console.warn(`  ✗  Formato no soportado: ${entry.src}`);
    return false;
  }

  const destDir = path.join(BASE, entry.dest);
  fs.mkdirSync(destDir, { recursive: true });

  console.log(`\n  📷 ${entry.src.split('/').pop()} → ${entry.dest}/`);

  for (const [type, cfg] of Object.entries(SIZES)) {
    const outName = `${entry.name}${cfg.suffix}.webp`;
    const outPath = path.join(destDir, outName);

    let quality = cfg.quality;
    let attempts = 0;

    while (attempts < 6) {
      await sharp(srcPath)
        .resize(cfg.width, cfg.height, {
          fit: 'cover',
          position: 'centre',
          withoutEnlargement: false
        })
        .webp({ quality, effort: cfg.effort, lossless: false })
        .toFile(outPath);

      const sizeKB = fs.statSync(outPath).size / 1024;
      if (sizeKB <= cfg.targetKB || quality <= 60) break;
      quality -= 4;
      attempts++;
    }

    checkSizeTarget(outPath, cfg.targetKB, `${type.padEnd(5)} → ${outName} (q${quality})`);
  }

  return true;
}

async function run() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('   DSTAR — Optimización de imágenes');
  console.log('═══════════════════════════════════════════════');

  let ok = 0, skip = 0;

  for (const entry of IMAGES) {
    const processed = await processImage(entry);
    processed ? ok++ : skip++;
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log(`  ✓ ${ok} imágenes procesadas, ${skip} omitidas`);
  console.log('═══════════════════════════════════════════════');

  console.log('\n  Estructura generada:');
  console.log('  images/products/');
  console.log('    drop-01-born-to-shine/');
  console.log('      born-to-shine/    → born-to-shine-{1-4}.webp + thumbs');
  console.log('      over-as-fk/       → over-as-fk-{1-3}.webp + thumbs');
  console.log('    drop-02-animal-print/');
  console.log('      under-my-skin/    → under-my-skin-{1-6}.webp + thumbs');
  console.log('      be-a-depredator/  → be-a-depredator-{1-6}.webp + thumbs');
  console.log('      bendecido/        → bendecido-{1-2}.webp + thumbs');
  console.log('\n  Recuerda actualizar las rutas en dstar-store/js/app.js\n');
}

run().catch(err => {
  console.error('\n✗ Error:', err.message);
  process.exit(1);
});
