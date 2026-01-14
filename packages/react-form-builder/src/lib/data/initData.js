export const createDefaultArrayItem = (children) => {
  const item = {};
  children.forEach((child) => {
    if (!child.isLayout) {
      if (child.schema.type === 'boolean') {
        item[child.key] = false;
      } else if (child.schema.type === 'number') {
        item[child.key] = 0;
      } else if (child.schema.type === 'array') {
        item[child.key] = [];
      } else {
        item[child.key] = '';
      }
    } else if (child.type === 'object') {
      item[child.key] = child.children ? createDefaultArrayItem(child.children) : {};
    } else if (child.type === 'array') {
      item[child.key] = [];
    } else if (child.children) {
      const layoutData = createDefaultArrayItem(child.children);
      Object.assign(item, layoutData);
    }
  });
  return item;
};

export const initializeNestedFormData = (fieldsArray, parentData = {}) => {
  const data = { ...parentData };

  fieldsArray.forEach((field) => {
    if (!field.isLayout) {
      if (!(field.key in data)) {
        if (field.schema.type === 'boolean') {
          data[field.key] = false;
        } else if (field.schema.type === 'number') {
          data[field.key] = 0;
        } else if (field.schema.type === 'array') {
          if (field.children && field.children.length > 0) {
            const sampleItem = createDefaultArrayItem(field.children);
            data[field.key] = [sampleItem];
          } else {
            data[field.key] = [];
          }
        } else {
          data[field.key] = '';
        }
      }
    } else if (field.type === 'object') {
      if (!(field.key in data)) {
        data[field.key] = {};
      }
      if (field.children) {
        data[field.key] = initializeNestedFormData(field.children, data[field.key]);
      }
    } else if (field.type === 'array') {
      if (!(field.key in data)) {
        if (field.children && field.children.length > 0) {
          const sampleItem = createDefaultArrayItem(field.children);
          data[field.key] = [sampleItem];
        } else {
          data[field.key] = [];
        }
      } else if (Array.isArray(data[field.key])) {
        if (data[field.key].length === 0 && field.children && field.children.length > 0) {
          const sampleItem = createDefaultArrayItem(field.children);
          data[field.key] = [sampleItem];
        }
      }
    } else if (field.children) {
      Object.assign(data, initializeNestedFormData(field.children, data));
    }
  });

  return data;
};
