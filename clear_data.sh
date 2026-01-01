#!/bin/bash

# Script to clear all data from Plans and Subjects tables
# Usage: ./clear_data.sh

echo "🗑️  Clearing Plans and Subjects data..."
echo ""

# Get all plan IDs and delete them
echo "📋 Deleting Plans..."
curl -s http://localhost:3000/api/plans | jq -r '.data[]?.id // empty' | while read id; do
    if [ ! -z "$id" ]; then
        echo "  - Deleting plan ID: $id"
        curl -s -X DELETE "http://localhost:3000/api/plans/$id" > /dev/null
    fi
done

# Get all subject IDs and delete them
echo ""
echo "📚 Deleting Subjects..."
curl -s http://localhost:3000/api/subjects | jq -r '.data[]?.id // empty' | while read id; do
    if [ ! -z "$id" ]; then
        echo "  - Deleting subject ID: $id"
        curl -s -X DELETE "http://localhost:3000/api/subjects/$id" > /dev/null
    fi
done

echo ""
echo "✅ Done! Checking remaining data..."
echo ""

# Check remaining data
plans_count=$(curl -s http://localhost:3000/api/plans | jq '.total')
subjects_count=$(curl -s http://localhost:3000/api/subjects | jq '.total')

echo "📊 Results:"
echo "  - Plans remaining: $plans_count"
echo "  - Subjects remaining: $subjects_count"
echo ""

if [ "$plans_count" -eq 0 ] && [ "$subjects_count" -eq 0 ]; then
    echo "🎉 All data cleared successfully!"
else
    echo "⚠️  Some data still remains. You may need to run this script again."
fi
