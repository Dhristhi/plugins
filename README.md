# Form Builder - JavaScript + Yarn Project

A React form builder using JSON Forms with drag and drop functionality, powered by JavaScript and Yarn.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Yarn package manager

### Installation

1. Clone or access this project directory
2. Install dependencies:

```bash
yarn install
```

### Development

Start the development server:

```bash
yarn dev
# or
yarn start
```

Visit `http://localhost:3000` to see the form builder in action.

### Build for Production

```bash
yarn build
```

### Preview Production Build

```bash
yarn preview
```

## 📂 Project Structure

```
src/
├── components/         # React components
│   ├── FieldPalette.jsx       # Field selection sidebar
│   ├── FieldProperties.jsx    # Field property editor
│   ├── FormPreview.jsx        # Live form preview
│   ├── FormStructure.jsx      # Form structure editor
│   ├── SampleSchemaLoader.jsx # Sample schema loader
│   └── SchemaEditor.jsx       # JSON schema editor
├── App.jsx            # Main application component
├── main.jsx           # Application entry point
├── types.js           # Type definitions and constants
└── index.css          # Global styles
```

## ✨ Features

- **Drag & Drop Form Builder**: Create forms visually with intuitive drag and drop
- **Live Preview**: See your form in action as you build it
- **JSON Schema Support**: Full JSON Schema and UI Schema support
- **Field Types**: Text, Number, Email, Date, Checkbox, Select, Radio, Textarea
- **Layout Controls**: Groups, Vertical/Horizontal layouts
- **Sample Schemas**: Pre-built form templates to get started quickly
- **Export/Import**: Save and load your form configurations
- **Real-time Editing**: Edit field properties and see immediate results

## 🛠 Technology Stack

- **React** - UI framework
- **Material-UI** - Component library
- **JSON Forms** - Schema-based form generation
- **Vite** - Build tool and dev server
- **Yarn** - Package manager
- **JavaScript** - Programming language (ES6+)

## 🎯 Usage

1. **Add Fields**: Select field types from the left palette
2. **Configure Properties**: Click any field to edit its properties
3. **Organize Layout**: Use groups and layouts to structure your form
4. **Preview**: Toggle preview mode to test your form
5. **Export**: Download your form configuration as JSON

## 🔧 Package Scripts

- `yarn dev` - Start development server
- `yarn start` - Alternative start command
- `yarn build` - Build for production
- `yarn preview` - Preview production build

## 📋 Sample Schemas

The application includes several pre-built sample schemas:

- User Registration Form
- Job Application Form
- Event Registration
- Customer Feedback Survey
- Product Order Form

## 🤝 Contributing

This is a JavaScript + Yarn project. To contribute:

1. Ensure you have Yarn installed
2. Run `yarn install` to install dependencies
3. Use `yarn start` for development
4. Follow the existing JavaScript/JSX patterns
5. Test your changes with `yarn build`

## 📝 Migration Notes

This project was converted from TypeScript to JavaScript:

- All `.tsx`/`.ts` files converted to `.jsx`/`.js`
- TypeScript type annotations removed
- Package manager switched to Yarn
- Build process optimized for JavaScript
- All functionality preserved

---

Built with ❤️ using React, Material-UI, and JSON Forms
