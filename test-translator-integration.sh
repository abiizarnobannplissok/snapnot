#!/bin/bash

echo "=================================================="
echo "Translator Redesign Integration Validation Tests"
echo "=================================================="
echo ""

# Test 1: Component files exist
echo "TEST 1: Checking component imports..."
components=(
  "components/translator/SegmentedControl.tsx"
  "components/translator/ApiKeyManager.tsx"
  "components/translator/TextTranslation.tsx"
  "components/translator/DocumentTranslation.tsx"
  "components/Translator.tsx"
  "constants/translatorColors.ts"
  "services/deepLService.ts"
)

all_exist=true
for comp in "${components[@]}"; do
  if [ -f "$comp" ]; then
    echo "  ✓ $comp"
  else
    echo "  ✗ $comp"
    all_exist=false
  fi
done

[ "$all_exist" = true ] && echo "✅ TEST 1 PASSED" || { echo "❌ TEST 1 FAILED"; exit 1; }
echo ""

# Test 2: Color constants
echo "TEST 2: Checking color constants..."
colors=("brightRed" "deepRed" "warmGray" "successGreen" "dark" "gray")

all_present=true
for color in "${colors[@]}"; do
  if grep -q "$color" constants/translatorColors.ts; then
    echo "  ✓ $color"
  else
    echo "  ✗ $color"
    all_present=false
  fi
done

[ "$all_present" = true ] && echo "✅ TEST 2 PASSED" || { echo "❌ TEST 2 FAILED"; exit 1; }
echo ""

# Test 3: Service methods
echo "TEST 3: Checking deepLService methods..."
methods=("translateText" "validateApiKey" "uploadDocument" "checkDocumentStatus" "downloadDocument")

all_present=true
for method in "${methods[@]}"; do
  if grep -q "$method" services/deepLService.ts; then
    echo "  ✓ $method"
  else
    echo "  ✗ $method"
    all_present=false
  fi
done

[ "$all_present" = true ] && echo "✅ TEST 3 PASSED" || { echo "❌ TEST 3 FAILED"; exit 1; }
echo ""

# Test 4: Translator integration
echo "TEST 4: Checking Translator.tsx integration..."
imports=("SegmentedControl" "ApiKeyManager" "TextTranslation" "DocumentTranslation" "translatorColors")

all_imported=true
for imp in "${imports[@]}"; do
  if grep -q "$imp" components/Translator.tsx; then
    echo "  ✓ $imp"
  else
    echo "  ✗ $imp"
    all_imported=false
  fi
done

[ "$all_imported" = true ] && echo "✅ TEST 4 PASSED" || { echo "❌ TEST 4 FAILED"; exit 1; }
echo ""

# Test 5: API keys
echo "TEST 5: Checking shared API keys..."
keys=(
  "f381117b-94e6-4574-ad84-bad48a5b63ed:fx"
  "2bc8a00a-3238-42d3-a569-490a3dcb31ae:fx"
  "bf66784d-823d-4503-87de-be73bf3e6657:fx"
)
names=("Abii" "Valda" "Azzahra")

all_present=true
for i in {0..2}; do
  if grep -q "${keys[$i]}" components/translator/ApiKeyManager.tsx; then
    echo "  ✓ ${names[$i]}"
  else
    echo "  ✗ ${names[$i]}"
    all_present=false
  fi
done

[ "$all_present" = true ] && echo "✅ TEST 5 PASSED" || { echo "❌ TEST 5 FAILED"; exit 1; }
echo ""

# Test 6: Worker URLs
echo "TEST 6: Checking Cloudflare Worker URLs..."
if grep -q "translate-proxy.yumtive.workers.dev" services/deepLService.ts && \
   grep -q "translate-dokumen-proxy.yumtive.workers.dev" services/deepLService.ts; then
  echo "  ✓ Text translation worker"
  echo "  ✓ Document translation worker"
  echo "✅ TEST 6 PASSED"
else
  echo "❌ TEST 6 FAILED"
  exit 1
fi
echo ""

echo "═══════════════════════════════════════════════════"
echo "✅ ALL INTEGRATION TESTS PASSED (6/6)"
echo "═══════════════════════════════════════════════════"
echo ""
echo "✓ All components created and integrated"
echo "✓ Color system configured"
echo "✓ DeepL service methods implemented"
echo "✓ 3 shared API keys configured"
echo "✓ Cloudflare Workers integrated"
echo ""

exit 0
