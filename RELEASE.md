# Release Checklist

Use this checklist before tagging a new release.

- [ ] Update `package.json` version using semver (`patch` | `minor` | `major`).
- [ ] Update `CHANGELOG.md` with changes, date, and version.
- [ ] Verify tests and build pass locally:
  - `yarn test --run`
  - `yarn build`
- [ ] Ensure README publish steps are accurate for this release.
- [ ] Confirm `publishConfig: { access: 'public' }` exists in `package.json`.
- [ ] Ensure `NPM_TOKEN` GitHub secret is set.
- [ ] Review CI statuses on `main`.

Tag and push to trigger release:

```bash
# example for minor bump
npm version minor
git push origin main --follow-tags
```

If CI fails, inspect the Action logs, check tag format `vX.Y.Z`, and ensure registry/auth settings are correct.
