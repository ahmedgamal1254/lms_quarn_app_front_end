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
  
  // Colored backgrounds (for info cards)
  { from: /className="([^"]*)\bbg-blue-50\b([^"]*)"/g, to: 'className="$1bg-blue-50 dark:bg-blue-900\/20$2"' },
  { from: /className="([^"]*)\bbg-green-50\b([^"]*)"/g, to: 'className="$1bg-green-50 dark:bg-green-900\/20$2"' },
  { from: /className="([^"]*)\bbg-red-50\b([^"]*)"/g, to: 'className="$1bg-red-50 dark:bg-red-900\/20$2"' },
  { from: /className="([^"]*)\bbg-yellow-50\b([^"]*)"/g, to: 'className="$1bg-yellow-50 dark:bg-yellow-900\/20$2"' },
  { from: /className="([^"]*)\bbg-purple-50\b([^"]*)"/g, to: 'className="$1bg-purple-50 dark:bg-purple-900\/20$2"' },
  { from: /className="([^"]*)\bbg-pink-50\b([^"]*)"/g, to: 'className="$1bg-pink-50 dark:bg-pink-900\/20$2"' },
  { from: /className="([^"]*)\bbg-indigo-50\b([^"]*)"/g, to: 'className="$1bg-indigo-50 dark:bg-indigo-900\/20$2"' },
  { from: /className="([^"]*)\bbg-orange-50\b([^"]*)"/g, to: 'className="$1bg-orange-50 dark:bg-orange-900\/20$2"' },
  { from: /className="([^"]*)\bbg-emerald-50\b([^"]*)"/g, to: 'className="$1bg-emerald-50 dark:bg-emerald-900\/20$2"' },
];

// Files to process
const adminPages = [
  'd:/react/quaran_system_lms/app/[locale]/(admin)/(education)/exams/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/(education)/homework/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/(education)/sessions/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/(education)/sessions/callender/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/(settings)/settings/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/(settings)/subjects/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/(subscriptions)/subscriptions/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/(subscriptions)/subscription-requests/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/(subscriptions)/plans/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/(subscriptions)/active-subscriptions/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/(subscriptions)/pending-approval/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/(users)/users/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/(users)/students/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/(users)/students/[id]/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/(users)/teachers/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/(users)/teachers/[id]/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/(users)/parent/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/finances/currencies/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/finances/expenses/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/finances/transactions/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/orders/deposit/page.tsx',
  'd:/react/quaran_system_lms/app/[locale]/(admin)/orders/withdraw/page.tsx',
];

function applyDarkMode(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Skip if already has dark: classes
    if (content.includes('dark:bg-slate')) {
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
    return false;
  }
}

console.log('🌙 Starting dark mode application to admin pages...\n');

let updated = 0;
let skipped = 0;
let errors = 0;

adminPages.forEach(file => {
  const result = applyDarkMode(file);
  if (result === true) updated++;
  else if (result === false) skipped++;
  else errors++;
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updated}`);
console.log(`   ⏭️  Skipped: ${skipped}`);
console.log(`   ❌ Errors: ${errors}`);
console.log(`\n🎉 Dark mode application complete!`);
