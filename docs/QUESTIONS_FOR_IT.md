# Leyton Arena — Questions for IT / Data (Galileo integration)

Companion to `PRODUCTION_MASTER_PROMPTS.md`. Resolve these **before running
Phase 2 (Galileo data layer)**. Grouped by topic; each has a "why it matters"
so IT can see the impact of the answer. Suggested defaults are marked → we'll
use them unless told otherwise.

---

## 1. Access & connectivity

- [ ] **How do we read Galileo?** Read-replica DB connection, a REST/GraphQL
  API, a data warehouse mirror, or scheduled extracts (CSV/Parquet)?
  → *Preferred: read-replica or warehouse mirror — never the primary.*
  *Why:* determines the adapter implementation and load profile.
- [ ] **Where does Arena run**, and is there network line-of-sight to that
  source (VPC peering, private link, allow-listed egress)?
- [ ] **Credentials:** what service account / secret do we use, and which
  vault do we pull it from at runtime? Rotation policy?
- [ ] **Read-only guarantee:** can IT confirm the account has **no write**
  access to Galileo? Arena never writes back.
- [ ] **Rate/volume limits** on the source we should design the ingest around.

## 2. Entity & field mapping

We need to map Galileo entities to Arena's canonical model. For each, what is
the Galileo table/endpoint + field?

- [ ] **Consultant** → id, full name, work email (join key), role
  (Technical/Financial equivalent), office/location, seniority, line manager,
  start date, active/leaver flag.
  *Why:* email is how SSO identity links to delivery data.
- [ ] **Claim / engagement** → unique id, owning consultant, client name/id,
  current workflow stage, and **stage-change history with timestamps**.
  *Why:* the daily-fire streak needs per-day stage-advance events.
- [ ] **Invoice** → claim/consultant, amount (£), invoice date.
  *Why:* drives invoiceValue and the "% invoiced before day 15" metric.
- [ ] **Ops / deliverables** → what counts as an "Op delivered" in Galileo,
  and how is it dated?
- [ ] **Days-to-close** → which two dates define it (contract/handover start →
  first invoice)?
- [ ] **Client retention flags** → does Galileo hold anything equivalent
  (churn, at-risk, complaint)? If not, we drop this metric or source it
  elsewhere.

## 3. Workflow stages (fire streak)

- [ ] Do Galileo's stages match Arena's 10-stage model, and in what order?
  ```
  Handover completed → Overview completed → First Scoping → Scoping completed →
  Technical Report drafted → Technical Report reviewed → Costs Received →
  Assessment drafted → Assessment reviewed → Invoiced
  ```
  → *If names differ, provide the mapping (Galileo stage → Arena stage).*
- [ ] Is there a **timestamped audit log** of stage transitions we can read?
  *Why:* "did this consultant advance ≥1 claim by a stage today?" is the whole
  basis of the daily fire. Without transition timestamps we can't compute it.
- [ ] Can stages move **backwards**, and should a backward move count against
  a streak?

## 4. Planning discipline (push / pull) — needs sign-off

The core insight is push vs pull behaviour. We derive it from **target
delivery date movements**. Confirm the source and rules:

- [ ] Does a claim carry a **planned / target delivery (or invoice) month**,
  and is its **history of changes** available with timestamps?
  *Why:* pushed/pulled is defined by that date moving.
- [ ] Proposed definitions (please confirm or correct):
  - **Pushed** = target delivery month moved **later** than originally planned.
  - **Pulled** = target delivery month moved **earlier** (delivered ahead).
  - **Late-week push** = a push recorded in the **final 5 calendar days** of the
    month (the "worst pattern").
  - **Planning accuracy** = 1 − (pushed ops ÷ planned ops) over the window.
- [ ] Baseline: which snapshot is "the plan"? (start-of-month commit,
  quarter-start forecast, or the first recorded target?)
- [ ] Any legitimate reasons a date moves that we should **exclude** (client
  hold, scope change, HMRC deadline shift) so we don't penalise the wrong
  people?

## 5. History, freshness & timezone

- [ ] **How much history** can we pull? (Insights baselines and seasons want
  ≥12 months; the spike analysis wants ≥4 quarters.)
- [ ] **Refresh cadence** we can rely on — is nightly ingest acceptable, or do
  parts need near-real-time (e.g. live leaderboard, duels)?
  → *Default: nightly full/incremental ingest + on-demand admin refresh.*
- [ ] **Timezone / working calendar** for "today" and "day 15 / last 5 days"
  (company TZ, office-local, UK working days)?
- [ ] Preferred **incremental** strategy (updated-since watermark vs full
  reload) and any change-data-capture available.

## 6. Identity & SSO

- [ ] Which IdP — **Azure AD or Okta** — and can we register an OIDC app
  (redirect URIs, client id/secret, issuer)?
- [ ] Which **claim carries the work email** that matches Galileo's consultant
  record? Any consultants whose SSO email ≠ Galileo email (edge cases)?
- [ ] How do we source **role, office, and manager** — from SSO claims, from
  Galileo, or an HR system? Which wins on conflict?
- [ ] How are **leavers/joiners** reflected so the roster stays accurate?

## 7. Governance, privacy & security

- [ ] **Data classification** of the fields we surface, and who is allowed to
  see whom. (Consultants see self; managers see their team; admins see all —
  confirm this matches policy.)
- [ ] Is per-consultant **performance visibility to peers** (leaderboards)
  acceptable under HR / works-council / GDPR rules? Any fields that must be
  hidden or aggregated?
- [ ] **Retention**: how long may we keep ingested data in Arena's Postgres?
- [ ] **Audit**: what admin actions must be logged for compliance?
- [ ] **DPIA / security review**: who signs off before go-live, and what's the
  lead time?

## 8. Environments, hosting & ops

- [ ] Where does Arena get **deployed** (company cloud/platform), and what's
  the provisioning path for the app + a Postgres instance?
- [ ] **Non-prod data:** can we get a Galileo test/sandbox source, or do we use
  seeded/synthetic data in staging? (Prompts support `DATA_SOURCE=seed`.)
- [ ] **Secrets management** standard (vault), **CI/CD** platform, and
  **error-tracking / monitoring** standard to wire the ingest alerts into.
- [ ] Any mandated **framework/language/cloud** constraints that override the
  proposed Next.js + Postgres stack?

## 9. Outbound integrations

- [ ] Are **Teams incoming webhooks** (milestones, manager nudges) allowed, and
  how do we obtain the channel URL?
- [ ] Approved **outbound email** path (company SMTP / Graph / SendGrid) for
  notifications and redemption updates?

## 10. Rewards operations (for the budget ask)

- [ ] Who **fulfils** redemptions operationally, and can Arena hand off to an
  existing perks/procurement system, or is it manual approval in Admin?
- [ ] Any finance controls needed around the points→rewards spend (caps,
  approvals, reporting)?

---

### Minimum unblock set

To start Phase 2 we specifically need: **(1)** a read path to Galileo + service
creds, **(2)** the Consultant + Claim-stage-history + Invoice field mappings,
and **(3)** confirmation of the push/pull date-movement rules in §4. Everything
else can follow in parallel.
