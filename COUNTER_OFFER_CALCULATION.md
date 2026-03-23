# Counter-Offer Calculation Logic

## Overview

The counter-offer suggestion system in ValueSkins is designed to provide **fair and contextual pricing guidance** to creators when they receive a brand offer. Unlike a naive "always ask for 25% more" approach, this system respects both creator market rates and brand offer reasonableness.

## Location in Codebase

**File:** `frontend/src/app/demo/instagram/page.tsx`
**Lines:** ~3634-3667 (inside the "Your Counter" section of the deal room, `dealRoomPhase === 'pending'`)

## How It Works

### Input Data

```typescript
const brandOffer = parseInt(dealOfferAmount || opp.budget.replace(/[^0-9]/g, '') || '0');
const matchingCreator = BRAND_MARKETPLACE_CREATORS.find(c => c.valueSkin === opp.type);
const creatorRate = matchingCreator ? parseInt(matchingCreator.rate.replace(/[^0-9]/g, '') || '0') : brandOffer;
```

- **`brandOffer`**: The amount the brand initially offered (parsed from deal state)
- **`matchingCreator`**: Found from `BRAND_MARKETPLACE_CREATORS` array by matching the opportunity type (profession) with the creator's `valueSkin`
- **`creatorRate`**: The creator's standard rate from their profile (e.g., "$4,500" for a Software Engineer). If no matching creator found, defaults to `brandOffer`.

### Decision Tree

The suggestion engine uses three metrics to classify the offer:

#### 1. **Offer is 10%+ Below Creator's Rate** (Undervalued)
```
if (brandOffer < creatorRate * 0.9)
```
- **Suggested Price:** Creator's standard rate
- **Message:** "Your standard rate"
- **Logic:** Brand is undercutting significantly. Suggest asking for market value.

**Example:**
- Creator's rate: $5,000
- Brand offer: $4,200 (84% of rate)
- Suggestion: $5,000 ("Your standard rate")

#### 2. **Offer is 5-10% Below to 10% Above Creator's Rate** (Fair Range)
```
else if (brandOffer >= creatorRate * 0.95 && brandOffer <= creatorRate * 1.1)
```
- **Suggested Price:** Accept the brand offer (no counter needed)
- **Message:** "Fair offer — accept or negotiate minimally"
- **Logic:** Within market standard. No reason to counter-offer.

**Example:**
- Creator's rate: $5,000
- Brand offer: $5,200 (104% of rate)
- Suggestion: $5,200 ("Fair offer — accept or negotiate minimally")

#### 3. **Offer is 10%+ Above Creator's Rate** (Generous)
```
else if (brandOffer > creatorRate * 1.1)
```
- **Suggested Price:** Accept the brand offer
- **Message:** "Above standard — consider accepting"
- **Logic:** Brand is paying above market. No counter needed.

**Example:**
- Creator's rate: $5,000
- Brand offer: $5,800 (116% of rate)
- Suggestion: $5,800 ("Above standard — consider accepting")

#### 4. **Default: Minor Adjustment** (Fallback)
```
else {
  suggestedPrice = Math.round(Math.max(brandOffer, creatorRate * 0.95) / 50) * 50;
  reason = 'Reasonable adjustment';
}
```
- **Suggested Price:** Either the brand offer OR 95% of creator's rate, whichever is higher
- **Message:** "Reasonable adjustment"
- **Logic:** Ensures creator never drops below 95% of their standard rate

**Note:** All prices are rounded to nearest $50 for clean negotiation numbers:
```typescript
Math.round(suggestedPrice / 50) * 50
```

## Key Design Principles

### 1. **Creator's Market Rate is the Anchor**
The creator's standard rate (from their profile in `BRAND_MARKETPLACE_CREATORS`) is the neutral reference point. All suggestions are relative to this baseline.

### 2. **No Hard-Coded Bias**
Removed the old logic that always suggested 25% above brand offer. This was unfair to brands and didn't reflect market conditions.

### 3. **Transparent Reasoning**
Every suggestion includes context so the creator understands WHY they're being asked to accept/counter (e.g., "Fair offer", "Your standard rate").

### 4. **Range-Based, Not Formula-Based**
Instead of: `brandOffer * 1.25`, we use ranges:
- 0–90% of rate: undervalued
- 90–110% of rate: fair
- 110%+ of rate: generous

This avoids arbitrary multipliers and respects professional norms.

## Real-World Examples

### Example 1: Undervalued Offer
```
Creator Profile: Data Scientist, $5,200/post
Brand Offer: $4,200
Calculation: $4,200 < ($5,200 × 0.9 = $4,680) ✓
Suggestion: $5,200 ("Your standard rate")
Recommendation: Creator should counter with their standard rate
```

### Example 2: Fair Offer
```
Creator Profile: Fitness Coach, $3,200/post
Brand Offer: $3,100
Calculation: $3,100 ≥ ($3,200 × 0.95 = $3,040) AND $3,100 ≤ ($3,200 × 1.1 = $3,520) ✓
Suggestion: $3,100 ("Fair offer — accept or negotiate minimally")
Recommendation: Creator should accept or make only small adjustments
```

### Example 3: Generous Offer
```
Creator Profile: UX/UI Designer, $6,000/post
Brand Offer: $7,000
Calculation: $7,000 > ($6,000 × 1.1 = $6,600) ✓
Suggestion: $7,000 ("Above standard — consider accepting")
Recommendation: Creator should accept without countering
```

### Example 4: Slightly Low
```
Creator Profile: Software Engineer, $4,500/post
Brand Offer: $4,300
Calculation: Falls into fallback (between 90% and 95%)
Suggestion: max($4,300, $4,275) = $4,300 rounded to $4,300 ("Reasonable adjustment")
Recommendation: Creator can accept or counter with $4,300–$4,500
```

## Data Structure: Creator Rate Lookup

The creator's rate is stored in `BRAND_MARKETPLACE_CREATORS`:

```typescript
const BRAND_MARKETPLACE_CREATORS = [
  {
    name: 'Alex Rivera',
    valueSkin: 'Software Engineer',
    rate: '$4,500',  // ← Extracted and parsed here
    // ... other fields
  },
  // ...
];
```

The lookup is done by matching the opportunity's `type` (profession) with the creator's `valueSkin`:

```typescript
const matchingCreator = BRAND_MARKETPLACE_CREATORS.find(c => c.valueSkin === opp.type);
```

## Fallback Behavior

If no matching creator is found (e.g., a newly created profession without mock data):

```typescript
const creatorRate = matchingCreator ? parseInt(...) : brandOffer;
```

The system **defaults to using the brand offer as the rate**, meaning:
- All suggestions will show "Market-aligned" or "Reasonable adjustment"
- No unfair assumptions are made

**Future Improvement:** Link to creator profile API data instead of mock array.

## Integration with Deal Room

The suggestion is rendered inside the creator's deal room during the `pending` phase:

```jsx
{dealRoomPhase === 'pending' && (
  <div style={{ background: C.bg, borderRadius: '8px', border: `1px solid ${C.border}`, padding: '8px' }}>
    <div style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase' }}>Your Counter</div>
    <div style={{ fontSize: '10px', color: C.textSecondary, marginBottom: '4px' }}>
      Brand offer: <strong>${brandOffer.toLocaleString()}</strong>
    </div>
    {/* ← Suggestion rendered here */}
    <input type="number" value={dealCounterAmount} onChange={e => setDealCounterAmount(e.target.value)} placeholder="Your ask ($)" />
    <button onClick={() => { /* Send counter */ }}>Send Counter</button>
  </div>
)}
```

The creator can:
1. **Accept the suggestion** by typing the suggested price and clicking "Send Counter"
2. **Ignore the suggestion** and enter their own custom amount
3. **Accept the offer** by not countering at all

## Testing the Logic

To verify the calculation works correctly:

1. **Create a brand offer below creator's rate:**
   - Create a campaign targeting "Software Engineer" (standard rate $4,500)
   - Send an offer of $3,500
   - Expected: "Your standard rate $4,500"

2. **Create a fair offer:**
   - Create a campaign targeting "Data Scientist" (standard rate $5,200)
   - Send an offer of $5,100
   - Expected: "Fair offer — accept or negotiate minimally $5,100"

3. **Create a generous offer:**
   - Create a campaign targeting "Fitness Coach" (standard rate $3,200)
   - Send an offer of $4,000
   - Expected: "Above standard — consider accepting $4,000"

## Future Enhancements

1. **Dynamic Creator Rates:** Link to real creator profile API instead of mock data
2. **Historical Negotiation Data:** Learn typical counter patterns and adjust ranges
3. **Deal Type Adjustment:** Different logic for barter vs. paid deals
4. **Seasonal Rates:** Adjust suggestions based on campaign seasonality
5. **Creator Tier System:** Premium creators could have different rate floors
