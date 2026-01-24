const fs = require('fs');
const path = require('path');

// Dark mode replacement patterns
const patterns = [
  // Backgrounds
  { from: /className="([^"]*)\bbg-white\b([^"]*)"/g, to: 'className="$1bg-white dark:bg-slate-800$2"' },
  { from: /className="([^"]*)\bbg-gray-50\b([^"]*)"/g, to: 'className="$1bg-gray-50 dark:bg-slate-900$2"' },
  { from: /className="([^"]*)\bbg-gray-100\b([^"]*)"/g, to: 'className="$1bg-gray-100 dark:bg-slate-800$2"' },
  
  // Gradients
  { from: /className="([^"]*)\bbg-gradient-to-br from-blue-50 to-indigo-50\b([^"]*)"/g, to: 'className="$1bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800$2"' },
  { from: /className="([^"]*)\bbg-gradient-to-br from-blue-50 via-white to-indigo-50\b([^"]*)"/g, to: 'className="$1bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800$2"' },
  
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
  
  // Colored backgrounds
  { from: /className="([^"]*)\bbg-blue-50\b([^"]*)"/g, to: 'className="$1bg-blue-50 dark:bg-blue-900\/20$2"' },
  { from: /className="([^"]*)\bbg-blue-100\b([^"]*)"/g, to: 'className="$1bg-blue-100 dark:bg-blue-900\/30$2"' },
  { from: /className="([^"]*)\bbg-green-50\b([^"]*)"/g, to: 'className="$1bg-green-50 dark:bg-green-900\/20$2"' },
  { from: /className="([^"]*)\bbg-red-50\b([^"]*)"/g, to: 'className="$1bg-red-50 dark:bg-red-900\/20$2"' },
  { from: /className="([^"]*)\bbg-yellow-50\b([^"]*)"/g, to: 'className="$1bg-yellow-50 dark:bg-yellow-900\/20$2"' },
  { from: /className="([^"]*)\bbg-purple-50\b([^"]*)"/g, to: 'className="$1bg-purple-50 dark:bg-purple-900\/20$2"' },
  { from: /className="([^"]*)\bbg-pink-50\b([^"]*)"/g, to: 'className="$1bg-pink-50 dark:bg-pink-900\/20$2"' },
  { from: /className="([^"]*)\bbg-indigo-50\b([^"]*)"/g, to: 'className="$1bg-indigo-50 dark:bg-indigo-900\/20$2"' },
  { from: /className="([^"]*)\bbg-orange-50\b([^"]*)"/g, to: 'className="$1bg-orange-50 dark:bg-orange-900\/20$2"' },
  { from: /className="([^"]*)\bbg-orange-100\b([^"]*)"/g, to: 'className="$1bg-orange-100 dark:bg-orange-900\/30$2"' },
  { from: /className="([^"]*)\bbg-emerald-50\b([^"]*)"/g, to: 'className="$1bg-emerald-50 dark:bg-emerald-900\/20$2"' },
  { from: /className="([^"]*)\bbg-amber-50\b([^"]*)"/g, to: 'className="$1bg-amber-50 dark:bg-amber-900\/20$2"' },
  { from: /className="([^"]*)\bbg-amber-100\b([^"]*)"/g, to: 'className="$1bg-amber-100 dark:bg-amber-900\/30$2"' },
];

// Student, Teacher, Parent pages
const pages = [
  // Student pages
  'd:/react/quaran_system_lms/app/[locale]/student/dashboard/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/student/sessions/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/student/homework/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/student/exams/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/student/profile/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/student/chat/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/student/chat/[id]/page.tsx',
  
  // Teacher pages
  'd:/react/quaran_system_lms/app/[locale]/teacher/dashboard/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/teacher/sessions/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/teacher/sessions/[id]/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/teacher/homework/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/teacher/exams/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/teacher/profile/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/teacher/students/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/teacher/chat/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/teacher/chat/[id]/page.tsx',
  
  // Parent pages
  'd:/react/quaran_system_lms/app/[locale]/parent/dashboard/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/parent/children/[id]/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/parent-dashboard/page.tsx',
  
  // Other pages
  'd:/react/quaran_system_lms/app/[locale]/403/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(auth)/register/student/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/page.tsx',
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
    if (content.includes('dark:bg-slate')) {
      console.log(`⏭️  Skipping ${path.basename(path.dirname(filePath))}/${path.basename(filePath)} - already has dark mode`);
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
      console.log(`✅ Updated ${path.basename(path.dirname(filePath))}/${path.basename(filePath)}`);
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

console.log('🌙 Starting dark mode application to student/teacher/parent pages...\n');

let updated = 0;
let skipped = 0;
let errors = 0;
let notFound = 0;

pages.forEach(file => {
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
