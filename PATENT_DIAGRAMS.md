# VALUESKINS PATENT DIAGRAMS
## Provisional Patent Application — Technical Illustrations

---

## FIG. 1 — SYSTEM ARCHITECTURE

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         VALUESKINS SYSTEM ARCHITECTURE                      │
└────────────────────────────────────────────────────────────────────────────┘

                        ┌─────────────────────────┐
                        │   CREATOR DEVICE (101)  │
                        │  (Instagram OAuth)      │
                        └────────────┬────────────┘
                                     │
                        ┌────────────┴────────────┐
                        │     BRAND DEVICE (102)  │
                        │  (Instagram OAuth)      │
                        └────────────┬────────────┘
                                     │
                  ┌──────────────────┼──────────────────┐
                  │                  │                  │
                  ▼                  ▼                  ▼
         ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
         │   HTTPS/TLS  │   │   HTTPS/TLS  │  │   HTTPS/TLS  │
         │    Network   │   │    Network   │  │    Network   │
         │    (Internet)│   │    (Internet)│  │    (Internet)│
         └──────────────┘   └──────────────┘  └──────────────┘
                  │                  │                  │
                  └──────────────────┼──────────────────┘
                                     │
                        ┌────────────▼────────────┐
                        │  API GATEWAY SERVER     │
                        │  (201) — Actix-Web      │
                        │  ┌────────────────────┐ │
                        │  │ Auth Handler (202) │ │
                        │  │ Persona Handler(203)│ │
                        │  │ Marketplace(204)    │ │
                        │  │ Contract Handler(205)│ │
                        │  │ Deal Room Handler(206)│ │
                        │  └────────────────────┘ │
                        └────────────┬────────────┘
                                     │
                        ┌────────────▼────────────┐
                        │  APPLICATION LOGIC      │
                        │  SERVER (207)           │
                        │  ┌────────────────────┐ │
                        │  │ State Machine(208) │ │
                        │  │ Scoring Engine(209)│ │
                        │  │ Matching(210)      │ │
                        │  │ Contract Gen(211)  │ │
                        │  │ Reputation(212)    │ │
                        │  │ Credit Line(213)   │ │
                        │  └────────────────────┘ │
                        └────────────┬────────────┘
                                     │
                        ┌────────────▼────────────┐
                        │  POSTGRESQL DATABASE   │
                        │  (214)                  │
                        │  ┌────────────────────┐ │
                        │  │ Users Table (215)  │ │
                        │  │ Personas (216)     │ │
                        │  │ Opportunities(217) │ │
                        │  │ Deal Rooms (218)   │ │
                        │  │ Contracts (219)    │ │
                        │  │ Messages (220)     │ │
                        │  │ Signatures (221)   │ │
                        │  │ Benchmarks (222)   │ │
                        │  │ Audit Results (223)│ │
                        │  └────────────────────┘ │
                        └────────────┬────────────┘
                                     │
                  ┌──────────────────┼──────────────────┐
                  │                  │                  │
                  ▼                  ▼                  ▼
         ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
         │ INSTAGRAM    │   │ META PAYMENT │  │ EXTERNAL     │
         │ OAUTH (224)  │   │ RAIL (225)   │  │ AUDIT (226)  │
         └──────────────┘   └──────────────┘  └──────────────┘


FIGURE DESCRIPTION:
Diagram 1 illustrates the complete ValueSkins system architecture. Creator
devices (101) and brand devices (102) connect via HTTPS/TLS network (not shown
as separate layer; implicit in connections) to the API Gateway Server (201).
The gateway routes requests to specialized handlers: Auth (202), Persona (203),
Marketplace (204), Contract (205), Deal Room (206). These route to the
Application Logic Server (207), which contains the core engines: State Machine
(208), Scoring Engine (209), Matching Engine (210), Contract Generation (211),
Reputation Computation (212), and Credit Line Management (213). All data is
persisted in PostgreSQL Database (214) with tables for Users (215), Personas
(216), Opportunities (217), Deal Rooms (218), Contracts (219), Messages (220),
Signatures (221), Benchmarks (222), and Audit Results (223). The system
integrates with Instagram OAuth (224) for identity, Meta Payment Rail (225)
for fund movement, and External Audit Services (226) for follower analysis.
```

---

## FIG. 2 — DEAL STATE MACHINE & WORKFLOW

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   DEAL ROOM STATE MACHINE & WORKFLOW                        │
└────────────────────────────────────────────────────────────────────────────┘

                            ┌──────────────────┐
                            │  NEGOTIATION     │
                            │  STATE (301)     │
                            │                  │
                            │ Parties exchange │
                            │ offer/counter    │
                            │ offer rounds     │
                            │ (message log:320)│
                            └────────┬─────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                                 │
                    │ [Offer Accepted]                │
                    │ (302: Offer Round              │
                    │  status = "accepted")          │
                    │                                 │
                    ▼                                 ▼
        ┌──────────────────────────┐    ┌──────────────────────┐
        │ CONTRACT GENERATION (303)│    │ REJECTION (304)      │
        │ Auto-triggered on        │    │ Offer round status   │
        │ offer acceptance         │    │ = "rejected"         │
        │ ┌──────────────────────┐ │    │ Return to 301        │
        │ │ Contract Template    │ │    └──────────────────────┘
        │ │ Synthesized (305)    │ │
        │ │ Amount (306)         │ │
        │ │ Deliverables (307)   │ │
        │ │ Revision Cap (308)   │ │
        │ │ Kill Fee % (309)     │ │
        │ │ Exclusivity Days(310)│ │
        │ │ Content Hash(311)    │ │
        │ └──────────────────────┘ │
        └────────────┬─────────────┘
                     │
                     │ [Both Parties E-Sign Contract]
                     │ (Signature storage: 312)
                     │ (Content Hash Match Verified: 313)
                     │
                     ▼
        ┌──────────────────────────┐
        │ CONTRACT PENDING STATE   │
        │ (314)                    │
        │ ┌──────────────────────┐ │
        │ │ Awaiting Signatures  │ │
        │ │ Creator Signature(315)│ │
        │ │ Brand Signature (316) │ │
        │ │ Max 7 days to sign   │ │
        │ │ (Expiry check: 317)  │ │
        │ └──────────────────────┘ │
        └────────────┬─────────────┘
                     │
        ┌────────────┴──────────┐
        │                       │
   [Signed]              [Expired]
        │                       │
        ▼                       ▼
    ┌──────────┐          ┌──────────────┐
    │ FUNDED   │          │ Return to 301│
    │ (318)    │          │ (Renegotiate)│
    │          │          └──────────────┘
    │ Creator  │
    │ uploads  │
    │ deliver- │
    │ ables    │
    │ (Hash:319)
    └────┬─────┘
         │
         ▼
    ┌──────────────────────┐
    │ IN_PROGRESS STATE    │
    │ (320)                │
    │ Brand reviews        │
    │ deliverables        │
    └─────────┬────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
[Approved]        [Rejected]
    │                    │
    ▼                    ▼
┌──────────────┐   ┌────────────────────┐
│ COMPLETED    │   │ IN_PROGRESS (321)  │
│ STATE (322)  │   │ Creator revises    │
│              │   │ (Rev count track323)
│ Payout (323) │   │ Max revisions=2    │
│ Reputation   │   │ (Cap enforced: 324)│
│ Update (324) │   └─────────┬──────────┘
│ Credit Line  │             │
│ Repay (325)  │             │
└──────────────┘          [Revised]
                             │
                             └──────┐
                                    │
                        ┌───────────┘
                        │
                        ▼
    ┌─────────────────────────────┐
    │ CANCELLATION PATH (326)     │
    │ From any state except 322   │
    │ ┌───────────────────────┐   │
    │ │ Brand Cancels: Kill   │   │
    │ │ Fee Triggered (327)   │   │
    │ │ Amount = kill_fee_pct │   │
    │ │ × deal_amount (328)   │   │
    │ │ Emitted to Meta       │   │
    │ │ Payment Rail (329)    │   │
    │ └───────────────────────┘   │
    └─────────────────────────────┘


FIGURE DESCRIPTION:
Diagram 2 depicts the deal room state machine. All deals begin in NEGOTIATION
state (301), where parties exchange offer and counter-offer rounds via deal
room messages (320). When an offer round (302) is accepted, the system
automatically triggers Contract Generation (303), creating a contract from the
offer round data (305-310) and computing a content hash (311). The deal
transitions to CONTRACT PENDING (314), requiring both creator (315) and brand
(316) signatures. If unsigned within 7 days (expiry check 317), the deal
reverts to NEGOTIATION for renegotiation. Once both parties sign and content
hashes match (313), the deal transitions to FUNDED (318). The creator then
uploads deliverables with integrity hash (319) and the deal moves to IN
PROGRESS (320). Upon brand approval, the deal transitions to COMPLETED (322),
triggering payout (323), reputation updates (324), and credit line repayment
(325). Cancellation can occur from any state via Cancellation Path (326),
triggering kill fee calculation (327-328) and emission to Meta Payment Rail
(329). Revision tracking (323) enforces revision cap limits (324).
```

---

## FIG. 3 — CONTRACT GENERATION & CRYPTOGRAPHIC VERIFICATION ENGINE

```
┌────────────────────────────────────────────────────────────────────────────┐
│       CONTRACT AUTO-GENERATION & TAMPER-DETECTION ENGINE                    │
└────────────────────────────────────────────────────────────────────────────┘

          OFFER ROUND ACCEPTANCE TRIGGER (401)
                       │
                       ▼
        ┌──────────────────────────────────┐
        │ CONTRACT GENERATION ENGINE (402) │
        │                                  │
        │  Input Data Sources:             │
        │  ├─ Amount (403)                 │
        │  ├─ Currency (404)               │
        │  ├─ Deliverable List (405)       │
        │  ├─ Revision Cap (406)           │
        │  ├─ Exclusivity Days (407)       │
        │  ├─ Kill Fee % (408)             │
        │  ├─ Usage Rights (409)           │
        │  └─ Deadline (410)               │
        │                                  │
        │  Processing Logic:               │
        │  ├─ Template Selection (411)     │
        │  ├─ Field Substitution (412)     │
        │  ├─ Validation (413)             │
        │  └─ PDF Generation (414)         │
        └────────────────┬─────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────┐
        │ CONTENT SERIALIZATION (415)      │
        │ Contract text → JSON             │
        └────────────────┬─────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────┐
        │ SHA-256 HASH COMPUTATION (416)   │
        │                                  │
        │ Input: Serialized JSON (415)     │
        │ Output: content_hash (417)       │
        │ Example: "abc123def456..."       │
        └────────────────┬─────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────┐
        │ DATABASE STORAGE (418)           │
        │                                  │
        │ contracts table:                 │
        │ ├─ id (419)                      │
        │ ├─ deal_room_id (420)            │
        │ ├─ contract_text (421)           │
        │ ├─ content_hash (417)  [stored]  │
        │ ├─ pdf_url (422)                 │
        │ └─ created_at (423)              │
        └────────────────┬─────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
      [E-Sign #1]                  [E-Sign #2]
    [Creator Signs]             [Brand Signs]
          │                             │
          ▼                             ▼
    ┌──────────────────┐      ┌──────────────────┐
    │ CREATOR          │      │ BRAND            │
    │ SIGNATURE (424)  │      │ SIGNATURE (425)  │
    │                  │      │                  │
    │ Signer: 101 (426)│      │ Signer: 102 (427)│
    │ Timestamp: t1(428)│     │ Timestamp: t2(429)│
    │ Hash_at_sign:    │      │ Hash_at_sign:    │
    │ h1 (430)         │      │ h2 (431)         │
    │ [Insert DB: 432] │      │ [Insert DB: 433] │
    └────────┬─────────┘      └────────┬─────────┘
             │                         │
             └────────────┬────────────┘
                          │
                          ▼
        ┌────────────────────────────────────────┐
        │ TAMPER-DETECTION VERIFICATION (434)    │
        │                                         │
        │ Verify: h1 == content_hash (417)?      │
        │         h2 == content_hash (417)?      │
        │                                         │
        │ Both match → Deal proceeds to FUNDED   │
        │ Mismatch → Alert: "Contract tampered" │
        │            Deal halts. Renegotiate.   │
        └────────────────────────────────────────┘


FIGURE DESCRIPTION:
Diagram 3 illustrates the contract generation and cryptographic verification
engine. Upon offer round acceptance (401), the Contract Generation Engine (402)
collects input data: amount (403), currency (404), deliverable list (405),
revision cap (406), exclusivity days (407), kill fee percentage (408), usage
rights (409), and deadline (410). It selects a template (411), substitutes
fields (412), validates completeness (413), and generates PDF (414). The
contract is then serialized to JSON (415) and hashed using SHA-256 (416),
producing content_hash (417). The contract record, including the hash, is
stored in the database (418) with unique ID (419), deal room reference (420),
contract text (421), PDF URL (422), and creation timestamp (423). Both creator
and brand e-sign the contract separately. Creator signature (424) records
signer ID (426), timestamp (428), and hash at signature time (430), then
inserts into database (432). Brand signature (425) similarly records signer
(427), timestamp (429), hash (431), and database insert (433). Upon both
signatures, the system performs Tamper-Detection Verification (434): if the
stored hash (417) matches both signature-time hashes (430 and 431), the deal
proceeds to FUNDED state. If hashes mismatch, an alert is triggered and the
deal halts, requiring renegotiation.
```

---

## FIG. 4 — DETERMINISTIC REPUTATION SCORING & EXPORT ENGINE

```
┌────────────────────────────────────────────────────────────────────────────┐
│    DETERMINISTIC REPUTATION SCORING & PORTABLE EXPORT ENGINE                │
└────────────────────────────────────────────────────────────────────────────┘

        REPUTATION COMPUTATION TRIGGER (501)
        [Deal Completion | Monthly Job | Manual Refresh]
                       │
                       ▼
    ┌──────────────────────────────────────┐
    │ INPUT DATA COLLECTION (502)          │
    │ For creator_persona_id               │
    │                                       │
    │ From Database:                        │
    │ ├─ completed_deal_count (503)         │
    │ ├─ avg_deal_value_cents (504)         │
    │ ├─ ghosted_count (505)                │
    │ ├─ contract_revision_abuse (506)      │
    │ ├─ testimonial_average (507)          │
    │ ├─ on_time_delivery_rate (508)        │
    │ └─ follower_audit_score (509)         │
    └──────────────┬───────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────┐
    │ DETERMINISTIC SCORE CALCULATION (510)│
    │ No randomness, no ML, no time-decay   │
    │                                       │
    │ base_score = 50 (511)                 │
    │ + (completed_deals × 0.5) (512)       │
    │ + (ghosted_count == 0 ? 20 : -X) (513)│
    │ + (revision_abuse < 3 ? 15 : -20)(514)│
    │ + (follower_audit_score × 0.2) (515) │
    │ + (testimonial_avg / 5 × 10) (516)    │
    │ + (on_time_rate bonus) (517)          │
    │                                       │
    │ score = min(sum, 100) (518)           │
    │                                       │
    │ LEVEL ASSIGNMENT (519):               │
    │ score <= 1 → Level 1 (Newcomer) (520) │
    │ 2-5 deals → Level 2 (Rising) (521)    │
    │ 6-20 deals → Level 3 (Estab.)(522)    │
    │ 21-50 deals, score≥85 → Level 4 (523) │
    │ >50 deals, score≥92 → Level 5 (524)   │
    └──────────────┬───────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────┐
    │ STORAGE IN PERSONA_LEVELS (525)      │
    │                                       │
    │ persona_id (526)                      │
    │ level (519)                           │
    │ real_score (518)                      │
    │ completed_deal_count (503)            │
    │ avg_deal_value_cents (504)            │
    │ ghosted_count (505)                   │
    │ last_computed_at (527)                │
    └──────────────┬───────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────┐
    │ REPUTATION EXPORT TRIGGER (528)      │
    │ GET /reputation/export                │
    │                                       │
    │ Fetch latest persona_levels (525)     │
    │ Package for export (529)              │
    └──────────────┬───────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────┐
    │ EXPORT DATA STRUCTURE (530)          │
    │ JSON Payload:                         │
    │ {                                     │
    │   "version": 1 (531)                  │
    │   "creator_persona_id": X (532)       │
    │   "completed_deal_count": (503)       │
    │   "avg_deal_value_cents": (504)       │
    │   "trust_scores": {...} (533)         │
    │   "testimonial_count": (534)          │
    │   "completion_rate": (535)            │
    │   "content_hash": h (536)             │
    │   "exported_at": t (537)              │
    │ }                                     │
    └──────────────┬───────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────┐
    │ CONTENT HASH COMPUTATION (538)       │
    │                                       │
    │ SHA-256(export_payload_json) (539)    │
    │ Result: content_hash (536)            │
    └──────────────┬───────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────┐
    │ ED25519 CRYPTOGRAPHIC SIGNING (540)  │
    │                                       │
    │ Platform Private Key (541)            │
    │ Sign(content_hash (536))              │
    │ Result: ed25519_signature (542)       │
    └──────────────┬───────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────┐
    │ SIGNED EXPORT RESPONSE (543)         │
    │                                       │
    │ {                                     │
    │   ... (export_data) ...  (530)        │
    │   "ed25519_signature": (542)          │
    │ }                                     │
    │                                       │
    │ Stored in reputation_exports (544)    │
    │ Version forever queryable (545)       │
    └──────────────────────────────────────┘

    ┌──────────────────────────────────────┐
    │ EXTERNAL VERIFICATION (546)          │
    │ Brand calls: /verify-reputation      │
    │                                       │
    │ Input: content_hash, signature, ID   │
    │ Verification:                         │
    │ ├─ Recompute hash from stored data   │
    │ ├─ Load Platform Public Key (547)    │
    │ ├─ Verify signature (548)            │
    │ └─ Return { valid: bool } (549)      │
    │                                       │
    │ No expiry: Signature valid forever    │
    └──────────────────────────────────────┘


FIGURE DESCRIPTION:
Diagram 4 shows the complete reputation scoring and export flow. Upon reputation
computation trigger (501)—whether at deal completion, monthly job, or manual
refresh—input data is collected (502): completed deal count (503), average deal
value (504), ghosted count (505), revision abuse count (506), testimonial
average (507), on-time delivery rate (508), and follower audit score (509). The
deterministic score calculation engine (510) computes a base score (511) and
adds weighted contributions from deal history (512), ghosting penalties (513),
revision abuse (514), follower audit score (515), testimonials (516), and
on-time bonuses (517), capping at 100 (518). Level assignment (519) is
deterministic based on deal count and score thresholds: Level 1 (520), Level 2
(521), Level 3 (522), Level 4 (523), Level 5 (524). Results are stored in the
persona_levels table (525-527). The export trigger (528) packages the data into
an export structure (530) with version (531), creator ID (532), trust scores
(533), testimonial count (534), completion rate (535), and timestamp (537). The
content is hashed (538-539) to produce content_hash (536), then signed using the
platform's Ed25519 private key (541, 540) to create ed25519_signature (542). The
signed export (543) is returned and stored with version tracking (544-545).
External parties (546) can verify authenticity (549) by recomputing the hash,
loading the public key (547), and verifying the signature (548). Signatures have
no expiry and remain valid forever.
```

---

## FIG. 5 — LEVEL-GATED MATCHING & ADVANCE PREFERENCE COMPATIBILITY FILTER

```
┌────────────────────────────────────────────────────────────────────────────┐
│      LEVEL-GATED MATCHING & ADVANCE PREFERENCE COMPATIBILITY ENGINE         │
└────────────────────────────────────────────────────────────────────────────┘

    MATCHING REQUEST TRIGGER (601)
    [Marketplace browse | Suggestions feed | Opportunity detail]
                       │
                       ▼
    ┌──────────────────────────────────────────┐
    │ CREATOR PROFILE LOOKUP (602)             │
    │ creator_persona_id → persona_levels      │
    │                                          │
    │ Fetch:                                   │
    │ ├─ creator_current_level (603)           │
    │ ├─ creator_trust_score (604)             │
    │ ├─ creator_completed_deals (605)         │
    │ └─ creator_advance_preferences (606)     │
    │    ├─ requires_advance (607)             │
    │    ├─ advance_pct (608)                  │
    │    └─ advance_negotiable (609)           │
    └──────────────┬───────────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────────┐
    │ OPPORTUNITY LOOKUP (610)                 │
    │ opportunity_id → opportunities table      │
    │                                          │
    │ Fetch:                                   │
    │ ├─ opportunity_required_level (611)      │
    │ ├─ brand_offers_advance (612)            │
    │ ├─ brand_default_advance_pct (613)       │
    │ └─ opportunity_category (614)            │
    └──────────┬──────────────────────────────┘
               │
               ▼
    ┌──────────────────────────────────────────┐
    │ LEVEL-GATING CHECK (615)                 │
    │                                          │
    │ if creator_level (603)                   │
    │    < required_level (611):               │
    │                                          │
    │   ├─ Match Result: BLOCKED (616)         │
    │   ├─ Reason: Level insufficient (617)    │
    │   ├─ Action: Hide from marketplace (618) │
    │   ├─ Action: Exclude from suggestions(619)
    │   └─ Action: Return 403 if direct URL(620)
    │                                          │
    │ else: PASS to next gate (621)            │
    └──────────┬──────────────────────────────┘
               │
               ▼
    ┌──────────────────────────────────────────┐
    │ ADVANCE PREFERENCE COMPATIBILITY (622)   │
    │                                          │
    │ if creator_requires_advance (607)        │
    │    && NOT creator_advance_negotiable(609)│
    │    && NOT brand_offers_advance (612):    │
    │                                          │
    │   ├─ Compatibility: FALSE (623)          │
    │   ├─ Reason: Hard constraint violation(624)
    │   ├─ Action: Remove from suggestions(625)│
    │   └─ Action: Hide from browse (626)      │
    │                                          │
    │ else: Compatibility: TRUE (627)          │
    └──────────┬──────────────────────────────┘
               │
               ▼
    ┌──────────────────────────────────────────┐
    │ ADDITIONAL MATCHING FACTORS (628)        │
    │                                          │
    │ Compute match_score:                     │
    │ ├─ ValuSkin match factor (629)           │
    │ ├─ Price band overlap (630)              │
    │ ├─ Trust score factor (631)              │
    │ ├─ Follower audit score (632)            │
    │ ├─ Past completion rate (633)            │
    │ └─ Advance compatibility (627) [gate]    │
    │                                          │
    │ match_score = weighted_sum (634)         │
    │ (0-100 scale)                            │
    └──────────┬──────────────────────────────┘
               │
               ▼
    ┌──────────────────────────────────────────┐
    │ DEAL_SUGGESTIONS INSERT (635)            │
    │                                          │
    │ INSERT INTO deal_suggestions:            │
    │ ├─ brand_persona_id (636)                │
    │ ├─ creator_persona_id (637)              │
    │ ├─ opportunity_id (638)                  │
    │ ├─ match_score (634)                     │
    │ ├─ match_factors (639) [JSON:            │
    │ │  {valueskin: X, price: Y, trust: Z,    │
    │ │   follower_audit: W, advance_compat:T} │
    │ ├─ advance_compatible (627)              │
    │ └─ status: "pending" (640)               │
    └──────────┬──────────────────────────────┘
               │
               ▼
    ┌──────────────────────────────────────────┐
    │ MARKETPLACE RENDERING (641)              │
    │                                          │
    │ Creator sees:                            │
    │ ├─ Level-gated opportunities only (621)  │
    │ ├─ Advance-compatible matches (627)      │
    │ ├─ Suggestions sorted by score (634)     │
    │ ├─ Green badge: "Right fit" if score>75 │
    │ ├─ Gray badge: "Explore" if score 50-75 │
    │ └─ Hidden: score < 50 or incompatible(624)
    │                                          │
    │ Brand sees:                              │
    │ ├─ Ranked creator list per opportunity  │
    │ ├─ Top matches by score (634)            │
    │ ├─ Filter by level (611)                 │
    │ ├─ Filter by trust score (631)           │
    │ └─ Advance compatibility indicator (627) │
    └──────────────────────────────────────────┘


FIGURE DESCRIPTION:
Diagram 5 illustrates the level-gated matching and advance preference
compatibility engine. Upon matching request (601), the system looks up the
creator's profile (602) to retrieve current level (603), trust score (604),
deal count (605), and advance preferences (606-609). It simultaneously looks up
the opportunity (610) to retrieve required level (611), advance settings
(612-613), and category (614). The Level-Gating Check (615) is the first gate:
if creator's level is below required level (617), the opportunity is blocked
(616) and hidden from marketplace (618), suggestions (619), and returns 403 if
directly accessed (620). Creators who pass level-gating proceed to Advance
Preference Compatibility Check (622). If the creator requires advance (607) as
a hard constraint (NOT negotiable, 609) AND the brand does not offer advances
(NOT 612), compatibility is FALSE (623) with reason code (624), and the pair is
removed from suggestions (625) and marketplace browse (626). Otherwise,
compatibility is TRUE (627). The system then computes additional matching
factors (628): ValuSkin match (629), price band overlap (630), trust score
contribution (631), follower audit score (632), and past completion rate (633).
These are combined into match_score (634) on a 0-100 scale. A deal_suggestions
record is created (635) with brand ID (636), creator ID (637), opportunity ID
(638), match score (634), match_factors JSON (639) including all sub-factors,
and advance_compatible flag (627). The record's status is set to "pending"
(640). Marketplace rendering (641) displays only level-gated (621) and
advance-compatible (627) opportunities to creators, sorted by match_score
(634), with visual badges indicating fit quality. Brands see ranked creator
lists per opportunity, filterable by level and trust score, with advance
compatibility indicators.
```

---

## REFERENCE TABLE FOR ALL DIAGRAMS

| Reference # | Component Description | Diagram |
|---|---|---|
| 101 | Creator Device | FIG.1 |
| 102 | Brand Device | FIG.1 |
| 201 | API Gateway Server | FIG.1 |
| 202 | Auth Handler | FIG.1 |
| 203 | Persona Handler | FIG.1 |
| 204 | Marketplace Handler | FIG.1 |
| 205 | Contract Handler | FIG.1 |
| 206 | Deal Room Handler | FIG.1 |
| 207 | Application Logic Server | FIG.1 |
| 208 | State Machine | FIG.1 |
| 209 | Scoring Engine | FIG.1 |
| 210 | Matching Engine | FIG.1 |
| 211 | Contract Generation | FIG.1 |
| 212 | Reputation Computation | FIG.1 |
| 213 | Credit Line Management | FIG.1 |
| 214 | PostgreSQL Database | FIG.1 |
| 215 | Users Table | FIG.1 |
| 216 | Personas Table | FIG.1 |
| 217 | Opportunities Table | FIG.1 |
| 218 | Deal Rooms Table | FIG.1 |
| 219 | Contracts Table | FIG.1 |
| 220 | Messages Table | FIG.1 |
| 221 | Signatures Table | FIG.1 |
| 222 | Benchmarks Table | FIG.1 |
| 223 | Audit Results Table | FIG.1 |
| 224 | Instagram OAuth Integration | FIG.1 |
| 225 | Meta Payment Rail | FIG.1 |
| 226 | External Audit Service | FIG.1 |
| 301 | Negotiation State | FIG.2 |
| 302 | Offer Acceptance Trigger | FIG.2 |
| 303 | Contract Generation (on acceptance) | FIG.2 |
| 304 | Rejection Path | FIG.2 |
| 305 | Template Synthesis | FIG.2 |
| 306 | Amount Field | FIG.2 |
| 307 | Deliverables Field | FIG.2 |
| 308 | Revision Cap Field | FIG.2 |
| 309 | Kill Fee % Field | FIG.2 |
| 310 | Exclusivity Days Field | FIG.2 |
| 311 | Content Hash | FIG.2 |
| 312 | Signature Storage | FIG.2 |
| 313 | Hash Match Verification | FIG.2 |
| 314 | Contract Pending State | FIG.2 |
| 315 | Creator Signature | FIG.2 |
| 316 | Brand Signature | FIG.2 |
| 317 | Expiry Check (7 days) | FIG.2 |
| 318 | Funded State | FIG.2 |
| 319 | Deliverable Hash | FIG.2 |
| 320 | In Progress State | FIG.2 |
| 321 | Revision Request State | FIG.2 |
| 322 | Completed State | FIG.2 |
| 323 | Payout | FIG.2 |
| 324 | Reputation Update | FIG.2 |
| 325 | Credit Line Repay | FIG.2 |
| 326 | Cancellation Path | FIG.2 |
| 327 | Kill Fee Trigger | FIG.2 |
| 328 | Kill Fee Amount Calculation | FIG.2 |
| 329 | Payment Rail Emission | FIG.2 |
| 401 | Offer Round Acceptance Trigger | FIG.3 |
| 402 | Contract Generation Engine | FIG.3 |
| 403 | Amount Input | FIG.3 |
| 404 | Currency Input | FIG.3 |
| 405 | Deliverable List Input | FIG.3 |
| 406 | Revision Cap Input | FIG.3 |
| 407 | Exclusivity Days Input | FIG.3 |
| 408 | Kill Fee % Input | FIG.3 |
| 409 | Usage Rights Input | FIG.3 |
| 410 | Deadline Input | FIG.3 |
| 411 | Template Selection | FIG.3 |
| 412 | Field Substitution | FIG.3 |
| 413 | Validation Logic | FIG.3 |
| 414 | PDF Generation | FIG.3 |
| 415 | Content Serialization (JSON) | FIG.3 |
| 416 | SHA-256 Hash Computation | FIG.3 |
| 417 | content_hash Output | FIG.3 |
| 418 | Database Storage | FIG.3 |
| 419 | Contract ID | FIG.3 |
| 420 | Deal Room ID Reference | FIG.3 |
| 421 | Contract Text Storage | FIG.3 |
| 422 | PDF URL Storage | FIG.3 |
| 423 | Created At Timestamp | FIG.3 |
| 424 | Creator Signature Record | FIG.3 |
| 425 | Brand Signature Record | FIG.3 |
| 426 | Creator Signer ID | FIG.3 |
| 427 | Brand Signer ID | FIG.3 |
| 428 | Creator Signature Timestamp | FIG.3 |
| 429 | Brand Signature Timestamp | FIG.3 |
| 430 | Creator Hash at Sign | FIG.3 |
| 431 | Brand Hash at Sign | FIG.3 |
| 432 | Creator Signature DB Insert | FIG.3 |
| 433 | Brand Signature DB Insert | FIG.3 |
| 434 | Tamper-Detection Verification | FIG.3 |
| 501 | Reputation Computation Trigger | FIG.4 |
| 502 | Input Data Collection | FIG.4 |
| 503 | Completed Deal Count | FIG.4 |
| 504 | Average Deal Value (cents) | FIG.4 |
| 505 | Ghosted Count | FIG.4 |
| 506 | Contract Revision Abuse Count | FIG.4 |
| 507 | Testimonial Average | FIG.4 |
| 508 | On-Time Delivery Rate | FIG.4 |
| 509 | Follower Audit Score | FIG.4 |
| 510 | Deterministic Score Calculation | FIG.4 |
| 511 | Base Score (50) | FIG.4 |
| 512 | Deal Count Contribution | FIG.4 |
| 513 | Ghosting Penalty | FIG.4 |
| 514 | Revision Abuse Penalty | FIG.4 |
| 515 | Follower Audit Contribution | FIG.4 |
| 516 | Testimonial Contribution | FIG.4 |
| 517 | On-Time Bonus | FIG.4 |
| 518 | Final Score (capped at 100) | FIG.4 |
| 519 | Level Assignment Logic | FIG.4 |
| 520 | Level 1 (Newcomer) | FIG.4 |
| 521 | Level 2 (Rising) | FIG.4 |
| 522 | Level 3 (Established) | FIG.4 |
| 523 | Level 4 (Expert) | FIG.4 |
| 524 | Level 5 (Legend) | FIG.4 |
| 525 | persona_levels Table Storage | FIG.4 |
| 526 | Persona ID (Storage) | FIG.4 |
| 527 | Last Computed Timestamp | FIG.4 |
| 528 | Reputation Export Trigger | FIG.4 |
| 529 | Export Payload Packaging | FIG.4 |
| 530 | Export Data Structure (JSON) | FIG.4 |
| 531 | Version Field | FIG.4 |
| 532 | Creator Persona ID (Export) | FIG.4 |
| 533 | Trust Scores (JSON) | FIG.4 |
| 534 | Testimonial Count | FIG.4 |
| 535 | Completion Rate | FIG.4 |
| 536 | content_hash (for export) | FIG.4 |
| 537 | Exported At Timestamp | FIG.4 |
| 538 | Content Hash Computation | FIG.4 |
| 539 | SHA-256 Result | FIG.4 |
| 540 | ED25519 Signing Process | FIG.4 |
| 541 | Platform Private Key | FIG.4 |
| 542 | ed25519_signature Output | FIG.4 |
| 543 | Signed Export Response | FIG.4 |
| 544 | reputation_exports Table | FIG.4 |
| 545 | Version Permanence (Forever Queryable) | FIG.4 |
| 546 | External Verification Request | FIG.4 |
| 547 | Platform Public Key | FIG.4 |
| 548 | Signature Verification | FIG.4 |
| 549 | Verification Result Output | FIG.4 |
| 601 | Matching Request Trigger | FIG.5 |
| 602 | Creator Profile Lookup | FIG.5 |
| 603 | Creator Current Level | FIG.5 |
| 604 | Creator Trust Score | FIG.5 |
| 605 | Creator Completed Deals | FIG.5 |
| 606 | Creator Advance Preferences | FIG.5 |
| 607 | Requires Advance Flag | FIG.5 |
| 608 | Advance Percentage | FIG.5 |
| 609 | Advance Negotiable Flag | FIG.5 |
| 610 | Opportunity Lookup | FIG.5 |
| 611 | Opportunity Required Level | FIG.5 |
| 612 | Brand Offers Advance Flag | FIG.5 |
| 613 | Brand Default Advance % | FIG.5 |
| 614 | Opportunity Category | FIG.5 |
| 615 | Level-Gating Check | FIG.5 |
| 616 | Match Blocked (Level) | FIG.5 |
| 617 | Level Insufficient Reason | FIG.5 |
| 618 | Hide from Marketplace | FIG.5 |
| 619 | Exclude from Suggestions | FIG.5 |
| 620 | Return 403 Forbidden | FIG.5 |
| 621 | Pass Level-Gating Gate | FIG.5 |
| 622 | Advance Compatibility Check | FIG.5 |
| 623 | Compatibility FALSE | FIG.5 |
| 624 | Hard Constraint Violation | FIG.5 |
| 625 | Remove from Suggestions | FIG.5 |
| 626 | Hide from Browse | FIG.5 |
| 627 | Compatibility TRUE | FIG.5 |
| 628 | Additional Matching Factors | FIG.5 |
| 629 | ValuSkin Match Factor | FIG.5 |
| 630 | Price Band Overlap | FIG.5 |
| 631 | Trust Score Factor | FIG.5 |
| 632 | Follower Audit Score | FIG.5 |
| 633 | Past Completion Rate | FIG.5 |
| 634 | match_score (0-100) | FIG.5 |
| 635 | deal_suggestions INSERT | FIG.5 |
| 636 | Brand Persona ID | FIG.5 |
| 637 | Creator Persona ID | FIG.5 |
| 638 | Opportunity ID | FIG.5 |
| 639 | match_factors JSON | FIG.5 |
| 640 | Status: "pending" | FIG.5 |
| 641 | Marketplace Rendering | FIG.5 |

---

## INTEGRATION NOTES

All five diagrams are designed for patent filing and specification reference:

1. **FIG.1** shows system-wide architecture compatible with Meta integration.
2. **FIG.2** demonstrates the core deal state machine that eliminates manual intervention and ensures deterministic progression.
3. **FIG.3** illustrates the cryptographic contract mechanism that prevents tampering and ensures legal bindingness.
4. **FIG.4** shows how reputation scoring is deterministic (no randomness) and portable (externally verifiable).
5. **FIG.5** explains the matching engine with level-gating and advance compatibility filters.

Each diagram uses reference numbers (100s-600s series) consistent with patent conventions. All diagrams are black-and-white line drawings suitable for printed patent documents. Every component referenced in the diagrams is explained in the written specification (FORM_2_PROVISIONAL_SPEC.md).
