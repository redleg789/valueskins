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

---

## Creator ValueSkin Leveling System

### Per-Skin Independent Levels
- Each ValueSkin (profession/passion/hobby) levels independently from 1-5
- XP thresholds: Lv.1 (0 XP), Lv.2 (50 XP), Lv.3 (200 XP), Lv.4 (500 XP), Lv.5 (1000 XP)
- Base XP is manually seeded per skin on purchase (profession: 350, passion: 120, hobby: 30)
- Follower count only counts as bonus XP when user owns exactly 1 skin (avoids attribution ambiguity)
- Bonus XP formula: `log10(followers) * 40` (e.g., 1M followers ≈ +240 XP)
- Levels are displayed only when clicking individual skin in profile, not on the profile itself

### Per-Skin Pitch & Showcase
- Each ValueSkin has its own pitch text and video/media (replaces shared "Your Story" section)
- "Why should brands hire you as a [Profession]?" section is unique per skin
- Creators can upload different demo videos for different skins
- Pitch data persists to localStorage (survives page reloads)
- Settings shows per-skin pitch status: ✓ (completed) or ✗ (needs setup) for each skin

### Onboarding Flow — Once Per Session
- 3-step tutorial: Welcome → Select Role → Store Redirect
- Displayed only on first visit; persisted in localStorage
- Does not repeat on subsequent page reloads in the same session

---

## Marketplace Improvements

### Actual ValueSkin Stickers in Selectors
- "Browse as" (creator) and "Active ValueSkin" (brand) selectors now display the actual sticker image instead of abbreviation squares
- Images pulled from `PROFESSION_BADGES[profession].stickerImage`
- Automatically updates when badge images change in AvatarOptions.tsx
- Falls back to colored abbreviation if no stickerImage exists

### Creator Profile Links in Marketplace
- Creator avatars in brand marketplace discovery are clickable — opens creator's Instagram profile in new tab
- Brand opportunity cards are fully clickable — opens brand's Instagram profile (except Ask button which opens deal modal)
- Hover effects show when card is interactive

### Rich Creator Insights in Brand Application Review
- "Applications Received" cards now display full creator profile:
  - Avatar with Instagram link
  - Name, handle, profession, ValuSkin level (color-coded)
  - Match score percentage
  - Stats grid: followers, engagement rate, rate card, deal completion rate
  - Audience tags: location, age range, response time
  - Portfolio highlights (past work)
- Demo seeded with 3 sample applications (Priya Sharma, Jordan Blake, Elena Rodriguez) showing rich cards immediately
- Created `SharedApplication` type with optional insight fields that auto-populate from creator data

---

## Application Type Extensions

### SharedApplication Type
- Extended with optional creator insight fields: name, followers, engagement, level, match score, rate, completion rate, portfolio, audience location/age, response time, Instagram URL
- Applications created when deal is accepted automatically include creator's current metrics
- Type supports both deal-based and campaign-based applications

---

## Demo Data & Seeding

### Pre-Seeded Applications
- Brand marketplace seeded with 3 demo applications on first load
- Priya Sharma (UX/UI Designer) — pending application to Mobile App Design Review
- Jordan Blake (Fitness Coach) — pending application to Spring Fitness Challenge
- Elena Rodriguez (Nutritionist) — pending application to Spring Fitness Challenge
- Each includes full creator insights and active deal room lifecycle

### Opportunity Instancing
- Opportunities now include optional `instagramUrl` field for brand social profiles
- Sample opportunities populated with TechFlow Labs, CloudBase, DevTools Pro URLs

---

## Workflow Smoothness Improvements

### Clickable Handles & Names Everywhere
- Creator handle (@handle) in marketplace cards is clickable → opens their Instagram
- Creator name in "Applications Received" is clickable → opens Instagram
- Creator handle in applications is clickable → opens Instagram
- Brand name in opportunity cards is clickable → opens their Instagram
- Brand name in deal room headers (both collapsed and expanded) is clickable → opens Instagram
- All profile links open in new tab (target="_blank")

### Creator Preview Modal Enhancements
- "Visit Instagram" button to view creator's full profile
- "Back to Marketplace" button for clear navigation
- Both buttons available in the modal footer

### Notifications Profile Links
- Deal and Community notifications include "View Profile →" link
- Quick shortcut to view the relevant creator/brand profile

### Visual Link Indicators
- All clickable names/handles styled in primary color (#0066CC)
- Underline on hover shows the element is interactive
- Consistent across marketplace, deal rooms, and applications

### Separate Brand Profile Access
- Brand name in opportunity cards is independently clickable (separate from "Ask" button)
- Clicking the card still opens brand Instagram, clicking "Ask" opens deal brief modal
- No ambiguity between viewing profile and reviewing the deal

### Deal Room Brand Links
- Both collapsed and expanded deal room state headers have clickable brand names
- Quick access to brand profile without leaving the negotiation
- Maintains deal room context while allowing profile exploration

### Notifications Gated by ValueSkin Selection
- Notifications are only shown after creator selects or purchases a ValueSkin
- Empty state message directs user to select a ValueSkin first
- Prevents showing mock notifications to new users (production seriousness)

### Fixed: Opportunity Card Button Conflicts
- Removed parent card onClick that was intercepting button clicks
- Only brand name is now clickable (opens Instagram in new tab)
- All buttons (Enter Deal Room, Enable Barter, Ask) are now fully functional
- Counter-offer buttons work as expected without navigation override
