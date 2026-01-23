import {
  IconLayoutRows,
  IconLayoutColumns,
  IconBox,
  IconEdit,
  IconFileText,
  IconHash,
  IconMail,
  IconCalendar,
  IconSquareCheck,
  IconChevronDown,
  IconCircleDot,
  IconCube,
  IconList,
  IconEye,
  IconLink,
  IconNumbers,
} from '@tabler/icons-react';

export const defaultFieldTypes = [
  // Layout Elements
  {
    id: 'group',
    type: 'group',
    labelKey: 'fieldType_group',
    label: 'Group',
    icon: IconBox,
    isLayout: true,
    schema: {},
    uischema: {
      type: 'Group',
      label: 'Group Section',
      elements: [],
    },
  },
  {
    id: 'vertical-layout',
    type: 'layout',
    labelKey: 'fieldType_verticalLayout',
    label: 'Vertical Layout',
    icon: IconLayoutRows,
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
    labelKey: 'fieldType_horizontalLayout',
    label: 'Horizontal Layout',
    icon: IconLayoutColumns,
    isLayout: true,
    schema: {},
    uischema: {
      type: 'HorizontalLayout',
      elements: [],
    },
  },
  // Form Fields
  {
    id: 'number',
    type: 'number',
    labelKey: 'fieldType_number',
    label: 'Number',
    icon: IconHash,
    schema: {
      type: 'number',
    },
    uischema: {
      type: 'Control',
      scope: '#/properties/field',
    },
  },
  {
    id: 'integer',
    type: 'integer',
    labelKey: 'fieldType_integer',
    label: 'Integer',
    icon: IconNumbers,
    schema: {
      type: 'integer',
    },
    uischema: {
      type: 'Control',
      scope: '#/properties/field',
    },
  },
  {
    id: 'text',
    type: 'string',
    labelKey: 'fieldType_text',
    label: 'Text Input',
    icon: IconEdit,
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
    labelKey: 'fieldType_textarea',
    label: 'Textarea',
    icon: IconFileText,
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
    id: 'email',
    type: 'string',
    labelKey: 'fieldType_email',
    label: 'Email',
    icon: IconMail,
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
    id: 'password',
    type: 'string',
    labelKey: 'fieldType_password',
    label: 'Password',
    icon: IconEye,
    schema: {
      type: 'string',
      format: 'password',
    },
    uischema: {
      type: 'Control',
      scope: '#/properties/field',
      options: {
        format: 'password',
      },
    },
  },

  {
    id: 'url',
    type: 'string',
    labelKey: 'fieldType_url',
    label: 'URL',
    icon: IconLink,
    schema: {
      type: 'string',
      format: 'uri',
    },
    uischema: {
      type: 'Control',
      scope: '#/properties/field',
    },
  },
  {
    id: 'date',
    type: 'string',
    labelKey: 'fieldType_date',
    label: 'Date',
    icon: IconCalendar,
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
    id: 'file',
    type: 'string',
    labelKey: 'fieldType_file',
    label: 'File Upload',
    icon: IconFileText,
    schema: {
      type: 'string',
      format: 'data-url',
      title: 'Upload File',
    },
    uischema: {
      type: 'Control',
      scope: '#/properties/field',
      options: {
        'ui:widget': 'file',
        'ui:options': {
          accept: '',
        },
      },
    },
  },
  {
    id: 'checkbox',
    type: 'boolean',
    labelKey: 'fieldType_checkbox',
    label: 'Checkbox',
    icon: IconSquareCheck,
    schema: {
      type: 'boolean',
    },
    uischema: {
      type: 'Control',
      scope: '#/properties/field',
    },
  },
  {
    id: 'multicheckbox',
    type: 'array',
    labelKey: 'fieldType_multicheckbox',
    label: 'Multi Checkbox',
    icon: IconSquareCheck,
    schema: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['Option 1', 'Option 2', 'Option 3'],
      },
      uniqueItems: true,
    },
    uischema: {
      type: 'Control',
      scope: '#/properties/field',
      options: {
        multi: true,
        format: 'select',
        displayType: 'checkbox',
      },
    },
  },
  {
    id: 'select',
    type: 'string',
    labelKey: 'fieldType_select',
    label: 'Select',
    icon: IconChevronDown,
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
    id: 'multiselect',
    type: 'array',
    labelKey: 'fieldType_multiselect',
    label: 'Multi-Select',
    icon: IconChevronDown,
    schema: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['Option 1', 'Option 2', 'Option 3'],
      },
      uniqueItems: true,
    },
    uischema: {
      type: 'Control',
      scope: '#/properties/field',
      options: {
        multi: true,
        format: 'select',
        displayType: 'dropdown',
        autocompleteProps: {
          limitTags: 5,
        },
      },
    },
  },
  {
    id: 'radio',
    type: 'string',
    labelKey: 'fieldType_radio',
    label: 'Radio Buttons',
    icon: IconCircleDot,
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

  {
    id: 'object',
    type: 'object',
    labelKey: 'fieldType_object',
    label: 'Object',
    icon: IconCube,
    isLayout: true,
    schema: {
      type: 'object',
      properties: {},
    },
    uischema: {
      type: 'Group',
      label: 'Object',
      elements: [],
    },
  },
  {
    id: 'array-strings',
    type: 'array',
    labelKey: 'fieldType_arrayStrings',
    label: 'Array of Strings',
    icon: IconList,
    schema: {
      type: 'array',
      items: {
        type: 'string',
      },
      uniqueItems: true,
    },
    uischema: {
      type: 'Control',
      scope: '#/properties/field',
    },
  },
  {
    id: 'array',
    type: 'array',
    labelKey: 'fieldType_array',
    label: 'Array of Objects',
    icon: IconList,
    schema: {
      type: 'array',
      items: {
        type: 'string',
      },
      uniqueItems: true,
    },
    uischema: {
      type: 'Control',
      scope: '#/properties/field',
      options: {
        detail: {
          type: 'VerticalLayout',
          elements: [],
        },
      },
    },
  },
];

export const generateFieldKey = (type) => {
  const timestamp = Date.now();
  return `${type}_${timestamp}`;
};
