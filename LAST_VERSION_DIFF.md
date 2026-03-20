# Last Version Diff

Comparison:
- Previous version: `0f710c0`
- Current version: `e136146`

## What changed
- Enforced required scripting mode selection in campaign creation.
- Added required fixed script text when mode is `non_negotiable`.
- Propagated campaign scripting fields into opportunity/deal flow.
- Added creator-visible scripting details in details/formal sections.
- Added chatroom `Script` editor controls and dual approval actions (`I approve`) for negotiating modes.
- Added approval gate before formal offer submission for negotiable scripting modes.
- Added/updated shared typing for campaign scripting fields.

## Files changed in current version
- `frontend/src/app/demo/tiktok/page.tsx`
- `frontend/src/app/demo/linkedin/page.tsx`
- `frontend/src/app/demo/youtube/page.tsx`
- `frontend/src/lib/useDealSync.ts`
