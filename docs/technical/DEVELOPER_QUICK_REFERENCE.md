# Developer Quick Reference Guide

**Valueskins Code Quality Standards**
Use this as your daily guide for writing code that passes the Anti-Vibe-Coder Master Checklist.

---

## 🎯 The Golden Rules

### 1. Before You Code
- [ ] Does this follow SOLID principles?
- [ ] Is there duplication I can remove (DRY)?
- [ ] Am I overcomplicating? (KISS)
- [ ] Do I actually need this? (YAGNI)
- [ ] Can I explain this in 60 seconds?

### 2. While You Code
- [ ] One responsibility per function/class
- [ ] Names describe intent, not mechanics
- [ ] No magic numbers (use named constants)
- [ ] Handle all error cases explicitly
- [ ] Validate inputs at boundaries

### 3. Before You Commit
- [ ] Does it work?
- [ ] Is it tested?
- [ ] Can someone else understand it?
- [ ] Did I follow the checklist?
- [ ] Would I want to maintain this?

---

## 📋 SOLID Principles Quick Reference

### S - Single Responsibility
**One job per class/function. Period.**

❌ Bad:
```typescript
class ApiClient {
    async login(wallet, sig, msg) { ... }
    async getPersonas() { ... }
    async createPost(id, content) { ... }
    async applyToOpportunity(id, persona) { ... }
    // 25+ more methods...
}
```

✅ Good:
```typescript
class AuthClient {
    async login(wallet, sig, msg) { ... }
}

class PersonaClient {
    async getPersonas() { ... }
}

class SocialClient {
    async createPost(id, content) { ... }
}
```

**Check:** Can you describe what this class does in one sentence?

---

### O - Open/Closed
**Open for extension, closed for modification.**

❌ Bad:
```solidity
function calculatePrice(personaCount, priceType) {
    if (priceType == 1) return basePrice * count;
    if (priceType == 2) return basePrice * count * 2;
    if (priceType == 3) return basePrice * count * 3;
    // Add new type? Must modify this function
}
```

✅ Good:
```solidity
interface PricingStrategy {
    function calculatePrice(uint256 count) external pure returns (uint256);
}

contract StandardPricing is PricingStrategy {
    function calculatePrice(uint256 count) external pure returns (uint256) {
        // ...
    }
}

// Add new pricing? Create new contract, don't modify existing
```

**Check:** Can you add features without changing existing code?

---

### L - Liskov Substitution
**Subclasses must work wherever the parent is expected.**

❌ Bad:
```typescript
class Animal {
    makeSound() { return "generic sound"; }
}

class Bird extends Animal {
    makeSound() { return "chirp"; }
    fly() { /* bird specific */ }
}

// A penguin can't fly, but must extend Bird
class Penguin extends Bird {
    fly() { throw new Error("Penguins can't fly!"); }
}

// This breaks LSP - Bird instances must be flyable
playWithBird(new Penguin()); // Crash!
```

✅ Good:
```typescript
interface Animal {
    makeSound(): string;
}

class Bird implements Animal {
    makeSound() { return "chirp"; }
}

interface FlyingAnimal extends Animal {
    fly(): void;
}

class Penguin implements Animal {
    makeSound() { return "squawk"; }
    // No fly() method - no contract violation
}
```

**Check:** Can I swap implementations without breaking callers?

---

### I - Interface Segregation
**Use small, specific interfaces. Don't force unused methods.**

❌ Bad:
```typescript
interface APIClient {
    login(): Promise<Token>;
    logout(): Promise<void>;
    getPersonas(): Promise<Persona[]>;
    createPost(content: string): Promise<Post>;
    applyToOpportunity(id: number): Promise<Application>;
    // 25+ more methods...
}

// A component only needs auth, but gets everything
const authComponent = new Component(apiClient);
```

✅ Good:
```typescript
interface AuthService {
    login(): Promise<Token>;
    logout(): Promise<void>;
}

interface PersonaService {
    getPersonas(): Promise<Persona[]>;
}

interface SocialService {
    createPost(content: string): Promise<Post>;
}

// Component only gets what it needs
const authComponent = new Component(authService);
```

**Check:** Does every method get used by every user?

---

### D - Dependency Inversion
**Depend on abstractions, not concrete implementations.**

❌ Bad:
```typescript
class PersonaManager {
    private db = new PostgresDatabase(); // Concrete
    private http = new FetchHttpClient(); // Concrete

    async loadPersonas() {
        return this.db.query("SELECT * FROM personas");
    }
}

// Can't test without real DB. Hard to swap implementations.
```

✅ Good:
```typescript
interface Database {
    query<T>(sql: string): Promise<T[]>;
}

interface HttpClient {
    request<T>(endpoint: string): Promise<T>;
}

class PersonaManager {
    constructor(
        private db: Database, // Abstract
        private http: HttpClient // Abstract
    ) {}

    async loadPersonas() {
        return this.db.query("SELECT * FROM personas");
    }
}

// Easy to test with mock implementations
const mockDb = { query: () => Promise.resolve([]) };
const manager = new PersonaManager(mockDb, mockHttp);
```

**Check:** Can I swap implementations in tests without changing code?

---

## 🔄 Other Critical Principles

### DRY (Don't Repeat Yourself)
**Write it once, use it everywhere.**

❌ Bad - 3 places with same refund logic:
```solidity
// In PersonaRegistry.sol
if (msg.value > price) {
    (bool success, ) = msg.sender.call{value: msg.value - price}("");
    if (!success) revert TransferFailed();
}

// In ProfessionRegistry.sol
if (msg.value > professionAddPrice) {
    (bool success, ) = msg.sender.call{value: msg.value - professionAddPrice}("");
    if (!success) revert TransferFailed();
}

// In OtherContract.sol
if (msg.value > cost) {
    (bool success, ) = msg.sender.call{value: msg.value - cost}("");
    if (!success) revert TransferFailed();
}
```

✅ Good - extract to shared utility:
```solidity
function _refundExcess(uint256 amount) internal {
    if (amount > 0) {
        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert TransferFailed();
    }
}

// Use everywhere
_refundExcess(msg.value - price);
_refundExcess(msg.value - professionAddPrice);
_refundExcess(msg.value - cost);
```

**Check:** Do I see this code pattern 2+ times?

---

### KISS (Keep It Simple, Stupid)
**Simplest solution wins.**

❌ Bad - Over-engineered:
```typescript
interface PricingStrategy {
    calculate(count: number): Promise<number>;
}

class StandardPricing implements PricingStrategy {
    async calculate(count: number): Promise<number> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(count * 100);
            }, 0);
        });
    }
}

const pricing = new StandardPricing();
const price = await pricing.calculate(5);
```

✅ Good - Simple:
```typescript
function calculatePrice(count: number): number {
    return count * 100;
}

const price = calculatePrice(5);
```

**Check:** Is there a simpler way to solve this?

---

### YAGNI (You Aren't Gonna Need It)
**Don't build it until you need it.**

❌ Bad - Building for imaginary future:
```typescript
interface APIResponse<T, E, M, P> {
    data?: T;
    error?: E;
    metadata?: M;
    pagination?: P;
    cache?: boolean;
    timestamp?: Date;
    requestId?: string;
    // ... 10 more fields we don't use
}
```

✅ Good - Only what's needed now:
```typescript
interface APIResponse<T> {
    data?: T;
    error?: string;
}
```

**Check:** Am I building for a feature that doesn't exist yet?

---

### Composition Over Inheritance
**Favor composition (has-a) over inheritance (is-a).**

❌ Bad - Deep inheritance:
```typescript
class User {}
class Creator extends User {}
class VerifiedCreator extends Creator {}
class LegendaryCreator extends VerifiedCreator {}
class LegendaryVerifiedCreator extends LegendaryCreator {}
// Hierarchy nightmare!
```

✅ Good - Composition:
```typescript
class User {
    name: string;
}

class CreatorProfile {
    user: User;
    isVerified: boolean;
    isLegendary: boolean;
}
```

**Check:** Is this really a type of X, or does it have an X?

---

## ✅ Code Clarity Checklist

### Names
- [ ] Name describes intent, not mechanics
  - ❌ `let x = 5;`
  - ✅ `let basePrice = 5;`

- [ ] No single-letter variables (except `i` in loops)
  - ❌ `const r = calculateRate(a, b);`
  - ✅ `const rate = calculateRate(amount, total);`

- [ ] Functions describe what they do
  - ❌ `process(data);`
  - ✅ `validateAndSaveUser(data);`

- [ ] Classes describe what they are
  - ❌ `class Handler { }`
  - ✅ `class AuthenticationHandler { }`

### Numbers & Constants
- [ ] No magic numbers in code
  - ❌ `if (level > 4) { }`
  - ✅ `if (level > MAX_LEVEL) { }`

- [ ] No magic strings in code
  - ❌ `if (status === "active") { }`
  - ✅ `if (status === Status.ACTIVE) { }`

### Functions
- [ ] Does one thing
- [ ] Fits on one screen
- [ ] Easy to test in isolation
- [ ] Clear inputs and outputs
- [ ] No hidden side effects

---

## 🛡️ Safety Checklist

### Input Validation
```typescript
// ❌ Bad - No validation
function processPayment(amount: number) {
    return amount * 2;
}

// ✅ Good - Validate boundaries
function processPayment(amount: number) {
    if (amount <= 0) throw new Error("Amount must be positive");
    if (amount > MAX_PAYMENT) throw new Error("Exceeds maximum");
    return amount * 2;
}
```

### Error Handling
```typescript
// ❌ Bad - Silent failure
try {
    await api.call();
} catch (e) {
    // Oops, error disappeared
}

// ✅ Good - Explicit handling
try {
    await api.call();
} catch (e) {
    logger.error("API call failed", { error: e });
    throw new APIError("Could not reach server", { cause: e });
}
```

### Edge Cases
```typescript
// ❌ Bad - What about edge cases?
function getAverage(numbers: number[]) {
    return numbers.reduce((a, b) => a + b) / numbers.length;
}
// Crashes if array is empty!

// ✅ Good - Handle edge cases
function getAverage(numbers: number[]) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b) / numbers.length;
}
```

---

## 📝 Comment Guidelines

### Write Comments to Explain WHY, Not WHAT

❌ Bad - Comments repeat the code:
```typescript
// Increment counter
counter++;

// Check if user is authorized
if (user.isAdmin) {
    // Allow access
    return true;
}
```

✅ Good - Comments explain reasoning:
```typescript
counter++; // Counter starts at 0, we increment for 1-based indexing

// Only admins can approve contracts to prevent unauthorized updates
if (user.isAdmin) {
    return true;
}
```

### When to Comment
- Complex algorithms (why this approach?)
- Non-obvious decisions (why not X?)
- Important constraints (don't change this without Y!)
- Business logic (why does this rule exist?)

### When NOT to Comment
- What the code does (it's obvious)
- Bad variable names (fix the name instead)
- Tracking changes (use git history)

---

## 🧪 Testing Mindset

### Design for Testability

❌ Hard to test:
```solidity
contract PersonaRegistry {
    uint256 private _personaIdCounter = 1; // Can't set in test

    function createPersona(string name) external {
        require(msg.sender == owner); // Hard to test different users
        _personaIdCounter++;
        // ...
    }
}
```

✅ Easy to test:
```solidity
contract PersonaRegistry {
    uint256 private _personaIdCounter;
    address private _owner;

    constructor(uint256 startingId, address owner) {
        _personaIdCounter = startingId; // Can inject test values
        _owner = owner;
    }

    function createPersona(string name) external {
        require(msg.sender == _owner);
        _personaIdCounter++;
        // ...
    }
}
```

### Test One Thing Per Test

❌ Bad - Testing too much:
```typescript
test("everything works", async () => {
    const user = await createUser("Alice");
    const persona = await createPersona(user.id);
    await addProfession(persona.id);
    await updateLevel(persona.id, 5);
    const stats = await getStats(persona.id);
    expect(stats.level).toBe(5);
    // 4 different operations tested at once!
});
```

✅ Good - One thing:
```typescript
test("updateLevel sets persona level", async () => {
    const persona = await createPersona(userFixture);
    await updateLevel(persona.id, 5);
    const updated = await getPersona(persona.id);
    expect(updated.level).toBe(5);
});
```

---

## 🚩 Red Flags - STOP and Refactor

If you see ANY of these, refactor immediately:

### Structure Red Flags
- [ ] **200+ line function** → Split into smaller functions
- [ ] **God object** → 25+ methods in one class → Split by domain
- [ ] **Deep inheritance** → 4+ levels deep → Use composition
- [ ] **Hidden global state** → Static variables modified everywhere → Inject dependencies
- [ ] **Circular dependencies** → A → B → A → Break the cycle

### Code Quality Red Flags
- [ ] **Silent catch blocks** → `catch (e) { }` → Log and throw
- [ ] **Scattered conditionals** → Same logic in 5 places → Extract to function
- [ ] **Boolean explosions** → 10+ boolean flags → Use enums/state machines
- [ ] **Magic numbers everywhere** → No named constants → Create constants
- [ ] **Comments saying "TODO"** → Code not finished → Finish or delete

### Testing Red Flags
- [ ] **No tests** → Write tests first
- [ ] **Mocking the SUT** → Mocking what you're testing → Refactor design
- [ ] **100% coverage but low quality** → Tests are decorative → Write behavior tests
- [ ] **Flaky tests** → Sometimes pass, sometimes fail → Fix the test

---

## 🔄 Development Workflow

### Before You Start
1. Check `claude.md` for principles
2. Check Anti-Vibe-Coder Master Checklist
3. Plan your changes
4. Write tests first (TDD)

### While Coding
1. Follow SOLID principles
2. Use this quick reference
3. Run tests frequently
4. Keep functions small
5. Name things clearly

### Before Committing
1. Run all tests
2. Check against checklist
3. Review your own code
4. Explain changes in commit message
5. Small, focused commits

### In Code Review
1. Does it follow SOLID?
2. Are names clear?
3. Is it tested?
4. Could it be simpler?
5. Does it have red flags?

---

## 📚 Files to Reference

- **claude.md** - Full coding guidelines
- **CODE_IMPROVEMENTS_SUMMARY.md** - What we improved and why
- **IMPLEMENTATION_COMPLETE.md** - Detailed implementation report
- **Anti-Vibe-Coder Master Checklist** - Full checklist (in claude.md)

---

## 🎓 Architecture Patterns Used

### Facade Pattern
```typescript
// Many domain clients behind one simple API
class ApiClient {
    readonly auth: AuthClient;
    readonly persona: PersonaClient;
    readonly social: SocialClient;
    // ... 7 more
}

// Usage: api.auth.login() vs api.persona.getPersonas()
```

### Dependency Injection
```typescript
// Inject dependencies, don't create them
class PersonaManager {
    constructor(private db: Database, private cache: Cache) {}
}

// Easy to test with mocks
const manager = new PersonaManager(mockDb, mockCache);
```

### Single Responsibility
```typescript
// Each class does one thing
class AuthClient { /* auth only */ }
class PersonaClient { /* personas only */ }
class SocialClient { /* social only */ }
```

---

## 💡 Real Examples from Valueskins

### Example 1: DRY Principle
**Before:**
```solidity
// In createPersona()
if (msg.value > price) {
    (bool success, ) = msg.sender.call{value: msg.value - price}("");
    if (!success) revert TransferFailed();
}

// In payUpkeep()
if (msg.value > upkeepCost) {
    (bool success, ) = msg.sender.call{value: msg.value - upkeepCost}("");
    if (!success) revert TransferFailed();
}
```

**After:**
```solidity
function _refundExcess(uint256 amount) internal {
    if (amount > 0) {
        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert TransferFailed();
    }
}

_refundExcess(msg.value - price);
_refundExcess(msg.value - upkeepCost);
```

**Impact:** Eliminated 6 lines of duplication, single source of truth

---

### Example 2: SRP Violation Fixed
**Before:**
```typescript
class ApiClient {
    async login(wallet, sig, msg) { ... }
    async getPersonas() { ... }
    async createPost(content) { ... }
    async applyToOpportunity(id) { ... }
    // 21 more methods across 10 different domains
}
```

**After:**
```typescript
class AuthClient { async login() { } }
class PersonaClient { async getPersonas() { } }
class SocialClient { async createPost() { } }
class MarketplaceClient { async applyToOpportunity() { } }

class ApiClient {
    readonly auth = new AuthClient();
    readonly persona = new PersonaClient();
    readonly social = new SocialClient();
    readonly marketplace = new MarketplaceClient();
}
```

**Impact:** Better IDE autocomplete, clearer intent, easier testing

---

### Example 3: Performance Optimization
**Before:**
```solidity
// Expensive decay calculation
uint256 totalDecay = 0;
uint256 remaining = PRECISION;
for (uint256 i = 0; i < weeksInactive && remaining > 0; i++) {
    uint256 weekDecay = (remaining * decayRate) / PRECISION;
    totalDecay += weekDecay;
    remaining -= weekDecay;
}
return totalDecay;
```

**After:**
```solidity
// Optimized with overflow protection
if (weeksInactive > 100) weeksInactive = 100;

uint256 multiplier = PRECISION - decayRate;
uint256 remaining = PRECISION;
for (uint256 i = 0; i < weeksInactive; i++) {
    remaining = (remaining * multiplier) / PRECISION;
}
return PRECISION - remaining;
```

**Impact:** Cleaner math, overflow protection, more efficient calculation

---

## 🎯 Your Action Items

1. **Today:** Read `claude.md` completely
2. **This Week:** Apply checklist to your code
3. **Going Forward:** Reference this guide daily
4. **Code Review:** Use this as PR review checklist

---

**Remember:** The best code is code that's easy to understand, easy to test, and easy to change.

Keep it simple. Keep it clear. Keep it SOLID.

