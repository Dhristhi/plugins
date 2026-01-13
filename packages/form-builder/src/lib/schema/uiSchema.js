export const buildUISchemaForArrayItems = (fieldsArray) => {
  return fieldsArray
    .filter((field) => !field.uischema?.options?.hidden)
    .map((field) => {
      if (field.isLayout && field.type !== 'array') {
        return {
          ...field.uischema,
          label: field.label,
          elements: field.children ? buildUISchemaForArrayItems(field.children) : [],
        };
      } else if (field.type === 'array') {
        let nestedDetailElements = [];
        if (field.children && field.children.length > 0) {
          nestedDetailElements = buildUISchemaForArrayItems(field.children);
        }
        return {
          type: 'Control',
          scope: `#/properties/${field.key}`,
          options: {
            ...field.uischema?.options,
            showSortButtons: true,
            ...(nestedDetailElements.length > 0 && {
              detail: {
                type: 'VerticalLayout',
                elements: nestedDetailElements,
              },
            }),
            ...(field.uischema?.options?.elementLabelProp && {
              elementLabelProp: field.uischema.options.elementLabelProp,
            }),
          },
        };
      } else {
        return {
          type: 'Control',
          scope: `#/properties/${field.key}`,
          label: field.label,
          options: field.uischema?.options,
        };
      }
    });
};

export const buildUISchemaFromFields = (fieldsArray, parentKey = null) => {
  return fieldsArray
    .filter((field) => {
      return !field.uischema?.options?.hidden;
    })
    .map((field) => {
      if (field.isLayout) {
        const uischema = {};

        if (field.icon) {
          uischema.icon = `Icon${field.icon}`;
        }

        uischema.type =
          field.type === 'object' || field.type === 'group' ? 'GroupWithIcon' : field.uischema.type;
        uischema.label = field.label;

        const newParentKey =
          field.type === 'object'
            ? parentKey
              ? `${parentKey}/properties/${field.key}`
              : field.key
            : parentKey;

        uischema.elements = field.children
          ? buildUISchemaFromFields(field.children, newParentKey)
          : [];

        if (field.uischema.options) {
          uischema.options = field.uischema.options;
        }

        return uischema;
      } else {
        if (field.type === 'array') {
          const scope = parentKey
            ? `#/properties/${parentKey}/properties/${field.key}`
            : `#/properties/${field.key}`;

          let detailElements = [];
          if (field.children && field.children.length > 0) {
            detailElements = buildUISchemaForArrayItems(field.children);
          }

          return {
            type: 'Control',
            scope: scope,
            options: {
              addable: true,
              ...field.uischema?.options,
              showSortButtons: true,
              ...(detailElements.length > 0 && {
                detail: {
                  type: 'VerticalLayout',
                  elements: detailElements,
                },
              }),
            },
          };
        } else {
          const scope = parentKey
            ? `#/properties/${parentKey}/properties/${field.key}`
            : `#/properties/${field.key}`;
          return {
            ...field.uischema,
            scope: scope,
            label: field.label,
          };
        }
      }
    });
};
