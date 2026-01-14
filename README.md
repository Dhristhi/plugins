# Dhristhi Community Plugins

Dhristhi-maintained tools and packages. This repository hosts multiple workspaces such as libraries and ui components.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## What is this repository?

This is a monorepo for collaborating on frontend and backend plugins and tooling. It separates package maintenance from app-specific repos and provides shared workflows for building, testing, and publishing.

## Workspaces Workflow

This repository uses Yarn workspaces. Each workspace (package/app) has its own build and test scripts, versioning, and publishing process.

- Build, test, and lint are run per workspace.
- Publishing is done from each package directory (see package README for steps).

## Packages

- Form builder: [packages/react-form-builder](packages/react-form-builder) — `@dhristhi/react-form-builder`

## Quick Start

Requirements: Node ≥ 18, Yarn Classic (1.x).

```bash
# Install dependencies
yarn install

# Start the demo app (Vite)
yarn dev
# Opens http://localhost:5173
```

## Contributing a Plugin

We welcome new workspaces (libraries, tools, examples). Please review:

- [CONTRIBUTING.md](CONTRIBUTING.md) — contribution guidelines and workspace setup
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) — community standards
- [SECURITY.md](SECURITY.md) — reporting vulnerabilities

To create a new workspace, follow the patterns in [packages/react-form-builder](packages/react-form-builder) and add your package under `packages/` with its own `package.json`, `src/`, and README.

## Support

Open an issue in this repository with details and steps to reproduce.

## License

MIT — see [LICENSE](LICENSE).
