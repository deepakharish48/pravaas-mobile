# Pravaas PR Review Agent

## What it does

The GitHub Actions workflow `.github/workflows/pr-review-agent.yml` runs on pull requests and pushes to `main`. It performs repeatable repository checks (web lint, API TypeScript check, mobile TypeScript check, and web production build) and publishes the results as required-to-inspect CI checks.

The companion eval set is `docs/quality/pravaas-eval-set.json`. It defines product acceptance scenarios and identifies which ones still need unit, integration, browser, or device automation.

## Review policy

For every PR, a human or future AI reviewer should inspect:

1. Correctness against the stated acceptance criteria and eval cases.
2. Authorization, validation, privacy, and secret handling—especially hotel, guest, C-form/KYG, and booking data.
3. Loading, empty, error, and success states; responsive behavior and accessibility.
4. Feature-flag enabled/disabled behavior and safe defaults.
5. Regression risk, data migrations, configuration changes, and rollback considerations.
6. Whether the PR description states what was tested and what remains unverified.

Report findings with severity (P0 blocker, P1 high, P2 normal, P3 low), file/line, impact, and a concrete reproduction or fix. Avoid speculative findings and style-only noise.

## Automation boundaries

- CI checks are deterministic gates, not proof that every feature works end-to-end.
- The current workflow does not call an LLM and does not automatically approve or merge PRs.
- The eval JSON is a curated acceptance checklist; it becomes executable only as matching tests are implemented.
- No deployment, production data, external paid API, or real guest data should be used by CI.
- A green build does not replace manual review of security-sensitive changes.

## Next increments

1. Add test runner and focused unit tests for high-risk business rules.
2. Add API integration tests using isolated test data/database.
3. Add Playwright smoke tests for authentication, saved itineraries, booking, feature flags, and branding once stable test fixtures exist.
4. Add visual regression checks after the canonical logo asset and page baselines are approved.
5. Only consider an LLM-based reviewer after deterministic checks are reliable; require human approval for merge.
