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

function normalizeConstValue(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

function compileRule(field) {
  const anyOf = [];
  let currentGroup = [];
  const conditions = field.visibility;
  conditions.forEach((condition, index) => {
    console.log('condition', condition);
    const compiled = buildPropertyCondition(condition);
    currentGroup.push(compiled);

    const isLast = index === conditions.length - 1;

    if (condition.logical === 'OR' || isLast) {
      // close current group
      if (currentGroup.length === 1) {
        anyOf.push(currentGroup[0]);
      } else {
        anyOf.push({ allOf: currentGroup });
      }
      currentGroup = [];
    }
  });

  const schema =
    anyOf.length === 1
      ? anyOf[0] // no ORs → single condition or single allOf
      : { anyOf };
  console.log('schema', schema);
  return {
    effect: field.effect,
    condition: {
      scope: '#',
      schema,
    },
  };
}

function buildPropertyCondition({ dependsOn, operator, value }) {
  console.log('dependsOn', dependsOn);
  const constValue = normalizeConstValue(value);

  let schemaCondition;

  switch (operator) {
    case 'equals':
      schemaCondition = { const: constValue };
      break;

    case 'not_equals':
      schemaCondition = { not: { const: constValue } };
      break;

    case 'eq':
      schemaCondition = { const: Number(constValue) };
      break;

    case 'neq':
      schemaCondition = { not: { const: Number(constValue) } };
      break;
    case 'gt':
      schemaCondition = { exclusiveMinimum: Number(value) };
      break;
    case 'gte':
      schemaCondition = { minimum: Number(value) };
      break;
    case 'lt':
      schemaCondition = { exclusiveMaximum: Number(value) };
      break;
    case 'lte':
      schemaCondition = { maximum: Number(value) };
      break;

    case 'pattern': {
      // escape regex
      const escaped = String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      schemaCondition = { pattern: escaped };
      break;
    }

    case 'starts_with': {
      const escaped = String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      schemaCondition = { pattern: `^${escaped}` };
      break;
    }

    case 'ends_with': {
      const escaped = String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      schemaCondition = { pattern: `${escaped}$` };
      break;
    }

    case 'between': {
      const min = Number(value?.min);
      const max = Number(value?.max);

      if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
      if (min > max) return null; // logical safety

      schemaCondition = {
        minimum: min,
        maximum: max,
      };
      break;
    }

    default:
      schemaCondition = { const: constValue };
  }

  return {
    properties: {
      [dependsOn]: schemaCondition,
    },
    required: [dependsOn],
  };
}

export const buildUISchemaFromFields = (fieldsArray, parentKey = null) => {
  return fieldsArray
    .filter((field) => {
      return !field.uischema?.options?.hidden;
    })
    .map((field) => {
      console.log('field', field);
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
          let rule = {};
          if (field.visibility) {
            rule = compileRule(field);
          }
          const scope = parentKey
            ? `#/properties/${parentKey}/properties/${field.key}`
            : `#/properties/${field.key}`;
          if (field.visibility)
            return {
              ...field.uischema,
              scope: scope,
              label: field.label,
              rule: rule,
            };
          return {
            ...field.uischema,
            scope: scope,
            label: field.label,
          };
        }
      }
    });
};
