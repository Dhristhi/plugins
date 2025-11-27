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
│   └── SchemaEditor.jsx       # JSON schema editor
├── App.jsx            # Main application component
├── main.jsx           # Application entry point
├── types.js           # Type definitions and constants
└── index.css          # Global styles
```

## ✨ Features

### 🎯 Core Functionality

- **Advanced Drag & Drop Form Builder**: Create complex forms with intuitive drag and drop
- **Live Preview**: See your form in action as you build it
- **JSON Schema Support**: Full JSON Schema and UI Schema support
- **Export/Import**: Save and load your form configurations
- **Real-time Editing**: Edit field properties and see immediate results

### 🔥 Drag & Drop Capabilities

- **Multi-level Nesting**: Drop layouts into layouts, fields into groups, unlimited nesting depth
- **Smart Drop Zones**: Visual indicators show where items can be dropped
- **Cross-container Movement**: Drag fields between different layouts and containers
- **Intelligent Reordering**: Drag items to reorder within their containers
- **Context Menus**: Right-click for quick actions (add, edit, copy, delete)
- **Visual Feedback**: Real-time drag overlays and hover effects

### 📝 Field Types

- **Text, Number, Email, Date** - Standard input controls
- **Checkbox, Radio, Select** - Selection controls
- **Textarea** - Multi-line text input

### 🏗️ Layout Controls

- **Groups** - Visual containers with borders and titles
- **Vertical Layouts** - Stack elements vertically
- **Horizontal Layouts** - Arrange elements side-by-side
- **Nested Layouts** - Unlimited nesting for complex structures

### 🎨 Advanced Features

- **Sample Schemas** - Pre-built form templates to get started quickly
- **Schema Editor** - Direct JSON editing for advanced users
- **Properties Panel** - Comprehensive field configuration
- **Debug Mode** - Visual hierarchy and drag status indicators

## 🛠 Technology Stack

- **React 19** - UI framework
- **Material-UI v6** - Component library
- **JSON Forms** - Schema-based form generation
- **@dnd-kit** - Modern drag and drop for React
  - `@dnd-kit/core` - Core drag and drop functionality
  - `@dnd-kit/sortable` - Sortable list support
  - `@dnd-kit/utilities` - CSS utilities and transforms
  - `@dnd-kit/modifiers` - Drag constraints and modifiers
- **Vite 7** - Build tool and dev server
- **Yarn** - Package manager
- **JavaScript** - Programming language (ES6+)

## 🎯 Usage

### 🚀 Getting Started

1. **Drag Fields**: Drag field types from the left palette to the form structure
2. **Create Layouts**: Add groups and layouts to organize your form
3. **Nest Structures**: Drop layouts into other layouts for complex hierarchies
4. **Configure Properties**: Click any field to edit its properties in the right panel
5. **Reorder Elements**: Drag fields within containers to reorder them
6. **Use Context Menus**: Right-click for quick actions and options
7. **Preview Your Form**: Toggle preview mode to test form functionality
8. **Export Configuration**: Download your form as JSON for later use

### 🎨 Advanced Drag & Drop Operations

- **Field to Layout**: Drag any field from palette directly into layouts
- **Layout to Layout**: Create nested structures by dropping layouts into other layouts
- **Field to Group**: Add form fields directly to group containers
- **Cross-container**: Move fields between different containers
- **Multi-level**: Create unlimited nesting depth for complex forms
- **Quick Add**: Use + buttons on layouts for fast field addition
- **Context Actions**: Right-click for copy, cut, delete, and quick field additions

### 💡 Pro Tips

- Start with groups to create main form sections
- Use horizontal layouts for side-by-side fields (name, address)
- Use vertical layouts for stacking related fields
- Right-click on layouts for quick field addition options
- Keep nesting levels manageable (3-4 levels max recommended)

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
