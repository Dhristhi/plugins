# Security Policy

## Supported Versions

We aim to keep `main` stable. Report vulnerabilities against the latest commit or the latest tagged release.

## Reporting a Vulnerability

- Please email security reports to office@dhristhi.com.
- Do not open public issues for security vulnerabilities.
- Include details to reproduce, potential impact, and any available patches or mitigations.

We will acknowledge receipt within 72 hours, investigate, and provide guidance on remediation and disclosure timelines.

## Best Practices in This Repo

- Environment variables are used for API endpoints. See `.env.example`.
- Secrets should never be committed. `.gitignore` excludes `.env` files.
- Dependencies are pinned via `yarn.lock`.

## Disclosure

We follow responsible disclosure. After a fix is available, we will publish a security advisory with CVE details if applicable.
