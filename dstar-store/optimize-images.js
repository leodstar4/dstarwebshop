/**
 * DSTAR — Optimizador de imágenes
 * Convierte todos los PNG/JPG/JPEG a WebP comprimido
 * Uso: node optimize-images.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const FOLDERS = [
  { dir: 'images/products', quality: 85 },
  { dir: 'images/lookbook', quality: 80 },
  { dir: 'images/blog',     quality: 80 },
];

const EXTRA_FILES = [
  { file: 'images/logo.png',              quality: 90 },
  { file: 'images/logo-transparent.png',  quality: 90 },
  { file: 'images/backwebpc.png',         quality: 75 },
  { file: 'images/backcelular.jpeg',      quality: 75 },
];

// Tamaño máximo por categoría (px de ancho)
const MAX_WIDTH = {
  'images/products': 800,
  'images/lookbook': 1000,
  'images/blog':     900,
  'images':          1200,
};

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function optimizeFile(inputPath, quality, maxWidth) {
  const ext = path.extname(inputPath).toLowerCase();
  if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) return;

  const outputPath = inputPath.replace(/\.(png|jpg|jpeg|webp)$/i, '.webp');
  const beforeSize = fs.statSync(inputPath).size;

  try {
    let pipeline = sharp(inputPath).resize({ width: maxWidth, withoutEnlargement: true });

    // Mantener transparencia si es PNG
    if (ext === '.png') {
      pipeline = pipeline.webp({ quality, alphaQuality: 90, lossless: false });
    } else {
      pipeline = pipeline.webp({ quality });
    }

    await pipeline.toFile(outputPath);

    const afterSize = fs.statSync(outputPath).size;
    const saving = (((beforeSize - afterSize) / beforeSize) * 100).toFixed(0);
    const name = path.basename(inputPath);

    console.log(`  ✓ ${name}`);
    console.log(`    ${formatBytes(beforeSize)} → ${formatBytes(afterSize)}  (${saving}% menos)\n`);

  } catch (err) {
    console.error(`  ✗ Error en ${inputPath}: ${err.message}`);
  }
}

async function run() {
  console.log('=== DSTAR Image Optimizer ===\n');

  // Carpetas
  for (const { dir, quality } of FOLDERS) {
    const absDir = path.join(__dirname, dir);
    if (!fs.existsSync(absDir)) continue;

    const files = fs.readdirSync(absDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
    if (files.length === 0) continue;

    console.log(`📁 ${dir}/`);
    const maxW = MAX_WIDTH[dir] || 1200;

    for (const file of files) {
      await optimizeFile(path.join(absDir, file), quality, maxW);
    }
  }

  // Archivos sueltos
  console.log('📁 images/ (raíz)');
  for (const { file, quality } of EXTRA_FILES) {
    const absPath = path.join(__dirname, file);
    if (!fs.existsSync(absPath)) continue;
    await optimizeFile(absPath, quality, MAX_WIDTH['images']);
  }

  console.log('\n✅ Listo. Ahora actualiza las rutas en app.js de .png/.jpg → .webp');
  console.log('   Puedes borrar los archivos .png/.jpg originales cuando todo funcione.\n');
}

run();
