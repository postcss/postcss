# How PostCSS Handles Incidents

## 1. Detection & Triage

We monitor security reports sent via [security outreach](./SECURITY.md), GitHub advisories, issues, and npm notifications.

## 2. Assessment

Check the severity:

- **Critical:** npm package or repo compromised, malicious code, supply chain attack.
- **High:** Vulnerabilities that allow code execution, or leak secrets.
- **Low:** Denial of service or memory leaks when PostCSS is used as a server-side REPL that receives CSS from third parties.

## 3. Response

1. Acknowledge the report (privately if sensitive, publicly if not).
2. For critical/high issues:
   1. Deprecate or yank affected npm versions if needed.
   2. Rotate any exposed secrets/tokens.
   3. Patch the bug or vulnerability.
3. For low issues: patch and document the fix.

## 4. Communication

We will publish update in our Twitter `@postcss` and PostCSS’s wiki.

We will release CVE for Critical/High issues. We prefer to not release CVE for Low issues since we have small number of such users (but could change our minds depends on the issue).
