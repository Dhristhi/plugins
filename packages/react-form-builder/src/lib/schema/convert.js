export const mapSchemaPropertyToFieldType = (property, defaultFieldTypes) => {
  const { type, enum: enumValues, format, maxLength } = property || {};

  if (Array.isArray(enumValues) && enumValues.length > 0) {
    // Use the actual select field type IDs defined in defaultFieldTypes
    if (enumValues.length <= 3) {
      return defaultFieldTypes.find((ft) => ft.id === 'radio') || defaultFieldTypes[0];
    }
    return defaultFieldTypes.find((ft) => ft.id === 'select') || defaultFieldTypes[0];
  }

  switch (type) {
    case 'string':
      if (format === 'email') {
        return defaultFieldTypes.find((ft) => ft.id === 'email') || defaultFieldTypes[0];
      }
      if (format === 'date' || format === 'date-time') {
        return defaultFieldTypes.find((ft) => ft.id === 'date') || defaultFieldTypes[0];
      }
      if (format === 'data-url') {
        return defaultFieldTypes.find((ft) => ft.id === 'file') || defaultFieldTypes[0];
      }
      if (maxLength && maxLength > 100) {
        return defaultFieldTypes.find((ft) => ft.id === 'textarea') || defaultFieldTypes[0];
      }
      return defaultFieldTypes.find((ft) => ft.id === 'text') || defaultFieldTypes[0];
    case 'number':
    case 'integer':
      return defaultFieldTypes.find((ft) => ft.id === 'number') || defaultFieldTypes[0];
    case 'boolean':
      return defaultFieldTypes.find((ft) => ft.id === 'checkbox') || defaultFieldTypes[0];
    default:
      return defaultFieldTypes.find((ft) => ft.id === 'text') || defaultFieldTypes[0];
  }
};

export const convertSchemaToFields = (schema, defaultFieldTypes, getNextId) => {
  if (!schema || !schema.properties) return [];

  const fields = [];

  Object.entries(schema.properties).forEach(([key, property]) => {
    const uniqueId = getNextId();

    const label = property.title || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
    const i18nKey = property.i18n || null;

    if (property.type === 'object' && property.properties) {
      const objectType = defaultFieldTypes.find((ft) => ft.id === 'object') || defaultFieldTypes[0];
      let children = convertSchemaToFields(property, defaultFieldTypes, getNextId);

      const layoutId = getNextId();
      const verticalLayout = {
        id: `field_${layoutId}`,
        type: 'vertical-layout',
        label: 'Vertical Layout',
        key: `layout_${layoutId}`,
        isLayout: true,
        schema: {},
        uischema: { type: 'VerticalLayout' },
        children: children.map((c) => ({ ...c, parentId: `field_${layoutId}` })),
        parentId: `field_${uniqueId}`,
      };

      const newField = {
        id: `field_${uniqueId}`,
        type: objectType.id,
        label,
        key,
        i18nKey: i18nKey || objectType.translationKey || objectType.labelKey || label,
        required: schema.required?.includes(key) || false,
        isLayout: true,
        schema: { ...objectType.schema, ...property },
        uischema: { ...objectType.uischema, label },
        children: [verticalLayout],
        parentId: null,
        icon: '',
      };

      fields.push(newField);
      return;
    }

    if (property.type === 'array' && property.items && property.items.type === 'object') {
      const arrayType = defaultFieldTypes.find((ft) => ft.id === 'array') || defaultFieldTypes[0];
      let children = convertSchemaToFields(property.items, defaultFieldTypes, getNextId);
      children = children.map((c) => ({ ...c, parentId: `field_${uniqueId}` }));

      // Create detail layout for array items
      const detailElements = children.map((child) => ({
        type: 'Control',
        scope: `#/properties/${child.key}`,
        options: child.uischema.options || {},
      }));

      const newField = {
        id: `field_${uniqueId}`,
        type: arrayType.id,
        label,
        key,
        i18nKey: i18nKey || arrayType.translationKey || arrayType.labelKey || label,
        required: schema.required?.includes(key) || false,
        isLayout: false,
        schema: {},
        uischema: {
          type: 'Control',
          scope: `#/properties/${key}`,
          options: {
            addable: true,
            detail: {
              type: 'VerticalLayout',
              elements: detailElements,
            },
          },
        },
        children,
        parentId: null,
      };

      newField.schema.type = 'array';
      if (property.title) newField.schema.title = property.title;
      if (property.items) newField.schema.items = property.items;
      if (property.minItems) newField.schema.minItems = property.minItems;
      if (property.maxItems) newField.schema.maxItems = property.maxItems;
      if (property.uniqueItems) newField.schema.uniqueItems = property.uniqueItems;
      if (property.tableView) newField.schema.tableView = property.tableView;

      fields.push(newField);
      return;
    }

    if (property.type === 'array' && property.items && property.items.enum) {
      // Check if field name suggests checkbox display (heuristic approach)
      const useCheckboxDisplay = key.includes('checkbox');
      const multiselectTypeId = useCheckboxDisplay ? 'multicheckbox' : 'multiselect';
      const displayType = useCheckboxDisplay ? 'checkbox' : 'dropdown';

      const multiselectType =
        defaultFieldTypes.find((ft) => ft.id === multiselectTypeId) || defaultFieldTypes[0];
      const newField = {
        id: `field_${uniqueId}`,
        type: multiselectTypeId,
        label,
        key,
        i18nKey: i18nKey || multiselectType?.translationKey || multiselectType?.labelKey || label,
        required: schema.required?.includes(key) || false,
        isLayout: false,
        schema: { ...property },
        uischema: {
          ...multiselectType.uischema,
          scope: `#/properties/${key}`,
          options: {
            ...multiselectType.uischema.options,
            multi: true,
            format: 'select',
            displayType: displayType,
          },
        },
        parentId: null,
      };

      fields.push(newField);
      return;
    }

    const fieldType = mapSchemaPropertyToFieldType(property, defaultFieldTypes);
    const newField = {
      id: `field_${uniqueId}`,
      type: fieldType?.id || 'text',
      label,
      key,
      i18nKey: i18nKey || fieldType?.translationKey || fieldType?.labelKey || label,
      required: schema.required?.includes(key) || false,
      isLayout: fieldType?.isLayout || false,
      schema: { ...(fieldType?.schema || {}), ...property },
      uischema: { ...(fieldType?.uischema || {}), scope: `#/properties/${key}` },
      parentId: null,
    };

    if (property.enum) {
      newField.schema.enum = property.enum;
    }

    fields.push(newField);
  });

  return fields;
};
