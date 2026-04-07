# ValueSkins Matching Algorithm

This document explains how the matching algorithm works in ValueSkins and why it exists.

## Goal

ValueSkins is designed to eliminate middlemen in creator-brand matching.

Traditional agencies and influencer managers often justify their role by doing three things:

1. Filtering out bad-fit creators
2. Spotting strong niche creators that raw follower counts miss
3. Explaining why a specific creator is the right choice for a specific campaign

The ValueSkins matching algorithm is meant to replace that judgment with a repeatable scoring system.

## Core Idea

ValueSkins does not treat follower count as the primary signal.

Instead, it tries to rank creators by:

- Audience fit
- Niche authority
- Reliability
- Retention and engagement quality
- Trust built through past partnerships

This is how the product avoids the common mistake of picking the largest creator instead of the most effective one.

## Why ValueSkins Comes First

The first and strongest filter in the system is the ValueSkin itself.

A ValueSkin is the creator's identity layer. It tells the system what the creator is actually trusted for.

Examples:

- `Software Engineer`
- `Fitness Coach`
- `Doctor`
- `Food Photographer`

If a campaign requires a specific ValueSkin and the creator does not match it, the creator is rejected immediately.

This is the algorithm's first replacement for agency judgment:

"Is this person even the right kind of creator for this campaign?"

## Hard Filters

These decide whether a creator is even eligible.

The current hard filters are:

- ValueSkin match
- Level range
- Excluded creator IDs
- Minimum follower threshold, if a campaign explicitly requires it
- Maximum follower threshold, if a campaign explicitly requires it

These filters are strict. If a creator fails one of them, they do not proceed to scoring.

## Soft Scoring

Once a creator passes the hard filters, ValueSkins calculates a weighted score.

The main scoring buckets are:

- `skinMatch`
- `levelMatch`
- `budgetMatch`
- `audienceMatch`
- `engagementMatch`
- `brandSafetyMatch`

Each bucket returns a 0-100 score, and the final result is a weighted average.

## What Each Score Means

### 1. Skin Match

Weight: `30`

This is the strongest signal in the system.

If the creator has the required ValueSkin, they receive a full score.
If not, they are ineligible.

This is how ValueSkins encodes niche identity directly into matching.

### 2. Level Match

Weight: `15`

This checks whether the creator's level falls within the campaign's acceptable range.

The creator is rewarded for being inside the range, with a small bonus for sitting near the middle of it.

This helps brands avoid creators who are too early or too advanced for a given campaign type.

### 3. Budget Match

Weight: `15`

This compares the creator's estimated rate to the brand's budget per creator.

The system prefers:

- Creators at or below budget
- Creators slightly above budget but still negotiable

It penalizes creators who are priced far beyond the campaign.

This helps ValueSkins replace the manual "can we actually afford this creator?" screening done by agencies.

### 4. Audience Match

Weight: `20`

This bucket used to be mostly demographic alignment.
It now represents two ideas together:

- Audience-brand fit
- Niche authority

Audience fit includes signals like:

- age distribution
- location match
- language match

Niche authority captures whether the creator is actually trusted in the topic the campaign cares about.

If explicit authority data is available, the algorithm uses it.
If not, it falls back to overlap between campaign categories and the creator's top content categories.

This is one of the most important ValueSkins ideas:

The best creator is often the one whose audience and topic authority match the campaign, not the one with the most followers.

### 5. Engagement Match

Weight: `10`

This bucket is no longer just engagement rate.

It now blends:

- engagement rate
- content consistency
- watch retention or story completion

This matters because agencies often intuitively ask:

- Does this creator post regularly?
- Do people actually stay and watch?
- Is the engagement real or shallow?

ValueSkins turns those questions into scoreable inputs.

This helps smaller creators win when they are:

- highly consistent
- deeply watched
- strongly engaged

### 6. Brand Safety Match

Weight: `10`

This starts with the creator's brand safety score if one exists.
Then it blends in repeat partnership trust.

Repeat partnership trust answers a key question:

"Do brands come back after working with this creator?"

That signal is extremely important because repeat partnerships usually imply:

- strong results
- smooth collaboration
- low risk

This is another place where ValueSkins replaces middlemen.
Instead of someone saying "trust me, this creator is reliable," the system reflects that reliability directly in ranking.

## Things Needed From The Platform Side

To make this algorithm work efficiently across all platforms, ValueSkins needs structured inputs from the platform itself or from a platform-approved integration layer.

The ideal inputs are:

- Audience demographics
  - age distribution
  - country / region distribution
  - primary and secondary language data
  - gender split where available

- Content performance data
  - average views
  - average likes, comments, shares, saves, or equivalent engagement actions
  - posting frequency
  - category or topic classification for recent content
  - follower growth over time

- Retention data
  - watch-time retention
  - story completion rate
  - session completion rate
  - any metric showing whether viewers stay to the end instead of dropping early

- Consistency data
  - posting cadence over time
  - gaps in activity
  - whether the creator publishes steadily or disappears for long periods

- Partnership and conversion history
  - prior campaign participation
  - repeat partnership rate
  - completion rate
  - conversion or attributed action data where the platform supports it

- Trust and safety data
  - account verification status
  - policy violations
  - flagged content history
  - fraud / suspicious engagement indicators

- Identity and category data
  - creator verticals or categories
  - platform-native tags
  - any metadata that helps determine niche authority

What ValueSkins does not need from the platform:

- a platform-specific redesign
- a different user workflow
- follower count as the only ranking signal

What helps most is reliable access to audience quality, retention, consistency, and repeat-partnership signals.

In practice, the more a platform can provide those signals, the better ValueSkins can replace agencies, managers, and manual creator scouting.

## Why This Helps Eliminate Middlemen

Middlemen often justify their value by saying:

- "This creator is a better fit than the bigger one."
- "Their audience is more likely to buy."
- "They are small, but brands come back to them."
- "They are consistent and trustworthy."

The ValueSkins algorithm formalizes that reasoning.

Instead of relying on taste, relationships, or vague intuition, the system scores the same ideas directly.

That means ValueSkins is not just a marketplace.
It is also a decision engine.

## Follower Count in ValueSkins

Follower count still exists in the system.

It can still be used as:

- a hard requirement when a campaign explicitly demands it
- a reference metric for pricing and scale

But it is not supposed to be the dominant proxy for creator quality.

That is a deliberate product choice.

ValueSkins is trying to surface creators who are:

- more trusted
- more relevant
- more consistent
- more likely to convert

even if they are smaller.

## Example

A campaign for a niche food brand might compare:

- Creator A: 500K followers, broad lifestyle audience
- Creator B: 11K followers, highly trusted food-specific audience

ValueSkins is designed so Creator B can outrank Creator A if:

- the ValueSkin is a stronger match
- the audience fit is better
- the niche authority is stronger
- the retention is better
- the repeat partnership trust is higher

That is exactly the type of decision a good agency would make.
The point of ValueSkins is to make the platform itself capable of making it.

## Current File

The main implementation lives in:

- `frontend/src/lib/creatorMatching.ts`

The logic is intended to be platform-agnostic, so the same scoring model can support Twitch, YouTube, Instagram, TikTok, LinkedIn, and future integrations as long as those platforms provide compatible data.

## Product Interpretation

In ValueSkins terms, the algorithm is doing this:

1. Verify identity through ValueSkin
2. Check campaign compatibility
3. Score creator quality beyond vanity metrics
4. Rank creators the way a strong human operator would

That is the mechanism by which ValueSkins can reduce or remove agencies, talent brokers, and other middle layers from creator-brand matching.
