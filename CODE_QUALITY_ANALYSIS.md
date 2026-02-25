# Code Quality Analysis Report
**Valueskins Codebase**
Date: February 10, 2026

---

## Executive Summary

This analysis covers **117 source files** across three main directories:
- **Contracts (Solidity)**: 4 core custom contracts + 1 payment contract + 1 proxy
- **Frontend (TypeScript/React)**: ~71 files in Next.js/React
- **Backend (Rust)**: ~52 files in Actix-web modular monolith

**Overall Assessment**: The codebase shows good structural organization but has several code quality issues related to DRY, KISS, SRP, and error handling. Many violations are **Medium to High severity**.

---

## DETAILED FINDINGS BY COMPONENT

---

## CONTRACTS ANALYSIS (Solidity)

### File: `/contracts/core/PersonaRegistry.sol`
**Severity**: HIGH
**Lines of Code**: 379

#### Violations Found:

1. **SRP Violation - Too Many Responsibilities** (Lines 22-28, 40-71)
   - **Severity**: HIGH
   - **Issue**: Contract manages persona lifecycle (creation, updates, activity), pricing, decay mechanics, and upkeep payments - 5+ distinct responsibilities
   - **Details**: A single contract handles:
     - User persona creation and management
     - Exponential pricing calculations
     - Decay tracking for inactive personas
     - Upkeep payment system
     - Activity recording
   - **Recommendation**: Split into separate contracts: PersonaManager, PricingEngine, DecayEngine, UpkeepManager

2. **DRY Violation - Duplicated Refund Logic** (Lines 152-156, 214-218)
   - **Severity**: MEDIUM
   - **Issue**: Refund logic repeated identically in `createPersona()` and `payUpkeep()`
   ```solidity
   // Line 152-156
   if (msg.value > price) {
       (bool success, ) = msg.sender.call{value: msg.value - price}("");
       if (!success) revert TransferFailed();
   }
   // Line 214-218 - IDENTICAL
   ```
   - **Recommendation**: Extract to internal `_refund()` function

3. **DRY Violation - Duplicated Requirement Checks** (Lines 361-365, 367-372)
   - **Severity**: MEDIUM
   - **Issue**: `_requireExists()` and `_requireOwner()` share logic
   - **Recommendation**: Consolidate validation pattern

4. **KISS Violation - Complex Decay Calculation** (Lines 306-318)
   - **Severity**: MEDIUM
   - **Issue**: Loop-based decay calculation is hard to understand and computationally expensive
   - **Details**:
     ```solidity
     for (uint256 i = 0; i < weeksInactive && remaining > 0; i++) {
         uint256 weekDecay = (remaining * decayRate) / PRECISION;
         totalDecay += weekDecay;
         remaining -= weekDecay;
     }
     ```
   - **Problem**: For 52 weeks inactivity, this loops 52 times on-chain. Complex compound calculation.
   - **Recommendation**: Use mathematical formula instead of loop, or cache decay calculations off-chain

5. **Error Handling Issue** (Line 185)
   - **Severity**: MEDIUM
   - **Issue**: `recordActivity()` has comment "In production, this would be restricted to authorized callers"
   - **Details**: Function is unrestricted, allowing anyone to call it
   - **Recommendation**: Add proper access control (onlyOracle or similar)

6. **YAGNI Violation** (Lines 58-60)
   - **Severity**: LOW
   - **Issue**: `inactivityThreshold` and `upkeepCost` parameters exist but aren't validated to meaningful bounds
   - **Recommendation**: Add bounds checking for these values

---

### File: `/contracts/core/ProfessionRegistry.sol`
**Severity**: HIGH
**Lines of Code**: 372

#### Violations Found:

1. **SRP Violation - Multiple Concerns** (Lines 23-28)
   - **Severity**: HIGH
   - **Issue**: Manages professions (CRUD), level tracking, profession merging, and payment handling
   - **Details**: Responsibilities include:
     - Profession metadata management
     - Level/score tracking for personas
     - Profession merging logic
     - Payment collection
   - **Recommendation**: Separate into ProfessionManager and LevelTracker contracts

2. **DRY Violation - Duplicated Profession Existence Checks** (Lines 141, 254, 272, 308)
   - **Severity**: MEDIUM
   - **Issue**: Pattern `_professions[professionId].id == 0` repeated 4+ times
   - **Recommendation**: Create `_requireProfessionExists()` helper function

3. **DRY Violation - Duplicated Merge Resolution** (Lines 146, 198, 307, 346, 359)
   - **Severity**: HIGH
   - **Issue**: `_resolveMerged()` logic called 5 times in different contexts
   - **Details**: Merge resolution should be transparent/automatic
   - **Recommendation**: Use inheritance/middleware pattern to auto-resolve merged professions in getter functions

4. **KISS Violation - Complex Profession Enumeration** (Lines 312-329)
   - **Severity**: MEDIUM
   - **Issue**: `getActiveProfessions()` has to iterate entire array twice
   - **Details**:
     ```solidity
     for (uint256 i = 0; i < _allProfessionIds.length; i++) {
         if (_professions[_allProfessionIds[i]].isActive) {
             activeCount++;
         }
     }
     // ... then iterate again to fill array
     ```
   - **Recommendation**: Maintain separate active professions array, or use pagination

5. **Error Handling - Weak Validation** (Line 254)
   - **Severity**: MEDIUM
   - **Issue**: `updateProfession()` doesn't validate that the profession actually exists
   - **Details**: Only checks if `id == 0`, but doesn't validate state
   - **Recommendation**: Add proper existence check function

6. **Security Issue - Missing Oracle Validation** (Line 189-211)
   - **Severity**: MEDIUM
   - **Issue**: `updateLevel()` accepts realScore but doesn't validate it's meaningful
   - **Details**: realScore can be any value 0-10000, no validation against previous scores
   - **Recommendation**: Add bounds checking and historical consistency validation

---

### File: `/contracts/nft/SkinNFT.sol`
**Severity**: HIGH
**Lines of Code**: 433

#### Violations Found:

1. **SRP Violation - Multiple Concerns** (Lines 28-34)
   - **Severity**: HIGH
   - **Issue**: Manages NFT minting, tier upgrades, metadata generation, and soul-binding mechanics
   - **Details**:
     - ERC721 implementation
     - Tier system with pricing
     - Dynamic SVG generation
     - Soulbound mechanics
     - Custom image handling
   - **Recommendation**: Extract SVG generation to separate utility contract, consider separate tier/upgrade contract

2. **DRY Violation - Duplicated Tier Price Checks** (Lines 154, 197)
   - **Severity**: MEDIUM
   - **Issue**: Price validation repeated in `mintSkin()` and `upgradeSkin()`
   - **Recommendation**: Extract `_checkPayment()` helper

3. **DRY Violation - Duplicated Refund Logic** (Lines 180-184, 206-210)
   - **Severity**: MEDIUM
   - **Issue**: Identical refund pattern in two functions
   - **Recommendation**: Extract to `_refundExcess()` helper

4. **Error Handling - Over-broad Try-Catch** (Lines 140-146)
   - **Severity**: MEDIUM
   - **Issue**: Broad try-catch masks actual errors
   - **Details**:
     ```solidity
     try professionRegistry.getPersonaProfession(...) returns (...) {
         if (!pp.exists) revert PersonaDoesNotHaveProfession(...);
     } catch {
         revert PersonaDoesNotHaveProfession(...);  // Same error for all failures
     }
     ```
   - **Recommendation**: Be more specific about what exceptions to catch

5. **KISS Violation - Complex SVG Generation** (Lines 340-395)
   - **Severity**: MEDIUM
   - **Issue**: SVG generation function is 55 lines of string concatenation
   - **Details**: Hard to maintain, understand, or test
   - **Recommendation**: Move SVG generation off-chain or use cleaner generation pattern

6. **YAGNI Violation - Unused Custom Image** (Lines 171, 221)
   - **Severity**: LOW
   - **Issue**: `customImageUri` field initialized but not used in metadata generation
   - **Details**: `tokenURI()` doesn't reference `skin.customImageUri`
   - **Recommendation**: Either use custom image in metadata or remove field

7. **Code Organization - Missing Index Handling** (Lines 175-176)
   - **Severity**: MEDIUM
   - **Issue**: Storing tokens in array without index tracking for deletion
   - **Recommendation**: Use indexed approach like PersonaRegistry for efficient removal

---

### File: `/contracts/payments/PaymentSplitter.sol`
**Severity**: MEDIUM
**Lines of Code**: 258

#### Violations Found:

1. **DRY Violation - Duplicated Balance Checks** (Lines 111, 136, 175)
   - **Severity**: MEDIUM
   - **Issue**: `if (balance == 0) revert ZeroAmount();` repeated 3 times
   - **Recommendation**: Create `_requireBalance()` modifier

2. **SRP Violation - Payee Management + Payment Distribution** (Lines 37-56)
   - **Severity**: MEDIUM
   - **Issue**: Handles both payee configuration AND payment distribution
   - **Recommendation**: Consider separate PayeeRegistry if this grows

3. **KISS Violation - Payee Clearing Pattern** (Lines 231)
   - **Severity**: LOW
   - **Issue**: Uses `delete payees;` then rebuilds array - inefficient
   - **Recommendation**: Use more efficient array update pattern

---

## FRONTEND ANALYSIS (TypeScript/React)

### File: `/frontend/src/lib/contracts.ts`
**Severity**: MEDIUM
**Lines of Code**: 416

#### Violations Found:

1. **SRP Violation - Too Many Contract Types** (Lines 108-265)
   - **Severity**: MEDIUM
   - **Issue**: Single module handles 3+ contract templates with significant differences
   - **Details**:
     - Sponsorship contracts
     - Ambassador contracts
     - Product review contracts
     - Custom contracts
   - **Recommendation**: Split into separate modules by contract type

2. **DRY Violation - Repeated Section Structure** (Lines 118-188, 200-228, 241-263)
   - **Severity**: MEDIUM
   - **Issue**: Contract template sections follow identical patterns
   - **Details**: Each template section has `id`, `title`, `content`, `required`, `order`
   - **Recommendation**: Use a factory function to generate sections

3. **DRY Violation - Repeated Payment Milestone Logic** (Lines 295-310, 361-376)
   - **Severity**: MEDIUM
   - **Issue**: Payment milestone creation duplicated in mock data vs. function
   - **Recommendation**: Centralize payment schedule generation

4. **KISS Violation - Complex Contract Generation** (Lines 282-342)
   - **Severity**: MEDIUM
   - **Issue**: `generateContract()` function has too many parameters (8) and complex logic
   - **Recommendation**: Use builder pattern or config object

5. **Type Safety Issue** (Lines 345-398)
   - **Severity**: MEDIUM
   - **Issue**: Mock data has hardcoded dates and values scattered throughout
   - **Recommendation**: Use factory functions or fixtures for test data

---

### File: `/frontend/src/lib/api.ts`
**Severity**: MEDIUM
**Lines of Code**: 493

#### Violations Found:

1. **SRP Violation - Too Many Responsibilities** (Lines 8-297)
   - **Severity**: HIGH
   - **Issue**: ApiClient class handles authentication, social, analytics, opportunities, referrals, marketplace, brands, and scoring
   - **Details**: 15+ methods for different domains
   - **Recommendation**: Split into separate API clients by domain:
     - `AuthClient`
     - `SocialClient`
     - `MarketplaceClient`
     - `ReferralClient`
     - `BrandClient`

2. **DRY Violation - Repeated Request Pattern** (Lines 67-88, 99-105, 179-200, etc.)
   - **Severity**: MEDIUM
   - **Issue**: Pattern `this.request<T>('/endpoint')` repeated throughout
   - **Recommendation**: Could be abstracted further with route decorators or automatic route builders

3. **KISS Violation - Complex URL Parameter Building** (Lines 218-225)
   - **Severity**: LOW
   - **Issue**: Manual URLSearchParams building repeated
   - **Recommendation**: Use helper function for building query parameters

4. **Error Handling - Weak Error Reporting** (Lines 61)
   - **Severity**: MEDIUM
   - **Issue**: Generic error handling: `error instanceof Error ? error.message : 'Network error'`
   - **Recommendation**: Categorize errors (network, timeout, auth, validation)

5. **YAGNI Violation - Mock Opportunities** (Lines 116-175)
   - **Severity**: LOW
   - **Issue**: `getOpportunities()` returns mock data with 500ms timeout instead of calling API
   - **Recommendation**: Either use real endpoint or move mocks to fixture file

6. **Code Organization - Missing Error Types** (Lines 1-6)
   - **Severity**: MEDIUM
   - **Issue**: No specific error types for different failure scenarios
   - **Recommendation**: Create custom error classes (AuthError, NetworkError, etc.)

---

### File: `/frontend/src/components/Navigation.tsx`
**Severity**: MEDIUM
**Lines of Code**: 97

#### Violations Found:

1. **DRY Violation - Inline Styles** (Lines 18-31, 43-68, 70-93)
   - **Severity**: MEDIUM
   - **Issue**: Complex inline style objects repeated throughout component
   - **Recommendation**: Extract to CSS module or CSS-in-JS library (styled-components, Tailwind)

2. **KISS Violation - Complex Link Mapping** (Lines 43-68)
   - **Severity**: LOW
   - **Issue**: Dynamic navigation generation from array is good, but style logic could be cleaner
   - **Recommendation**: Use consistent className-based styling

3. **Immutability Issue** (Line 6-12)
   - **Severity**: LOW
   - **Issue**: `NAV_ITEMS` is mutable array at module level
   - **Recommendation**: Use `as const` for immutability

4. **Code Organization - Magic Strings** (Lines 45)
   - **Severity**: LOW
   - **Issue**: `pathname?.startsWith(item.href + '/')` uses string concatenation
   - **Recommendation**: Use pathname matching utility

---

## BACKEND ANALYSIS (Rust)

### File: `/backend/api_gateway/src/main.rs`
**Severity**: MEDIUM
**Lines of Code**: 195

#### Violations Found:

1. **SRP Violation - God Object** (Lines 31-195)
   - **Severity**: HIGH
   - **Issue**: Main function initializes and configures:
     - Database connection
     - 5+ different services
     - CORS policies
     - Rate limiting
     - All routing (11 scopes)
   - **Recommendation**:
     - Extract service initialization to factory function
     - Extract routing to separate module
     - Use builder pattern for server configuration

2. **DRY Violation - Repeated Service Wrapping** (Lines 77-82, 101-106)
   - **Severity**: MEDIUM
   - **Issue**: Services wrapped in `web::Data::new()` then added as app_data
   - **Details**:
     ```rust
     let pool_data = web::Data::new(pool);
     ...
     .app_data(pool_data.clone())
     ```
   - **Recommendation**: Create `ServiceContainer` struct to hold all services

3. **KISS Violation - Environment Variable Handling** (Lines 40-41, 63-67)
   - **Severity**: MEDIUM
   - **Issue**: Repetitive environment variable loading with defaults
   - **Recommendation**: Use a config struct with `.env` file or config builder

4. **Error Handling - Weak Error Messages** (Lines 49-52)
   - **Severity**: MEDIUM
   - **Issue**: Generic exit on database error doesn't help debugging
   - **Details**:
     ```rust
     error!("Failed to connect to database: {:?}", e);
     std::process::exit(1);
     ```
   - **Recommendation**: Log full error stack trace and context

5. **YAGNI Violation - Hardcoded Rate Limits** (Lines 70-74)
   - **Severity**: LOW
   - **Issue**: Rate limit (60/min) hardcoded, not configurable
   - **Recommendation**: Load from environment

6. **Code Organization - Unused Endpoints** (Line 184)
   - **Severity**: MEDIUM
   - **Issue**: Comment indicates old handler: "eventually replace with analytics_service"
   - **Recommendation**: Deprecate and remove or commit to unified implementation

---

### File: `/backend/auth_service/src/token.rs`
**Severity**: MEDIUM
**Lines of Code**: 51

#### Violations Found:

1. **Error Handling - Weak Token Validation** (Lines 42-49)
   - **Severity**: MEDIUM
   - **Issue**: All JWT errors mapped to single `InvalidToken` error
   - **Recommendation**: Distinguish between expired, tampered, and malformed tokens

2. **KISS Violation - Magic Duration** (Lines 27-28)
   - **Severity**: MEDIUM
   - **Issue**: Token expiration hardcoded to 24 hours
   - **Details**:
     ```rust
     .checked_add_signed(Duration::new(24 * 3600, 0).unwrap())
     ```
   - **Recommendation**: Make configurable, use `chrono::Duration::hours(24)`

3. **Code Organization - Unused Duration** (Line 28)
   - **Severity**: LOW
   - **Issue**: `Duration::new(24 * 3600, 0).unwrap()` - 0 nanoseconds are redundant
   - **Recommendation**: Use `chrono::Duration::seconds(24 * 3600)`

---

### File: `/backend/shared/src/db.rs`
**Severity**: LOW
**Lines of Code**: 10

#### Violations Found:

1. **KISS Violation - Magic Connection Limit** (Line 6)
   - **Severity**: LOW
   - **Issue**: Connection pool limit hardcoded to 5
   - **Recommendation**: Make configurable or document why 5 is chosen

2. **Error Handling - Generic Pool Error** (Line 4)
   - **Severity**: LOW
   - **Issue**: Returns generic `sqlx::Error`, no context wrapping
   - **Recommendation**: Wrap with context about what operation failed

---

## CROSS-CUTTING ISSUES

### Issue 1: Testing Strategy
**Severity**: HIGH
**Type**: Testing
**Issue**: No visible test files in sample of 117 files
- **Details**:
  - Solidity contracts: No `.t.sol` test files found (except contracts/test/ which is empty)
  - Frontend: No `.test.tsx` or `.spec.tsx` files visible in main src/
  - Backend: No `#[cfg(test)]` modules in sampled files
- **Recommendation**: Implement test coverage for all critical paths:
  - Unit tests for all contract functions
  - Integration tests for contract interactions
  - React component tests with React Testing Library
  - API endpoint tests in Rust

### Issue 2: Documentation
**Severity**: MEDIUM
**Type**: Code Organization
**Issue**: Sparse inline documentation
- **Details**:
  - Contracts have good NatSpec comments
  - TypeScript files lack JSDoc comments on complex functions
  - Rust files lack doc comments
- **Recommendation**: Add comprehensive inline documentation

### Issue 3: Error Handling Patterns
**Severity**: MEDIUM
**Type**: Error Handling
**Issue**: Inconsistent error handling across stack
- **Details**:
  - Solidity: Custom errors (good)
  - TypeScript: Generic string errors
  - Rust: Mix of `Result<T>` and generic errors
- **Recommendation**: Establish consistent error handling strategy across stack

### Issue 4: Duplication of Business Logic
**Severity**: HIGH
**Type**: DRY
**Issue**: Persona pricing, contract generation, and validation logic duplicated across layers
- **Example**:
  - Persona pricing logic in PersonaRegistry.sol AND frontend TypeScript
  - Contract generation logic in contracts.ts AND backend (if exists)
- **Recommendation**: Single source of truth for business logic (likely smart contracts)

---

## PRIORITIZED IMPROVEMENT LIST

### Phase 1: High Severity Issues (Critical)

1. **PersonaRegistry.sol - Split into Multiple Contracts**
   - File: `/contracts/core/PersonaRegistry.sol`
   - Severity: HIGH (SRP)
   - Estimated Effort: 4-6 hours
   - Impact: High - improves maintainability and testability

2. **ProfessionRegistry.sol - Remove Merge Resolution Duplication**
   - File: `/contracts/core/ProfessionRegistry.sol`
   - Severity: HIGH (DRY)
   - Estimated Effort: 2-3 hours
   - Impact: Medium - reduces bugs in merge logic

3. **API Client - Split by Domain**
   - File: `/frontend/src/lib/api.ts`
   - Severity: HIGH (SRP)
   - Estimated Effort: 3-4 hours
   - Impact: High - easier to test and maintain

4. **API Gateway - Extract Configuration & Routing**
   - File: `/backend/api_gateway/src/main.rs`
   - Severity: HIGH (SRP)
   - Estimated Effort: 3-5 hours
   - Impact: High - improves code readability

### Phase 2: Medium Severity Issues

5. **PersonaRegistry.sol - Extract Refund Helper**
   - File: `/contracts/core/PersonaRegistry.sol`
   - Severity: MEDIUM (DRY)
   - Estimated Effort: 1 hour
   - Impact: Medium - reduces duplication

6. **PersonaRegistry.sol - Simplify Decay Calculation**
   - File: `/contracts/core/PersonaRegistry.sol`
   - Severity: MEDIUM (KISS)
   - Estimated Effort: 2-3 hours
   - Impact: High - reduces gas costs and complexity

7. **SkinNFT.sol - Extract SVG Generation**
   - File: `/contracts/nft/SkinNFT.sol`
   - Severity: MEDIUM (SRP, KISS)
   - Estimated Effort: 2 hours
   - Impact: Medium - improves maintainability

8. **Navigation.tsx - Extract Styles to CSS Module**
   - File: `/frontend/src/components/Navigation.tsx`
   - Severity: MEDIUM (DRY)
   - Estimated Effort: 1 hour
   - Impact: Low - improves code organization

9. **Add Comprehensive Test Suite**
   - Severity: MEDIUM (Testing)
   - Estimated Effort: 20-30 hours
   - Impact: Critical - catches bugs early

### Phase 3: Low Severity / Tech Debt

10. **Token Manager - Make Duration Configurable**
    - File: `/backend/auth_service/src/token.rs`
    - Severity: LOW (KISS)
    - Estimated Effort: 30 minutes
    - Impact: Low - improves flexibility

11. **Contracts.ts - Use Factory Pattern**
    - File: `/frontend/src/lib/contracts.ts`
    - Severity: MEDIUM (DRY)
    - Estimated Effort: 2 hours
    - Impact: Low - improves maintainability

12. **Add Error Type Hierarchy**
    - Severity: MEDIUM (Error Handling)
    - Estimated Effort: 3-4 hours
    - Impact: Medium - better error handling

---

## RECOMMENDATIONS BY PRINCIPLE

### SOLID Principles

**Single Responsibility Principle**
- Priority: CRITICAL
- Issues: 6 major violations
- PersonaRegistry, ProfessionRegistry, SkinNFT, PaymentSplitter, ApiClient, api_gateway/main.rs
- Recommendation: Refactor into smaller, focused contracts/modules

**Open/Closed Principle**
- Status: Generally Good
- Minor issue: Hard-coded configuration values
- Recommendation: Use dependency injection for configurations

**Liskov Substitution Principle**
- Status: N/A for this codebase (limited inheritance)

**Interface Segregation Principle**
- Status: Good in Solidity (interface-driven design)
- Issue: ApiClient has 15+ methods, should be split

**Dependency Inversion Principle**
- Status: Good in Rust backend
- Minor issue: Frontend API client directly references backend URLs

### DRY (Don't Repeat Yourself)
- **Critical**: 8+ instances of duplicated code
- Focus areas: Refund logic, validation checks, error handling
- Estimated 10-15 hours to remediate

### KISS (Keep It Simple, Stupid)
- **Medium**: Decay calculation, SVG generation, environment handling
- Too many loop-based calculations that could use formulas
- Estimated 5-7 hours to remediate

### YAGNI (You Aren't Gonna Need It)
- **Low**: Custom image URI not used, mock data in API client
- Generally good - most code is being used
- Estimated 1-2 hours cleanup

### Testing
- **CRITICAL ISSUE**: No visible test suite
- Contracts lack `.t.sol` tests
- Frontend/Backend lack unit tests
- Estimated 20-30 hours to build comprehensive test suite

### Error Handling
- **Medium Priority**: Inconsistent patterns across stack
- Weak error categorization
- Missing context in error messages
- Estimated 4-6 hours to improve

### Performance & Security
- **Medium**: Decay calculation loops could be optimized
- Contract merging resolution not cached
- Database connection pool hardcoded to 5
- Estimated 3-5 hours for performance improvements

---

## SUMMARY STATISTICS

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| SRP Violations | 4 | 2 | 0 | 6 |
| DRY Violations | 2 | 8 | 1 | 11 |
| KISS Violations | 1 | 5 | 2 | 8 |
| Error Handling | 2 | 6 | 0 | 8 |
| Testing | 1 | 0 | 0 | 1 |
| Code Organization | 2 | 4 | 2 | 8 |
| **TOTAL** | **12** | **25** | **5** | **42** |

---

## NEXT STEPS

1. **Week 1**: Address High Severity SRP violations in contracts
2. **Week 2**: Refactor API client and API gateway
3. **Week 3**: Build test suite for critical paths
4. **Week 4**: Address Medium severity DRY and KISS violations

**Estimated Total Remediation Time**: 40-50 hours

---

## CONCLUSION

The codebase demonstrates solid understanding of architecture and design patterns. However, it suffers from:
1. **Overly broad responsibilities** in key components
2. **Code duplication** in payment/validation logic
3. **Lack of test coverage** (critical gap)
4. **Inconsistent error handling** across the stack

Addressing the High and Medium severity issues will significantly improve maintainability, reduce bugs, and make the codebase easier to scale.

**Recommended priority**: Fix testing gap first (highest impact), then tackle SRP violations in contracts and API client.
