// Script to generate PWA icons using canvas
// Run with: node generate-icons.js

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(0, 0, size, size);
  
  // Draw white W letter
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(size * 0.55)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('W', size / 2, size / 2);
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  const filename = path.join(__dirname, 'public', `icon-${size}.png`);
  fs.writeFileSync(filename, buffer);
  console.log(`Generated ${filename}`);
}

// Generate icons
generateIcon(192);
generateIcon(512);
console.log('Icons generated successfully!');
