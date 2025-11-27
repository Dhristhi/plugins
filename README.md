# React Form Builder

A powerful, modern drag-and-drop form builder library built with React 19, Material-UI, and JSON Forms. Create complex, nested form structures with an intuitive visual interface.

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-6-blue.svg)](https://mui.com/)
[![JSON Forms](https://img.shields.io/badge/JSON%20Forms-3.0-green.svg)](https://jsonforms.io/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Features

- 🎯 **Drag & Drop Interface** - Intuitive visual form building
- 🔧 **Multi-level Nesting** - Unlimited layout depth and complexity
- 📱 **Responsive Design** - Works seamlessly across all devices
- 🎨 **Modern UI/UX** - Clean Material Design interface
- ⚡ **Real-time Preview** - See your forms as you build them
- 📊 **JSON Schema Export** - Standards-compliant output
- 🚀 **Performance Optimized** - Efficient rendering and updates

## 🚀 Quick Start

```bash
# Install dependencies
npm install
# or
yarn install

# Start development server
npm run dev
# or
yarn dev

# Open http://localhost:3000
```

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- Package manager: npm or yarn

### Option 1: Clone Repository

```bash
git clone [repository-url]
cd react-form-builder
npm install
npm run dev
```

### Option 2: NPM Package (Future)

```bash
npm install @your-org/react-form-builder
```

## 🏗️ Architecture

### Core Components

```
src/
├── components/           # React components library
│   ├── FieldPalette/     # Draggable field palette
│   ├── FormStructure/    # Visual form builder
│   ├── FormPreview/      # Live form renderer
│   ├── SchemaEditor/     # JSON schema editor
│   └── FieldProperties/  # Property configuration
├── hooks/               # Custom React hooks
├── utils/              # Utility functions
└── types/             # Type definitions
```

### Technology Stack

- **React 19** - Modern UI framework with concurrent features
- **Material-UI v6** - Complete component library and theming
- **JSON Forms** - Schema-based form generation and validation
- **@dnd-kit** - Accessible drag-and-drop toolkit
- **Vite** - Fast build tool and development server

## 🎯 Core Features

### Drag & Drop System

- Multi-level nesting with unlimited depth
- Smart drop zones with visual feedback
- Cross-container item movement
- Sortable lists at every level

### Form Elements

- **Input Fields**: Text, Number, Email, Date, TextArea
- **Selection**: Checkbox, Radio, Select, Multi-select
- **Layouts**: Groups, Vertical/Horizontal layouts
- **Advanced**: Conditional fields, validation rules

### Visual Interface

- Real-time form preview
- Property panel for field configuration
- Context menus for quick actions
- Responsive design for all devices

## 📖 API Reference

### FormBuilder Component

```javascript
import { FormBuilder } from 'react-form-builder';

<FormBuilder
  initialSchema={schema} // Optional: JSON schema to load
  onSchemaChange={handleChange} // Callback for schema updates
  onExport={handleExport} // Export handler
  templates={customTemplates} // Optional: custom templates
/>;
```

### Props

| Prop             | Type       | Default | Description                        |
| ---------------- | ---------- | ------- | ---------------------------------- |
| `initialSchema`  | `Object`   | `{}`    | Initial JSON schema to load        |
| `onSchemaChange` | `Function` | -       | Called when form structure changes |
| `onExport`       | `Function` | -       | Called when user exports form      |
| `templates`      | `Array`    | `[]`    | Custom form templates              |
| `theme`          | `Object`   | -       | Custom Material-UI theme           |

### Hooks

```javascript
// Custom hooks for form building
import { useFormBuilder, useDragDrop } from 'react-form-builder';

const { schema, addField, removeField } = useFormBuilder();
const { isDragging, draggedItem } = useDragDrop();
```

## 🔧 Configuration

### Custom Field Types

```javascript
const customField = {
  id: 'custom-input',
  type: 'string',
  label: 'Custom Input',
  icon: CustomIcon,
  schema: {
    type: 'string',
    title: 'Custom Field',
  },
  uischema: {
    type: 'Control',
    scope: '#/properties/custom',
  },
};
```

### Theming

```javascript
import { ThemeProvider } from '@mui/material';

const customTheme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    // ... custom theme
  },
});

<ThemeProvider theme={customTheme}>
  <FormBuilder />
</ThemeProvider>;
```

## ✨ Features

### 🎯 Core Functionality

- **Advanced Drag & Drop Form Builder**: Create complex forms with intuitive drag and drop
- **Live Preview**: See your form in action as you build it
- **JSON Schema Support**: Full JSON Schema and UI Schema support
- **Export/Import**: Save and load your form configurations
- **Real-time Editing**: Edit field properties and see immediate results

## 📚 Examples

### Basic Usage

```javascript
import React from 'react';
import { FormBuilder } from 'react-form-builder';

function App() {
  const handleSchemaChange = (newSchema) => {
    console.log('Form updated:', newSchema);
  };

  return (
    <FormBuilder
      onSchemaChange={handleSchemaChange}
      templates={[
        {
          id: 'contact',
          name: 'Contact Form',
          schema: {
            /* schema definition */
          },
        },
      ]}
    />
  );
}
```

### Advanced Integration

```javascript
import { FormBuilder, useFormBuilder } from 'react-form-builder';

function CustomFormBuilder() {
  const { schema, addField, removeField, updateField, exportSchema } =
    useFormBuilder({
      initialSchema: mySchema,
      validation: true,
    });

  return (
    <div>
      <FormBuilder
        schema={schema}
        onFieldAdd={addField}
        onFieldUpdate={updateField}
      />
      <button onClick={() => exportSchema('json')}>Export as JSON</button>
    </div>
  );
}
```

## 🎨 Customization

### Custom Templates

Create reusable form templates for common use cases:

```javascript
const templates = [
  {
    id: 'registration',
    name: 'User Registration',
    description: 'Complete user signup form',
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', title: 'First Name' },
        lastName: { type: 'string', title: 'Last Name' },
        email: { type: 'string', format: 'email', title: 'Email' },
      },
      required: ['firstName', 'lastName', 'email'],
    },
  },
];
```

### Event Handling

```javascript
<FormBuilder
  onSchemaChange={(schema) => console.log('Schema updated:', schema)}
  onFieldSelect={(field) => console.log('Field selected:', field)}
  onExport={(format, data) => downloadFile(format, data)}
  onImport={(schema) => validateAndLoadSchema(schema)}
/>
```

## 📋 Form Templates

Built-in templates for common form types:

- **User Registration Form** - Complete user registration with personal details
- **Job Application Form** - Professional job application form
- **Event Registration** - Event registration with preferences
- **Customer Feedback Survey** - Customer satisfaction survey
- **Product Order Form** - E-commerce order form
- **Organization Onboarding** - Comprehensive onboarding form

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/your-username/react-form-builder.git
cd react-form-builder

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with these amazing technologies:

- [React](https://reactjs.org/) - UI Framework
- [Material-UI](https://mui.com/) - Component Library
- [JSON Forms](https://jsonforms.io/) - Schema-based Forms
- [@dnd-kit](https://dndkit.com/) - Drag and Drop Toolkit

## 📞 Support

- 📧 **Email**: support@react-form-builder.com
- 💬 **Discord**: [Join our community](https://discord.gg/react-form-builder)
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-org/react-form-builder/issues)
- 📖 **Docs**: [Full Documentation](https://docs.react-form-builder.com)

---

**Made with ❤️ by the React Form Builder Team**
