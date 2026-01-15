# React Form Builder

A modern drag-and-drop form builder built with React 19, Material UI, and JSON Forms. Design forms visually, preview them live, and export JSON Schema + UI Schema.

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-6-blue.svg)](https://mui.com/)
[![JSON Forms](https://img.shields.io/badge/JSON%20Forms-3.6-green.svg)](https://jsonforms.io/)
[![npm](https://img.shields.io/npm/v/%40dhristhi%2Freact-form-builder.svg?logo=npm&color=cb3837)](https://www.npmjs.com/package/@dhristhi/react-form-builder)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Features

- Drag & Drop builder with nested layouts
- Property editor for field configuration
- Schema editor (JSON Schema & UI Schema)
- Live preview with JSON Forms
- Export/import schemas

## Quick Start

Install and import the component:

```bash
yarn add @dhristhi/react-form-builder
# or
npm install @dhristhi/react-form-builder
```

```jsx
import React from 'react';
import { FormBuilder } from '@dhristhi/react-form-builder';

export default function MyPage() {
  return <FormBuilder />;
}
```

## API & Extensibility

### Exports

- FormBuilder — main component
- registerFieldTypes, getFieldTypes, getFieldTypeById — field registry helpers
- configureControls — add/enable/disable JSON Forms renderers

### Register Custom Field Types

```js
import { registerFieldTypes } from '@dhristhi/react-form-builder';

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
import { configureControls } from '@dhristhi/react-form-builder';

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
import { FormBuilder } from '@dhristhi/react-form-builder';

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

## License

MIT — see [LICENSE](LICENSE).

## Acknowledgments

- [React](https://reactjs.org/) — UI Framework
- [Material UI](https://mui.com/) — Component Library
- [JSON Forms](https://jsonforms.io/) — Schema-based Forms
- [@dnd-kit](https://dndkit.com/) — Drag and Drop Toolkit
