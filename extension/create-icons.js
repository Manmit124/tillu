// Simple script to create placeholder icons
// Since we can't use canvas in Node without extra dependencies,
// we'll create simple colored squares as placeholders

const fs = require('fs');
const path = require('path');

// Create a simple PNG file (1x1 blue pixel, will be scaled by browser)
// This is a minimal valid PNG file
const createSimplePNG = (size) => {
  // PNG header + IHDR + blue pixel + IEND
  const png = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x08, 0xD7, 0x63, 0x60, 0xA8, 0xBF, 0x00, // Blue pixel data
    0x00, 0x00, 0x04, 0x00, 0x01, 0x3E, 0x5D, 0x00,
    0x9C, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, // IEND chunk
    0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  return png;
};

const iconsDir = path.join(__dirname, 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create placeholder icons
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const iconPath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(iconPath, createSimplePNG(size));
  console.log(`Created ${iconPath}`);
});

console.log('\nPlaceholder icons created!');
console.log('Note: These are minimal placeholders. You can replace them with proper icons later.');

