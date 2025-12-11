#!/bin/bash

# Script to update all import paths in sca-dashboard components
# Run this from the sca-dashboard directory

echo "Updating import paths..."

# Function to update imports in a file
update_file() {
  local file="$1"
  
  # Update @sca/ui imports
  sed -i '' \
    -e 's|from "@sca/ui"|from "../../ui"|g' \
    -e 's|from "@sca/ui/icons"|from "../../ui/icons"|g' \
    -e 's|from "@sca/ui/\([^"]*\)"|from "../../ui/\1"|g' \
    "$file"
  
  # Update @sca/utils imports
  sed -i '' \
    -e 's|from "@sca/utils"|from "../../utils"|g' \
    -e 's|from "@sca/utils/\([^"]*\)"|from "../../utils/\1"|g' \
    "$file"
  
  # Update @/ui imports
  sed -i '' \
    -e 's|from "@/ui/\([^"]*\)"|from "../../ui/\1"|g' \
    -e 's|from "@/ui"|from "../../ui"|g' \
    "$file"
  
  # Update @/lib imports
  sed -i '' \
    -e 's|from "@/lib/plan-capabilities"|from "../../../plan-capabilities"|g' \
    -e 's|from "@/lib/\([^"]*\)"|from "../../../\1"|g' \
    "$file"
}

# Update files in components/ui (relative to ui folder)
find components/ui -type f \( -name "*.tsx" -o -name "*.ts" \) | while read file; do
  # For ui folder files, adjust paths
  sed -i '' \
    -e 's|from "@sca/ui"|from "."|g' \
    -e 's|from "@sca/ui/icons"|from "./icons"|g' \
    -e 's|from "@sca/ui/\([^"]*\)"|from "./\1"|g' \
    -e 's|from "@sca/utils"|from "../../utils"|g' \
    -e 's|from "@sca/utils/\([^"]*\)"|from "../../utils/\1"|g' \
    "$file"
done

# Update files in components/layout (relative to layout folder)
find components/layout -type f \( -name "*.tsx" -o -name "*.ts" \) | while read file; do
  sed -i '' \
    -e 's|from "@sca/ui"|from "../ui"|g' \
    -e 's|from "@sca/ui/icons"|from "../ui/icons"|g' \
    -e 's|from "@sca/ui/\([^"]*\)"|from "../ui/\1"|g' \
    -e 's|from "@sca/utils"|from "../../utils"|g' \
    -e 's|from "@sca/utils/\([^"]*\)"|from "../../utils/\1"|g' \
    -e 's|from "@/lib/plan-capabilities"|from "../../../plan-capabilities"|g' \
    -e 's|from "@/lib/\([^"]*\)"|from "../../../\1"|g' \
    -e 's|from "@/ui/\([^"]*\)"|from "../ui/\1"|g' \
    "$file"
done

echo "Import paths updated!"
echo ""
echo "Note: Some files may need manual review, especially:"
echo "  - Files importing hooks (should use from '../../hooks')"
echo "  - Files with complex nested imports"
echo "  - Files importing from other layout components"

