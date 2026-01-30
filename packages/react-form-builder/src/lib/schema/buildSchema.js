export const buildSchemaFromFields = (fieldsArray, parentKey = null) => {
  const properties = {};
  const required = [];
  const nestedObjects = {};

  fieldsArray.forEach((field) => {
    if (field.type === 'array') {
      properties[field.key] = {
        type: 'array',
        title: field.label,
        i18n: field.i18nKey || field.label,
        uniqueItems: true,
        ...Object.fromEntries(Object.entries(field.schema || {}).filter(([key]) => key !== 'type')),
      };

      if (field.children && field.children.length > 0) {
        const childSchema = buildSchemaFromFields(field.children, null);

        properties[field.key].items = {
          type: 'object',
          properties: childSchema.properties,
        };

        if (childSchema.required && childSchema.required.length > 0) {
          properties[field.key].items.required = childSchema.required;
        }

        Object.assign(nestedObjects, childSchema.nestedObjects || {});
      }

      if (field.required) {
        required.push(field.key);
      }
    } else if (!field.isLayout) {
      // Handle password confirmation
      if (field.type === 'password' && field.requireConfirmation) {
        // Add main password field
        properties[field.key] = {
          ...field.schema,
          title: field.label,
          i18n: field.i18nKey || field.label,
        };

        // Add confirm password field
        properties[`${field.key}_confirm`] = {
          type: 'string',
          format: 'password',
          title: `Confirm ${field.label}`,
          i18n: field.i18nKey ? `${field.i18nKey}_confirm` : `${field.key}_confirm`,
        };

        if (field.required) {
          required.push(field.key, `${field.key}_confirm`);
        }
      } else {
        properties[field.key] = {
          ...field.schema,
          title: field.label,
          i18n: field.i18nKey || field.label,
        };
        if (field.required) {
          required.push(field.key);
        }
      }
    } else if (field.type === 'object') {
      const childSchema = field.children
        ? buildSchemaFromFields(field.children, field.key)
        : { properties: {}, required: [] };
      const objectSchema = {
        type: 'object',
        title: field.label,
        i18n: field.i18nKey || field.label,
        properties: childSchema.properties,
      };

      if (childSchema.required && childSchema.required.length > 0) {
        objectSchema.required = childSchema.required;
      }

      properties[field.key] = objectSchema;
      if (field.required) {
        required.push(field.key);
      }
      Object.assign(nestedObjects, childSchema.nestedObjects || {});
    } else {
      if (field.children) {
        const childSchema = buildSchemaFromFields(field.children, parentKey);
        Object.assign(properties, childSchema.properties);
        if (childSchema.required) {
          required.push(...childSchema.required);
        }
        Object.assign(nestedObjects, childSchema.nestedObjects || {});
      }
    }
  });

  return { properties, required, nestedObjects };
};
