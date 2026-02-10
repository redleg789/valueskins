## SOLID Principles

Always follow the SOLID principles while coding.
**S — Single Responsibility:** Each class or module should have only one job.
**O — Open/Closed:** Code should allow adding new behavior without changing existing code.
**L — Liskov Substitution:** Child classes must work correctly wherever the parent is expected.
**I — Interface Segregation:** Use small, specific interfaces instead of one large one.
**D — Dependency Inversion:** Depend on abstractions, not concrete implementations.

## DRY (Don't Repeat Yourself)
Avoid duplicating code. Extract common logic into reusable functions, utilities, or shared components.

## KISS (Keep It Simple, Stupid)
Write simple, readable code. Avoid over-engineering. The simplest solution is often the best one.

## YAGNI (You Aren't Gonna Need It)
Don't add features or code you don't need yet. Only implement what's required now.

## Composition Over Inheritance
Prefer composition to extend functionality rather than deep inheritance hierarchies.

## Immutability
Use immutable data structures and final variables where possible to prevent unexpected state changes.

## Error Handling & Validation
- Validate inputs at system boundaries (user input, external APIs)
- Use meaningful error messages
- Don't ignore exceptions silently
- Handle edge cases explicitly

## Code Organization & Structure
- Keep files focused and small
- Group related functionality together
- Use clear naming conventions (PascalCase for classes, camelCase for functions/variables)
- Organize imports logically

## Testing Principles
- Write testable code with dependencies injected
- Test edge cases and error scenarios
- Aim for clear, maintainable tests
- Use descriptive test names

## Performance & Security
- Avoid premature optimization
- Follow security best practices (no hardcoded secrets, input sanitization)
- Use appropriate data structures and algorithms
- Review contract security patterns for smart contracts

---

# Anti-Vibe-Coder Master Checklist (principles + ship-ready rules)

Run this before calling any code "done".

## Structure & Design

* Each class/module has one responsibility.
* Functions do one thing and stay small.
* No god objects or god files.
* Composition preferred over inheritance.
* Business logic separated from UI, DB, and network.
* Core logic not tied to a framework.
* State modeled with enums/state machines, not multiple booleans.
* Dependencies point inward to abstractions.

## Clarity & Readability

* Names describe intent, not shortcuts.
* No single-letter variables outside tiny loops.
* No magic numbers or hidden constants.
* One abstraction level per function.
* Deep nesting removed with early returns.
* Comments explain why, not what.
* No clever tricks that reduce readability.
* Consistent style and formatting.

## Correctness & Safety

* All external inputs validated.
* Edge cases handled explicitly.
* Errors never silently ignored.
* Fail fast on invalid state.
* Side effects are obvious in function names.
* Null/none cases handled deliberately.
* Timeouts and retries defined for external calls.
* Idempotent operations where retries can happen.

## Interfaces & Contracts

* Depend on interfaces, not concrete classes.
* Interfaces are small and role-focused.
* No method forces unused parameters.
* Function contracts documented by types.
* Illegal states made impossible by design.
* Backward compatibility considered for public APIs.

## Testing Discipline

* Critical paths covered by tests.
* Tests check behavior, not internals.
* Tests deterministic, no randomness.
* Each test has one purpose.
* Bug fixes come with a regression test.
* Integration tests for cross-module flows.
* No untested complex logic.

## Change & Version Control

* Small commits with one purpose.
* No mixed refactor + feature commits.
* Dead code deleted, not commented out.
* Refactor when complexity rises, not later.
* Public interfaces versioned when changed.
* Diff readable without mental gymnastics.

## Complexity Control

* No copy-paste blocks — extract functions.
* Repeated logic centralized.
* Cyclomatic complexity kept low.
* Large functions split.
* Config moved out of code.
* Feature flags used instead of branching chaos.

## Performance & Reliability

* Measure before optimizing.
* Resource usage bounded.
* Expensive operations cached or batched.
* No blocking calls in hot paths.
* Graceful degradation for dependency failure.
* Logging at failure points, not everywhere.

## Professional Red Flags (instant rewrite triggers)

* "It works, don't touch it."
* 200+ line functions.
* Boolean flag explosions.
* Hidden global state.
* Silent catch blocks.
* Tight coupling across layers.
* Behavior controlled by scattered conditionals.
* You cannot explain the flow in plain language in 60 seconds.

Use this as a gate. If multiple items fail, redesign — don't patch.
