# React Form Builder (App)

A modern drag-and-drop form builder app built with React 19, Material UI, and JSON Forms. Visually design forms, preview them live, and export JSON Schema + UI Schema.

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-6-blue.svg)](https://mui.com/)
[![JSON Forms](https://img.shields.io/badge/JSON%20Forms-3.6-green.svg)](https://jsonforms.io/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Screenshots

Add images under `docs/screenshots/` and reference them here:

![Builder UI](docs/screenshots/builder.png)
![Live Preview](docs/screenshots/preview.png)

## Quick Start

```bash
# Install dependencies
yarn install

# Configure environment (optional)
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL if needed

# Start development server
yarn dev
# Open http://localhost:3000
```

## Use as a Component (Library)

Install into another project and import the component:

```bash
yarn add poc-form-builder
# or
npm install poc-form-builder
```

```jsx
import React from 'react';
import { FormBuilder } from 'poc-form-builder';

export default function MyPage() {
  return <FormBuilder />;
}
```

Notes:
- Peer deps: React and ReactDOM (>=18) and UI/libs (@mui, @jsonforms, @dnd-kit, @emotion), icons (`@tabler/icons-react`), and i18n (`react-i18next`, `i18next`) must be installed in the host app.

### Props
- **`onSchemaChange(schema, uiSchema)`**: Called whenever the builder’s schema or UI schema changes.
- **`onExport({ schema, uiSchema })`**: If provided, overrides default JSON download and delivers the export payload to your handler.
- **`theme`**: Custom MUI theme instance to style the builder.
- **`schemas`**: Custom list of sample templates `{ id, name, description?, schema }` used by the template picker and loader.

Example with multiple props:

```jsx
import { FormBuilder } from 'poc-form-builder';

function handleSchemaChange(schema, uiSchema) {
  console.log('schema updated', schema);
}

function handleExport({ schema, uiSchema }) {
  // Persist to server or file
}

export default function MyPage() {
  return (
    <FormBuilder
      onSchemaChange={handleSchemaChange}
      onExport={handleExport}
      schemas={[
        {
          id: 'simple',
          name: 'Simple Example',
          description: 'Minimal schema with two fields',
          schema: {
            type: 'object',
            properties: {
              firstName: { type: 'string', title: 'First Name' },
              age: { type: 'number', title: 'Age' }
            },
            required: ['firstName']
          }
        }
      ]}
    />
  );
}
```


## Architecture

```
src/
  components/           # UI components (builder, preview, editor)
  controls/             # JSON Forms custom renderers/cells
  __tests__/            # Unit tests (Vitest + RTL)
  test/setup.js         # Vitest setup
  types.js              # Field type definitions
  utils/                # Helpers and translations
  App.jsx               # Root app component (library)

dev/
  main.jsx              # Dev-only Vite entry
  index.css             # Dev-only styles
```

## Development

```bash
# Lint
yarn lint

# Format
yarn format

# Test
yarn test

# Build
yarn build
```

## Publishing

Release and publish are automated via GitHub Actions. Follow these steps:

- Prerequisites:
  - Add `NPM_TOKEN` as a GitHub repository secret (Settings → Secrets and variables → Actions).
  - Ensure `publishConfig: { access: 'public' }` exists in `package.json`.
  - Confirm the package name is unique and you have permission to publish under your npm scope.

- Version and changelog:
  - Update `package.json` `version` using semantic versioning.
  - Update `CHANGELOG.md` with notable changes.

- Tag and push to trigger the release workflow:

```bash
git pull
# bump version (choose one)
npm version patch
# or: npm version minor
# or: npm version major
# pushes commit and tag
git push origin main --follow-tags
```

- What happens next:
  - The workflow at `.github/workflows/release.yml` runs on tags `v*.*.*`.
  - Builds the library and publishes to npm using `NPM_TOKEN`.
  - Creates a GitHub Release attaching `dist/index.js` and `dist/index.umd.cjs`.

- Manual publish (fallback):

```bash
# ensure you are logged in to npm or have NODE_AUTH_TOKEN exported
npm publish --access public
```

If the CI publish fails, check the Action logs and verify the `NPM_TOKEN` secret and tag format.

## Features

- Drag & Drop builder with nested layouts
- Live preview with JSON Forms
- Property editor for field configuration
- Schema editor (JSON Schema & UI Schema)
- Export/import schemas

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and [SECURITY.md](SECURITY.md).

## License

MIT — see [LICENSE](LICENSE).

## Acknowledgments

- [React](https://reactjs.org/) — UI Framework
- [Material UI](https://mui.com/) — Component Library
- [JSON Forms](https://jsonforms.io/) — Schema-based Forms
- [@dnd-kit](https://dndkit.com/) — Drag and Drop Toolkit
