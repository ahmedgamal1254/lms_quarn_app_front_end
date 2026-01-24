const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../components/LandingPage');

const files = [
  'AboutSection.tsx',
  'ContactSection.tsx',
  'FeaturesSection.tsx',
  'Footer.tsx',
  'HeroSection.tsx',
  'LandingHeader.tsx',
  'PricingSection.tsx',
  'TeachersSection.tsx'
];

files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove dark: classes from className strings
    // This regex matches dark:xxx-xxx patterns
    content = content.replace(/\s*dark:[a-zA-Z0-9\-\/\[\]]+/g, '');
    
    // Clean up multiple spaces
    content = content.replace(/className="([^"]*)"/g, (match, classes) => {
      const cleaned = classes.replace(/\s+/g, ' ').trim();
      return `className="${cleaned}"`;
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Processed ${file}`);
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
});

console.log('\n✅ All landing page components updated to light mode only!');
