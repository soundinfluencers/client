# Guided campaign flow implementation plan

> **For agentic workers:** Use superpowers:subagent-driven-development for the independent server task and review. Execute the frontend and integration work in this session.

**Goal:** Let clients save a brief, understand and choose complete recommendations, see the current cost and audience, and continue to content without asking what to do next.

**Architecture:** The campaign draft remains the saved source of truth. Structured search metadata supplies complete bundle cards; the UI owns visible progress and the next action. Backend recommendations use the full matching pool and geographical audience when available, without claiming followers are reach.

**Tech stack:** React 19, TypeScript, React Query, SCSS; NestJS, Mongo aggregation, Jest. Node's test runner for dependency-free frontend model tests, browser checks for integrated UI behavior.

**Spec:** The audit and proposed fixes in the conversation, approved by the user's “Працюй”.

## Global constraints

- Preserve all existing uncommitted work. Do not commit, reset, deploy, change secrets, or modify live campaign records during verification.
- Keep changes in the existing feature checkouts because they contain the integrated, uncommitted AI implementation. Baseline snapshots are in `D:/SoundInfluencers/tmp/ai-campaign-flow-20260916/baseline`.
- Never label summed followers as measured or unique reach. Country share means audience in the applied search countries, not genre affinity.
- Dates explicitly supplied in the brief must survive selection. Flexible timing may default to ASAP.
- A failed search must retain the saved brief and permit retry. Pending selections must not be lost when navigating to Content.
- Existing content and selected pages survive brief edits. No automatic replacement or payment.
- UI language remains English to match the existing application; assistant replies continue in the client's language. Full application localization is outside this repair.

## Task 1: Backend recommendation quality and structured bundles

Files: server `search-accounts.tool.ts`, `ai-agent.service.ts`, `agent-prompt.service.ts`, profile search implementation/DTO and their regression specs.

Contract: `AgentSearchOutcome` retains existing fields and optionally adds `countries: string[]`, `bundles: {name: 'best_value'|'max_reach'; pages: AgentSearchCandidate[]; total: number; currency: string; followers: number}[]`. Every bundle page has normal candidate fields including EUR price so the client can add it without loading another result page. Bundle totals are the sum of displayed converted prices. Preserve compatibility with the existing tool bundle fields.

- [x] Add failing regressions proving a page outside the visible 50 can enter a bundle, the bundle remains stable across result pages, and geographical audience changes ranking when countries are requested.
- [x] Build bundles over the full matching roster using a dedicated lean candidate pool; retain existing result pagination. Respect the campaign's supported page count.
- [x] Expose complete structured bundle pages, followers and applied countries through the chat response and keep bundle account refs usable in conversation state.
- [x] Update prompt guidance: five highlights are examples, full package is in Pages, followers are not reach, explain a concrete tradeoff and one next action.
- [x] Run covering Jest tests and server build. Report changes and evidence to `tmp/ai-campaign-flow-20260916/backend-report.md`.

## Task 2: Frontend selection and navigation

Files: `src/widgets/ai-chat/ui/ai-chat.tsx`, `campaign-workspace-panel.tsx`, `campaign-plan-section.tsx`, `ai-campaign-draft-card.tsx`, relevant SCSS, API metadata types, and small new selection model/components.

- [x] Add model regressions with literal fixtures: saved page €50/1000 followers plus pending page €30/2000 gives €80/3000/2 pages; an already-added page is not double counted; explicit date `2026-10-01` is retained and Flexible maps to ASAP.
- [x] Render complete bundle cards with followers, price, geographic meaning and full included-page details; permit adding every bundle member even outside the visible candidate batch.
- [x] Show a sticky current-selection summary with budget target/difference and summed followers. Keep pending and saved selection states clear, selectable excluded pages distinct from unavailable ones.
- [x] Save complete brief then open Pages with a visible pending/error/success state and Retry. Handle normal-chat search results, not only automatic brief requests.
- [x] Show Next: add content, flush pending additions and saves before navigation, and make the remaining step explicit in the rail. Preserve brief date defaults and preview block spacing.
- [x] Verify model tests, client typecheck/build and browser flows including pending save, failure retry, full bundle, selection totals, date inheritance and content continuation.

## Task 3: Review and delivery

- [x] Review diffs against pre-task snapshots; preserve unrelated work.
- [x] Attempt independent review of backend and frontend contracts/edge cases; reviewer hit a usage limit. Completed review locally and fixed findings; see final QA report.
- [x] Run final affected tests/builds after fixes. Record any pre-existing failures separately.
- [x] Deliver a concise summary of implemented behavior, checks and any remaining limits; no deployment implied.
