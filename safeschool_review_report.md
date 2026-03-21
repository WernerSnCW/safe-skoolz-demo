# SafeSchool v0.3 — Full Application Review
**6 specialist reviews across Security, Architecture, Data Privacy, UX/Accessibility, API Contract, and Safeguarding Workflow**

---

## 1. SECURITY AUDIT — FAIL

### CRITICAL
- **Demo login bypass**: `POST /api/auth/demo-login` is public and issues valid JWTs for real users with no environment gate. Any attacker can get coordinator/PTA access.

### HIGH
- **Cross-tenant staff data exposure**: `GET /schools/:schoolId/staff` doesn't verify the caller's own school, allowing IDOR to read another school's staff PII.
- **Cross-tenant incident tampering**: Protocol creation updates linked incidents without school scoping.
- **Public pupil enumeration**: Unauthenticated endpoints expose pupil names and classes.
- **Weak JWT secret default**: Hardcoded fallback secret if env var missing.

### MEDIUM
- No rate limiting on login, newsletter, or any endpoints.
- Newsletter 409 response reveals whether an email is registered.
- No password complexity policies enforced.
- Audit logging incomplete for PIN resets, SENCO actions, messaging.

### PASS
- PTA dashboard anonymisation is correct — aggregate counts only, no PII.
- No SQL injection found (parameterized queries throughout).

---

## 2. ARCHITECTURE & CODE QUALITY — FAIL

### CRITICAL
- **TypeScript build broken**: `api-zod` has duplicate exports; api-server has 41 type errors. Packages are out of sync.

### HIGH
- **Database indexing**: Many query-critical columns have no indexes (schoolId, status, timestamps). UUID arrays lack GIN indexes.
- **API inconsistency**: `GET /pta/report/generate` creates data (should be POST). Response shapes vary (`{data}` vs raw objects).
- **Monolithic route files**: dashboard.tsx (1843 lines), incidents.ts (598), pta.ts (544) — hard to test and maintain.
- **Type safety erosion**: Widespread `any` casts throughout API routes.
- **Unbounded queries**: Several dashboard endpoints fetch all data with no pagination.

### MEDIUM
- No centralised error handling middleware.
- Silent async failures (pattern detection errors swallowed).
- Schema field naming mismatch: `parentOf` vs `childIds` causes broken logic.

---

## 3. DATA PRIVACY & COMPLIANCE — FAIL

### CRITICAL
- **Child data exposed publicly**: Pupil names/classes accessible without auth.
- **Demo login mints tokens for real users**: Full data access without credentials.

### HIGH
- **No data retention policy**: Incidents, audit logs, behaviour data stored indefinitely with no purge/anonymisation workflow.
- **No field-level encryption**: Incident narratives, staff notes, witness statements stored as plaintext.
- **Audit trail gaps**: Many sensitive operations not logged (behaviour points, SENCO, messaging, PIN resets).
- **LOPIVI partial compliance only**: Structures exist but confidentiality/access-control expectations not met.

### MEDIUM
- Parent visibility (`parentVisible`) is mostly enforced but has a logic bug using wrong field name.
- Teacher/head_of_year can access alerts with victim names beyond need-to-know.
- Newsletter consent captures boolean only — missing policy version, IP, consent source for stronger proof.

### PASS
- PTA dashboard returns aggregate data only — no PII leak.
- Passwords and PINs are properly hashed with bcrypt.

---

## 4. FRONTEND UX & ACCESSIBILITY — FAIL

### HIGH
- **Missing ARIA labels**: Icon-only buttons (mobile menu, close buttons) have no accessible names. Custom tabs lack proper semantics.
- **No error announcements**: Error banners don't use `aria-live` for screen readers.
- **Charts inaccessible**: No text alternatives or data tables for chart-heavy screens.
- **Report incident silent failure**: Submit error only logs to console, no user-visible feedback.
- **Oversized components**: dashboard.tsx (1843 lines), report-incident.tsx (873), pta.tsx (775) — performance and maintenance risk.

### MEDIUM
- Mobile login tabs show icons only (labels hidden on small screens).
- Long analytics dashboards feel cramped on mobile.
- Inconsistent design system split (`ui-polished` vs `ui/*`).
- "Show me around" demo label is ambiguous — doesn't clearly say "demo login".

### LOW/PASS
- Child-friendly language is well done throughout pupil-facing UI.
- Loading states present on most pages.
- Newsletter form is clear and trustworthy.

---

## 5. API CONTRACT — FAIL

### HIGH
- **Major spec drift**: OpenAPI defines 38 operations but server has 79 routes. 41 endpoints are undocumented (messages, SENCO, behaviour, newsletter, demo-login, etc.).
- **Inconsistent validation**: Some routes use Zod, others use manual checks, some skip validation entirely.
- **Schema drift**: Route logic references fields not in generated Zod schemas.

### MEDIUM
- Error response shapes vary (`{error}`, `{message}`, `{success}`, `{locked, attemptsRemaining}`).
- `GET /pta/report/generate` is a side-effecting GET (should be POST).
- CORS allows all origins — too permissive for production.
- Invalid query params silently fall back to defaults instead of returning 400.

### LOW
- Pagination exists on core spec'd endpoints.
- Content-type handling is correct globally.

---

## 6. SAFEGUARDING WORKFLOW — FAIL

### CRITICAL
- **No mandatory referral enforcement**: No automatic trigger for Tier 3 incidents, sexual/coercive cases, or repeat red alerts. External referral is a manual boolean only — the system doesn't require it.
- **Broken parent notification**: Uses `childIds` instead of schema field `parentOf`, so linked parents may never be notified of incidents.
- **Combined child-risk gap**: Missed referrals + missed parent alerts creates real safeguarding risk.

### HIGH
- **Incident lifecycle not enforced**: States exist but transitions aren't controlled (no workflow state machine).
- **Escalation tier enforcement weak**: Tiers defined but only Tier 3 triggers notifications. Category matching is exact/case-sensitive.
- **Audit gaps**: SENCO caseload, behaviour points, and tracking changes not audited.
- **Alert visibility too broad**: Teachers can see all school alerts including victim names beyond their need-to-know.

### MEDIUM
- Protocol types (LOPIVI, Convivèxit, Machista) accepted as free text — no validation or type-specific handling.
- Pattern detection rules are narrow (could miss category variants).
- SENCO caseload lacks integrated risk/protocol/alert linkage.

### PASS
- Behaviour escalation 7 levels correctly implemented with correct thresholds.
- PTA oversight is properly anonymised.

---

## Priority Action Summary

### Immediate (Security/Safety)
1. Disable or gate `demo-login` behind environment flag
2. Remove hardcoded JWT secret fallback — require env var
3. Add auth to public pupil/school endpoints
4. Fix parent notification field (`parentOf` not `childIds`)
5. Add rate limiting on auth and newsletter endpoints

### Short-term (Compliance/Quality)
6. Fix cross-tenant IDOR on staff and protocol endpoints
7. Implement mandatory referral triggers for Tier 3/sexual/coercive
8. Add database indexes on key query columns
9. Complete audit logging for all sensitive operations
10. Fix TypeScript build errors and regenerate API client

### Medium-term (UX/Architecture)
11. Add ARIA labels, keyboard semantics, chart alternatives
12. Split monolithic page components (dashboard, PTA, report)
13. Document all 79 API endpoints in OpenAPI spec
14. Standardise error responses and validation patterns
15. Implement data retention policies
