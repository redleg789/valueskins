# Updated Features

## Settings Page

### UI Overhaul
- **Country field**: Changed from plain text input to a full dropdown with all 195+ countries
- **Timezone**: Expanded from 9 options to full list of all UTC offsets worldwide (UTC-12 through UTC+14)
- **Availability Hours**: Replaced free-text input with two time-picker dropdowns (From / To) that show your selected timezone as a label
- **Available Until**: Added date picker for vacation/break end dates — warns you when set
- **Audience Languages**: Replaced "Audience Primary Location" text input with multi-select language chips
- **Removed — Content Niche**: Niche is determined by your ValuSkin, not manual selection
- **Removed — Primary Platform**: Redundant with the platform switcher already in settings
- **Removed — Deal Type Preference**: Always deal-mode for ValuSkins
- **All toggles functional**: Relocate, travel, live events, exclusivity, NDA, usage rights all toggle via React state

### Real-Time Match Score
- Match score percentage displayed inside the Advance Preferences section
- Updates instantly as you change price band, advance toggle, and other preferences
- Shows full score breakdown:
  - Base ValuSkin match: +40
  - Creator level fit (level × 4, max 20)
  - Price band overlap: +15 if mid-tier or premium
  - Trust & authenticity bonus: up to +17
  - Advance compatibility: +5 if advance enabled
- Compatibility tier labels: Low / Fair / Good / Excellent

---

## Bug Fixes

### Critical: Navigation Bar Blocking All Click Events
- **Root cause**: `(app)/layout.tsx` was rendering a full-width fixed `<Navigation />` bar (z-index 100, 80px tall) on top of every page inside the `(app)` route group
- **Impact**: All `(app)` pages use `PlatformLayout` which provides its own header and bottom nav — the parent Navigation was invisible but sat on top of content and intercepted all click/tap events, making dropdowns, toggles, and buttons completely unresponsive
- **Fix**: Removed `<Navigation />` from `(app)/layout.tsx` — PlatformLayout handles all navigation for these pages

### Store Page — Sticker Icons Not Displaying on Vercel
- **Root cause 1**: Component rendered the `PROFESSIONS` constant instead of the `professions` state fetched from the backend
- **Root cause 2**: CSS `filter: brightness(0) invert(1)` was inverting white SVG elements to black, making them invisible on dark backgrounds
- **Root cause 3**: Vercel `standalone` output mode does not properly serve static files from `/public` — badge SVG files were inaccessible at runtime
- **Fix**: Moved all sticker SVGs inline as JSX (`React.ReactElement`) directly in the component — no external file dependencies, no CSS filter

### Store Page — TypeScript Build Error on Vercel
- **Root cause**: `JSX.Element` type annotation used without React in scope
- **Fix**: Added `import React` and changed annotation to `React.ReactElement`

---

## Matching Score Criteria

The match percentage shown on brand/creator cards is calculated deterministically from:

| Factor | Points |
|--------|--------|
| Base ValuSkin match (same profession) | +40 |
| Creator level fit (level × 4, capped at 20) | +0 to +20 |
| Price band overlap (mid-tier or premium) | +15 |
| Trust score bonus (trust_score / 10, max 10) | +0 to +10 |
| Follower audit authenticity (audit_score / 10, max 10) | +0 to +10 |
| Advance compatibility | +5 |
| **Maximum** | **100** |

Hard filter: if creator `requires_advance = true` AND brand `offers_advance = false`, they are never matched — this pair is excluded before scoring runs.

### International Deals Toggle
- New toggle in Settings > Deal Preferences: "Allow International Deals"
- When enabled, creators can receive cross-border brand deals

### Payment Plan (3-Way Split)
- Settings now include three payment percentage sliders: Advance / After Submission / Performance-based
- All three must total 100% — sliders auto-adjust
- Visual split bar shows the ratio at a glance
- "Negotiable" toggle lets creators mark if their split is flexible
- These defaults carry into deal rooms

### Content Posting Rules
- New section in Settings: "Content Posting Rules"
- Pre-set rules creators agree to follow (no posting at certain times, no reposting within 48h, must disclose sponsorship, etc.)
- Brands see which rules a creator has accepted upfront — reduces back-and-forth

---

## Deal Room — Counter-Offer Flow

### Pricing Section
- **Your Ask**: Displayed read-only by default — no accidental edits
- **Counter button**: Price editing is only unlocked after clicking "Counter Offer"
- Counter-offer is submitted as a `counter_offer` message type in the deal room chat (documented, auditable)
- **Negotiation History**: Timeline of all counter-offers by both parties with timestamps
- Removes default `$` sign — uses creator's home currency or brand's currency depending on deal type

### 3-Way Payment Split in Deal Room
- Advance / After Submission / Performance sliders in the deal room sidebar
- Visual split bar matches settings page
- Auto-saves to deal room preferences (debounced)

### Multi-Currency Support
- `formatCurrency()` now accepts an optional currency code parameter
- Uses `Intl.NumberFormat` for proper locale-aware formatting (e.g., `INR 50,000` for Indian deals)
- International deals show amounts in brand's currency
- Domestic deals show amounts in creator's home currency
- Country-to-currency mapping covers 50+ countries

---

## Profile Pages

- Redesigned to match Instagram's actual mobile UI layout
- Gradient story ring around avatar
- Stats row: Posts / Followers / Following
- ValuSkin profession badge below username
- Bio section
- Story highlights row
- Tab navigation (Posts / Reels / Tagged)
- 3-column photo grid

---

## Platform Layout System

All `(app)` pages use `PlatformLayout`, which automatically switches visual identity based on the selected platform:
- **Meta / Across**: Instagram dark mode, bottom tab nav
- **LinkedIn**: Light mode, professional layout
- **YouTube**: Dark mode with red accents

Platform is user-selectable in Settings > Creator Platform.
