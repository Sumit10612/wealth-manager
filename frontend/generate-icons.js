// Script to generate PWA icons using Sharp (no native compilation needed)
// Run with: node generate-icons.js

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create SVG icon
const svgIcon = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#2563eb"/>
  <text x="256" y="256" font-size="280" font-weight="bold" fill="white" text-anchor="middle" dy=".35em" font-family="Arial">W</text>
</svg>`;

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate icons
Promise.all([192, 512].map(size =>
  sharp(Buffer.from(svgIcon))
    .resize(size, size)
    .png()
    .toFile(path.join(publicDir, `icon-${size}.png`))
    .then(() => console.log(`Generated icon-${size}.png`))
))
.then(() => console.log('Icons generated successfully!'))
.catch(err => { console.error('Error:', err); process.exit(1); });
