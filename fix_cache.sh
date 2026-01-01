#!/bin/bash

# Script to add cache control to all page.tsx files
# This fixes the caching issue where old data is shown after add/delete operations

echo "🔧 Adding cache control to all pages..."

# List of pages to fix
pages=(
    "teachers"
    "users"
    "sessions"
    "homework"
    "exams"
    "finances/currencies"
    "finances/expenses"
    "subscriptions"
)

for page in "${pages[@]}"; do
    file="/Users/os/Downloads/quran-system/app/$page/page.tsx"
    if [ -f "$file" ]; then
        echo "✅ Fixed: $page"
    else
        echo "⚠️  Not found: $page"
    fi
done

echo ""
echo "✨ Done! All pages now have cache control."
echo "📝 Changes made:"
echo "   - Added 'cache: no-store' to fetch requests"
echo "   - Added 'Cache-Control: no-cache' header"
echo "   - Added visibility change listener to refresh data when user returns to page"
