export interface FieldType {
  id: string;
  type: string;
  label: string;
  icon: string;
  schema: any;
  uischema: any;
  isLayout?: boolean;
}

export interface FormField {
  id: string;
  type: string;
  label: string;
  key: string;
  required?: boolean;
  schema: any;
  uischema: any;
  children?: FormField[];
  isLayout?: boolean;
  parentId?: string;
}

export interface FormState {
  schema: any;
  uischema: any;
  data: any;
}

export const defaultFieldTypes: FieldType[] = [
  // Layout Elements
  {
    id: 'vertical-layout',
    type: 'layout',
    label: 'Vertical Layout',
    icon: '📑',
    isLayout: true,
    schema: {},
    uischema: {
      type: 'VerticalLayout',
      elements: [],
    },
  },
  {
    id: 'horizontal-layout',
    type: 'layout',
    label: 'Horizontal Layout',
    icon: '📊',
    isLayout: true,
    schema: {},
    uischema: {
      type: 'HorizontalLayout',
      elements: [],
    },
  },
  {
    id: 'group',
    type: 'group',
    label: 'Group',
    icon: '📦',
    isLayout: true,
    schema: {},
    uischema: {
      type: 'Group',
      label: 'Group Section',
      elements: [],
    },
  },
  // Form Fields
  {
    id: 'text',
    type: 'string',
    label: 'Text Input',
    icon: '📝',
    schema: {
      type: 'string',
    },
    uischema: {
      type: 'Control',
      scope: '#/properties/field',
    },
  },
  {
    id: 'textarea',
    type: 'string',
    label: 'Textarea',
    icon: '📄',
    schema: {
      type: 'string',
    },
    uischema: {
      type: 'Control',
      scope: '#/properties/field',
      options: {
        multi: true,
      },
    },
  },
  {
    id: 'number',
    type: 'number',
    label: 'Number',
    icon: '🔢',
    schema: {
      type: 'number',
    },
    uischema: {
      type: 'Control',
      scope: '#/properties/field',
    },
  },
  {
    id: 'email',
    type: 'string',
    label: 'Email',
    icon: '📧',
    schema: {
      type: 'string',
      format: 'email',
    },
    uischema: {
      type: 'Control',
      scope: '#/properties/field',
    },
  },
  {
    id: 'date',
    type: 'string',
    label: 'Date',
    icon: '📅',
    schema: {
      type: 'string',
      format: 'date',
    },
    uischema: {
      type: 'Control',
      scope: '#/properties/field',
    },
  },
  {
    id: 'checkbox',
    type: 'boolean',
    label: 'Checkbox',
    icon: '☑️',
    schema: {
      type: 'boolean',
    },
    uischema: {
      type: 'Control',
      scope: '#/properties/field',
    },
  },
  {
    id: 'select',
    type: 'string',
    label: 'Select',
    icon: '📋',
    schema: {
      type: 'string',
      enum: ['Option 1', 'Option 2', 'Option 3'],
    },
    uischema: {
      type: 'Control',
      scope: '#/properties/field',
    },
  },
  {
    id: 'radio',
    type: 'string',
    label: 'Radio Group',
    icon: '🔘',
    schema: {
      type: 'string',
      enum: ['Option 1', 'Option 2', 'Option 3'],
    },
    uischema: {
      type: 'Control',
      scope: '#/properties/field',
      options: {
        format: 'radio',
      },
    },
  },
];

export const generateFieldKey = (type: string): string => {
  const timestamp = Date.now();
  return `${type}_${timestamp}`;
};
