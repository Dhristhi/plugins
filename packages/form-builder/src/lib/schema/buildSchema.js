export const buildSchemaFromFields = (fieldsArray, parentKey = null) => {
  const properties = {};
  const required = [];
  const nestedObjects = {};

  fieldsArray.forEach((field) => {
    if (!field.isLayout) {
      const fieldKey = parentKey ? `${parentKey}.${field.key}` : field.key;
      properties[field.key] = {
        ...field.schema,
        title: field.label,
      };
      if (field.required) {
        required.push(field.key);
      }
    } else if (field.type === 'object') {
      const childSchema = field.children
        ? buildSchemaFromFields(field.children, field.key)
        : { properties: {}, required: [] };
      const objectSchema = {
        type: 'object',
        title: field.label,
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
    } else if (field.type === 'array') {
      if (field.children && field.children.length > 0) {
        const childSchema = buildSchemaFromFields(field.children, null);
        properties[field.key] = {};
        properties[field.key].type = 'array';
        properties[field.key].title = field.label;
        properties[field.key].items = {
          type: 'object',
          properties: childSchema.properties,
        };

        if (childSchema.required && childSchema.required.length > 0) {
          properties[field.key].items.required = childSchema.required;
        }

        if (field.schema.minItems) properties[field.key].minItems = field.schema.minItems;
        if (field.schema.maxItems) properties[field.key].maxItems = field.schema.maxItems;
        if (field.schema.uniqueItems) properties[field.key].uniqueItems = field.schema.uniqueItems;
        if (field.schema.tableView) properties[field.key].tableView = field.schema.tableView;
      } else {
        properties[field.key] = {};
        properties[field.key].type = 'array';
        properties[field.key].title = field.label;
        Object.keys(field.schema).forEach((key) => {
          if (key !== 'type') {
            properties[field.key][key] = field.schema[key];
          }
        });
      }

      if (field.required) {
        required.push(field.key);
      }
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
