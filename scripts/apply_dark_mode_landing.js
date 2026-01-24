const fs = require('fs');
const path = require('path');

// Dark mode replacement patterns
const patterns = [
  // Backgrounds
  { from: /className="([^"]*)\bbg-white\b([^"]*)"/g, to: 'className="$1bg-white dark:bg-slate-800$2"' },
  { from: /className="([^"]*)\bbg-gray-50\b([^"]*)"/g, to: 'className="$1bg-gray-50 dark:bg-slate-900$2"' },
  { from: /className="([^"]*)\bbg-gray-100\b([^"]*)"/g, to: 'className="$1bg-gray-100 dark:bg-slate-800$2"' },
  
  // Text colors
  { from: /className="([^"]*)\btext-gray-900\b([^"]*)"/g, to: 'className="$1text-gray-900 dark:text-gray-100$2"' },
  { from: /className="([^"]*)\btext-gray-800\b([^"]*)"/g, to: 'className="$1text-gray-800 dark:text-gray-100$2"' },
  { from: /className="([^"]*)\btext-gray-700\b([^"]*)"/g, to: 'className="$1text-gray-700 dark:text-gray-300$2"' },
  { from: /className="([^"]*)\btext-gray-600\b([^"]*)"/g, to: 'className="$1text-gray-600 dark:text-gray-400$2"' },
  { from: /className="([^"]*)\btext-gray-500\b([^"]*)"/g, to: 'className="$1text-gray-500 dark:text-gray-400$2"' },
  
  // Borders
  { from: /className="([^"]*)\bborder-gray-200\b([^"]*)"/g, to: 'className="$1border-gray-200 dark:border-gray-700$2"' },
  { from: /className="([^"]*)\bborder-gray-300\b([^"]*)"/g, to: 'className="$1border-gray-300 dark:border-gray-600$2"' },
  { from: /className="([^"]*)\bborder-gray-100\b([^"]*)"/g, to: 'className="$1border-gray-100 dark:border-gray-700$2"' },
];

// Landing page components
const components = [
  'd:/react/quaran_system_lms/components/LandingPage/LandingHeader.tsx',
  'd:/react/quaran_system_lms/components/LandingPage/HeroSection.tsx',
  'd:/react/quaran_system_lms/components/LandingPage/AboutSection.tsx',
  'd:/react/quaran_system_lms/components/LandingPage/PricingSection.tsx',
  'd:/react/quaran_system_lms/components/LandingPage/TeachersSection.tsx',
  'd:/react/quaran_system_lms/components/LandingPage/ContactSection.tsx',
  'd:/react/quaran_system_lms/components/LandingPage/Footer.tsx',
  'd:/react/quaran_system_lms/components/LandingPage/FeaturesSection.tsx',
];

function applyDarkMode(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${path.basename(filePath)}`);
      return null;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Skip if already has dark: classes
    if (content.includes('dark:bg-slate') || content.includes('dark:text-gray')) {
      console.log(`⏭️  Skipping ${path.basename(filePath)} - already has dark mode`);
      return false;
    }
    
    patterns.forEach(pattern => {
      const newContent = content.replace(pattern.from, pattern.to);
      if (newContent !== content) {
        modified = true;
        content = newContent;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`⚠️  No changes needed for ${path.basename(filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return null;
  }
}

console.log('🌙 Starting dark mode application to landing page components...\n');

let updated = 0;
let skipped = 0;
let errors = 0;
let notFound = 0;

components.forEach(file => {
  const result = applyDarkMode(file);
  if (result === true) updated++;
  else if (result === false) skipped++;
  else if (result === null) notFound++;
  else errors++;
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updated}`);
console.log(`   ⏭️  Skipped: ${skipped}`);
console.log(`   ⚠️  Not found: ${notFound}`);
console.log(`   ❌ Errors: ${errors}`);
console.log(`\n🎉 Dark mode application complete!`);
