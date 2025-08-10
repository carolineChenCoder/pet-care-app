const fs = require('fs');
const path = require('path');

// Create a simple SVG-based icon that can be converted to PNG
const createSVGIcon = (size, content, filename) => {
  const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2196F3;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 10}" fill="url(#grad1)" stroke="#fff" stroke-width="4"/>
  
  <!-- Pet care icon elements -->
  <g transform="translate(${size/2}, ${size/2})">
    <!-- Heart shape for care -->
    <path d="M-30,-10 C-30,-25 -15,-35 0,-25 C15,-35 30,-25 30,-10 C30,5 0,35 0,35 C0,35 -30,5 -30,-10 Z" 
          fill="white" opacity="0.9"/>
    
    <!-- Plus sign for medical -->
    <rect x="-3" y="-20" width="6" height="40" fill="white" opacity="0.7"/>
    <rect x="-20" y="-3" width="40" height="6" fill="white" opacity="0.7"/>
    
    <!-- Paw print -->
    <g transform="translate(0, 15)" opacity="0.6">
      <circle cx="0" cy="0" r="3" fill="white"/>
      <circle cx="-8" cy="-5" r="2" fill="white"/>
      <circle cx="8" cy="-5" r="2" fill="white"/>
      <circle cx="-5" cy="5" r="2" fill="white"/>
      <circle cx="5" cy="5" r="2" fill="white"/>
    </g>
  </g>
  
  <!-- App name text (for larger icons) -->
  ${size >= 512 ? `
  <text x="${size/2}" y="${size - 40}" text-anchor="middle" 
        font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white">
    Pet Care
  </text>` : ''}
</svg>`;

  fs.writeFileSync(path.join(__dirname, 'assets', filename), svg.trim());
  console.log(`Created ${filename}`);
};

// Create assets directory
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create placeholder SVG files
console.log('Creating placeholder assets...');

createSVGIcon(1024, 'Main app icon', 'icon.svg');
createSVGIcon(1024, 'Android adaptive icon', 'adaptive-icon.svg');
createSVGIcon(48, 'Web favicon', 'favicon.svg');

// Create a splash screen SVG
const splashSVG = `
<svg width="1242" height="2688" viewBox="0 0 1242 2688" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#E3F2FD;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F3E5F5;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1242" height="2688" fill="url(#bgGrad)"/>
  
  <!-- Center content -->
  <g transform="translate(621, 1344)">
    <!-- Large icon -->
    <circle cx="0" cy="-200" r="120" fill="#4CAF50" opacity="0.9"/>
    <path d="M-60,-210 C-60,-235 -30,-250 0,-235 C30,-250 60,-235 60,-210 C60,-185 0,-150 0,-150 C0,-150 -60,-185 -60,-210 Z" 
          fill="white" opacity="0.9"/>
    <rect x="-6" y="-240" width="12" height="80" fill="white" opacity="0.7"/>
    <rect x="-40" y="-206" width="80" height="12" fill="white" opacity="0.7"/>
    
    <!-- App title -->
    <text x="0" y="-50" text-anchor="middle" font-family="Arial, sans-serif" 
          font-size="48" font-weight="bold" fill="#2196F3">
      Pet Care Assistant
    </text>
    
    <!-- Subtitle -->
    <text x="0" y="20" text-anchor="middle" font-family="Arial, sans-serif" 
          font-size="24" fill="#666">
      AI-Powered Pet Health Companion
    </text>
    
    <!-- Loading indicator -->
    <g transform="translate(0, 150)">
      <circle cx="-30" cy="0" r="8" fill="#4CAF50">
        <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" begin="0s"/>
      </circle>
      <circle cx="0" cy="0" r="8" fill="#4CAF50">
        <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" begin="0.33s"/>
      </circle>
      <circle cx="30" cy="0" r="8" fill="#4CAF50">
        <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" begin="0.66s"/>
      </circle>
    </g>
  </g>
</svg>`;

fs.writeFileSync(path.join(assetsDir, 'splash.svg'), splashSVG.trim());
console.log('Created splash.svg');

console.log('\n✅ Placeholder assets created!');
console.log('\n📝 Next steps:');
console.log('1. Install ImageMagick or use online converter to create PNG files:');
console.log('   - Convert assets/icon.svg → assets/icon.png (1024x1024)');
console.log('   - Convert assets/adaptive-icon.svg → assets/adaptive-icon.png (1024x1024)');
console.log('   - Convert assets/splash.svg → assets/splash.png (1242x2688)');
console.log('   - Convert assets/favicon.svg → assets/favicon.png (48x48)');
console.log('\n2. Online converters you can use:');
console.log('   - https://convertio.co/svg-png/');
console.log('   - https://cloudconvert.com/svg-to-png');
console.log('   - https://svgtopng.com/');
console.log('\n3. Or use command line (if ImageMagick installed):');
console.log('   convert assets/icon.svg -background transparent assets/icon.png');