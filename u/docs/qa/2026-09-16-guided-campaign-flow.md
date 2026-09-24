# Guided campaign flow — implementation and verification

Completed locally on 2026-09-16. Changes are uncommitted and have not been deployed.

## Delivered behavior

- Saving a complete brief opens Pages and starts recommendations with a visible loading state. Failures retain the brief and show a retry action. Incomplete briefs identify missing fields.
- Recommendations show complete packages, their cost and summed followers. All package members can be included, including members outside the visible result batch. Individual checkboxes update the actual draft selection.
- A sticky selection summary shows selected pages, EUR cost, combined followers and the budget difference. Foreign-currency comparisons use the search's conversion metadata when available.
- Country percentages are explicitly described as audience in the selected countries. Summed followers are not described as measured or unique reach; overlapping audiences are acknowledged.
- Next: add content saves the selection before navigation. Failed saves block navigation and permit retry. Earlier save responses cannot overwrite newer local choices, including reverting a choice while its previous value is in flight.
- Explicit brief dates survive page selection through both the UI and chat tools. Adding a package through chat preserves existing pages, publishing details and content.
- Reply previews retain spaces between HTML blocks. Excluded pages are visually distinct from unavailable pages.
- Budgeted packages use the entire matching roster rather than only the current result page, with a 50-page campaign limit. Targeted searches rank using followers weighted by the requested countries' audience share. The assistant is instructed to explain one concrete tradeoff and one next action, and to distinguish five highlights from the complete package.

## Verification

| Check | Result |
| --- | --- |
| Server regressions: profile search, agent orchestration/prompts, search/create/update/content/finalize tools | 115 tests passed across 8 suites |
| Frontend selection model | 9 tests passed |
| Browser integration using the actual AiChat component and intercepted API fixtures | Passed brief save, loading, full package inclusion, totals, dates, content transition, deselection, search retry, save retry and concurrent-edit scenarios; no runtime errors |
| Production frontend build | Passed; existing large-asset/chunk warnings remain |
| NestJS backend build | Passed |
| Frontend TypeScript | 378 existing diagnostics; final output exactly matches the saved baseline |
| Whitespace and visual review | No diff whitespace errors; desktop and mobile screenshots inspected |

Browser checks used controlled API responses and did not modify live campaigns. The independent review attempt was unavailable due to a usage limit; final review was performed in the implementation session. That review added regressions and fixes for currency rounding, date/content preservation and save ordering.

## Reproducing frontend checks

From `client/u` with Node 24 and installed client/server dependencies:

```powershell
node --test tests/campaign-selection.test.mjs
npm run dev -- --host 127.0.0.1 --port 4186 --strictPort
```

While that test server is running, in a second terminal from `client/u`:

```powershell
node tests/campaign-flow.browser.cjs
npm run build
```

The browser test uses Puppeteer from the sibling server's dependencies. Its fixture supplies a test API base URL and intercepts those requests.

## Limits and next quality work

- No live model evaluation or production deployment was performed. Prompt and ranking changes are verified through deterministic tests; they do not establish a measured improvement in live-model quality.
- Recommendation quality remains constrained by roster data. Follower counts and geographical share are useful signals, but do not predict actual campaign performance. Evaluating engagement, audience overlap or conversions requires reliable additional data.
- The full candidate pool is a lean Mongo aggregation facet. Very large future rosters may require a streaming or bounded-candidate approach; production-scale load testing was not part of this repair.
- A useful next evaluation set is a fixed collection of realistic briefs, scored for required-field handling, geographic and genre relevance, budget consistency, preservation of prior edits, clear next actions and successful progression to content.

Logs, baseline snapshots and screenshots are in `D:/SoundInfluencers/tmp/ai-campaign-flow-20260916`. Pre-existing unrelated work was retained.
