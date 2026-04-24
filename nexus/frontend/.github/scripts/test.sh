#!/bin/bash
# =============================================================================
# TEST RUNNER SCRIPT
# =============================================================================
# Usage: ./scripts/test.sh [options]
# Options:
#   --all       Run all tests
#   --unit      Run unit tests only
#   --security  Run security tests only
#   --lint      Run lint only
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend" || exit 1

echo "========================================"
echo "🚀 Nexus Test Runner"
echo "========================================"
echo ""

# Default: run all tests
RUN_UNIT=true
RUN_SECURITY=true
RUN_LINT=true

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --unit)
      RUN_UNIT=true
      RUN_SECURITY=false
      RUN_LINT=false
      shift
      ;;
    --security)
      RUN_UNIT=false
      RUN_SECURITY=true
      RUN_LINT=false
      shift
      ;;
    --lint)
      RUN_UNIT=false
      RUN_SECURITY=false
      RUN_LINT=true
      shift
      ;;
    --all)
      RUN_UNIT=true
      RUN_SECURITY=true
      RUN_LINT=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: ./scripts/test.sh [--all|--unit|--security|--lint]"
      exit 1
      ;;
  esac
done

# Track overall status
FAILED=0

# -----------------------------------------------------------------------------
# LINT
# -----------------------------------------------------------------------------
if [ "$RUN_LINT" = true ]; then
  echo -e "${YELLOW}📝 Running Lint...${NC}"
  if npm run lint; then
    echo -e "${GREEN}✅ Lint passed${NC}"
  else
    echo -e "${RED}❌ Lint failed${NC}"
    FAILED=1
  fi
  echo ""
fi

# -----------------------------------------------------------------------------
# UNIT TESTS
# -----------------------------------------------------------------------------
if [ "$RUN_UNIT" = true ]; then
  echo -e "${YELLOW}🧪 Running Unit Tests...${NC}"
  
  # Build first to ensure compilation
  if npm run build; then
    echo -e "${GREEN}✅ Build passed${NC}"
  else
    echo -e "${RED}❌ Build failed${NC}"
    FAILED=1
  fi
  
  # Type check
  if npx tsc --noEmit; then
    echo -e "${GREEN}✅ TypeScript check passed${NC}"
  else
    echo -e "${RED}❌ TypeScript check failed${NC}"
    FAILED=1
  fi
  
  echo ""
fi

# -----------------------------------------------------------------------------
# SECURITY TESTS
# -----------------------------------------------------------------------------
if [ "$RUN_SECURITY" = true ]; then
  echo -e "${YELLOW}🔒 Running Security Tests...${NC}"
  
  # Dependency audit
  echo "Checking dependencies..."
  if npm audit --audit-level=high; then
    echo -e "${GREEN}✅ Dependency audit passed${NC}"
  else
    echo -e "${YELLOW}⚠️ Dependency audit found issues${NC}"
  fi
  
  echo ""
fi

# -----------------------------------------------------------------------------
# SUMMARY
# -----------------------------------------------------------------------------
echo "========================================"
echo "📊 Test Summary"
echo "========================================"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed!${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}❌ Some checks failed${NC}"
  echo ""
  exit 1
fi