# React Form Builder — @dhristhi/form-builder

A modern drag-and-drop form builder built with React 19, Material UI, and JSON Forms. Design forms visually, preview them live, and export JSON Schema + UI Schema.

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-6-blue.svg)](https://mui.com/)
[![JSON Forms](https://img.shields.io/badge/JSON%20Forms-3.6-green.svg)](https://jsonforms.io/)
[![npm](https://img.shields.io/npm/v/%40dhristhi%2Fform-builder.svg?logo=npm&color=cb3837)](https://www.npmjs.com/package/@dhristhi/form-builder)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Screenshots

Coming soon.

## Quick Start

- Requirements: Node ≥ 22, Yarn Classic (1.x) workspaces.

Install dependencies and start the demo app:

```bash
yarn install
yarn dev
# Opens http://localhost:5173 (Vite demo)
```

Build and test the library package:

```bash
# Build the library
yarn workspace @dhristhi/form-builder build

# Run unit tests (vitest)
yarn workspace @dhristhi/form-builder test

# Lint all workspaces
yarn lint
```

## Use in Your App

Install and import the component:

```bash
yarn add @dhristhi/form-builder
# or
npm install @dhristhi/form-builder
```

```jsx
import React from 'react';
import { FormBuilder } from '@dhristhi/form-builder';

export default function MyPage() {
  return <FormBuilder />;
}
```

Peer dependencies expected in the host app:

- React and ReactDOM (≥ 18)
- @mui/material, @mui/icons-material, @mui/system (≥ 6)
- @jsonforms/core, @jsonforms/react, @jsonforms/material-renderers (≥ 3.6)
- @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/modifiers (≥ listed versions)
- @emotion/react, @emotion/styled
- @tabler/icons-react
- i18next and react-i18next

## API & Extensibility

### Exports

- FormBuilder — main component
- registerFieldTypes, getFieldTypes, getFieldTypeById — field registry helpers
- configureControls — add/enable/disable JSON Forms renderers

### Register Custom Field Types

```js
import { registerFieldTypes } from '@dhristhi/form-builder';

registerFieldTypes([
  {
    id: 'my-custom',
    label: 'My Custom',
    isLayout: false,
    schema: { type: 'string' },
    uischema: { type: 'Control', options: { placeholder: 'Custom' } },
    // icon: Optional React component
  },
]);
```

### Configure Controls (Renderers)

Enable/disable built-in custom controls and add your own JSON Forms renderers:

```js
import { configureControls } from '@dhristhi/form-builder';

// Call once before rendering <FormBuilder />
configureControls({
  // enable: ['text', 'select', 'verticalLayout'],
  disable: ['currencyText', 'image'],
  add: [{ tester: myCustomTester, renderer: MyCustomRenderer, id: 'myCustom' }],
});
```

Built-in control IDs usable in `enable`/`disable`:

- currencyText, text, label, image, infoAlert, select, downloadFile, fileUpload
- arrayLayout, groupLayout, verticalLayout, horizontalLayout, accordionGroupLayout

Notes:

- By default, all built-in custom controls are enabled alongside Material renderers/cells.
- `add` items are appended after built-ins. Provide a stable `id` to toggle them later.

### Props

- onExport({ schema, uiSchema }): Override default JSON download to handle export.
- onSave: Receive save requests from the schema editor view.
- theme: Provide a custom MUI theme instance.
- schemas: Sample templates `{ id, name, description?, schema }` for quick loading.

Example:

```jsx
import { FormBuilder } from '@dhristhi/form-builder';

function handleExport({ schema, uiSchema }) {
  // Persist to server or file
}

export default function MyPage() {
  return (
    <FormBuilder
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
              age: { type: 'number', title: 'Age' },
            },
            required: ['firstName'],
          },
        },
      ]}
    />
  );
}
```

## Development

```bash
# Run the demo app
yarn dev

# Lint all workspaces
yarn lint

# Test the library
yarn workspace @dhristhi/form-builder test

# Build the library
yarn workspace @dhristhi/form-builder build

# Build all workspaces
yarn build
```

## Features

- Drag & Drop builder with nested layouts
- Live preview with JSON Forms
- Property editor for field configuration
- Schema editor (JSON Schema & UI Schema)
- Export/import schemas

## License

MIT — see [LICENSE](LICENSE).

## Acknowledgments

- [React](https://reactjs.org/) — UI Framework
- [Material UI](https://mui.com/) — Component Library
- [JSON Forms](https://jsonforms.io/) — Schema-based Forms
- [@dnd-kit](https://dndkit.com/) — Drag and Drop Toolkit
