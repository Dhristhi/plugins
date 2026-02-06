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
  field.visibility = field.visibility.filter(
    (item) => item.dependsOn !== '' && item.dependsOn != null
  );
  const conditions = field.visibility;
  conditions.forEach((condition, index) => {
    if (index === 0) {
      if (condition.logical !== '') {
        condition.logical === '';
        field.visibility[index].logical = '';
      }
    }
    // const conditionParentField = fieldsArray.find((obj) => obj.fieldKey === condition.dependsOn);
    const compiled = buildPropertyCondition(condition);
    currentGroup.push(compiled);

    const isLast = index === conditions.length - 1;
    const next = !isLast ? conditions[index + 1] : null;
    const closesHere = !next || next.logical === 'OR';

    if (closesHere) {
      if (currentGroup.length === 1) {
        anyOf.push(currentGroup[0]);
      } else {
        anyOf.push({ allOf: currentGroup });
      }
      currentGroup = [];
    }
  });

  const schema = anyOf.length === 1 ? anyOf[0] : { anyOf };
  return {
    effect: field.effect,
    condition: {
      scope: '#',
      schema,
      failWhenUndefined: true,
    },
  };
}

function buildPropertyCondition({ dependsOn, operator, value }) {
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
      schemaCondition = { type: 'number', exclusiveMinimum: Number(value) };
      break;
    case 'gte':
      schemaCondition = { type: 'number', minimum: Number(value) };
      break;
    case 'lt':
      schemaCondition = { type: 'number', exclusiveMaximum: Number(value) };
      break;
    case 'lte':
      schemaCondition = { type: 'number', maximum: Number(value) };
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
    .flatMap((field) => {
      if (field.isLayout) {
        const uischema = {};

        if (field.icon) {
          uischema.icon = `Icon${field.icon}`;
        }

        uischema.type =
          field.type === 'object' || field.type === 'group' ? 'GroupWithIcon' : field.uischema.type;
        uischema.label = field.label;
        uischema.i18n = field.i18nKey || field.label;

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

        return [uischema];
      } else {
        // Handle password confirmation
        if (field.type === 'password' && field.requireConfirmation) {
          const scope = parentKey
            ? `#/properties/${parentKey}/properties/${field.key}`
            : `#/properties/${field.key}`;
          const confirmScope = parentKey
            ? `#/properties/${parentKey}/properties/${field.key}_confirm`
            : `#/properties/${field.key}_confirm`;
          if (field.visibility && field.visibility.length > 0 && field.parentVisibility) {
            let rule = {};
            rule = compileRule(field);
            return [
              {
                ...field.uischema,
                scope: scope,
                label: field.label,
                i18n: field.i18nKey || field.label,
                rule: rule,
              },
              {
                type: 'Control',
                scope: confirmScope,
                label: `Confirm ${field.label}`,
                i18n: field.i18nKey ? `${field.i18nKey}_confirm` : `${field.key}_confirm`,
                options: {
                  format: 'password',
                },
                rule: rule,
              },
            ];
          }
          return [
            {
              ...field.uischema,
              scope: scope,
              label: field.label,
              i18n: field.i18nKey || field.label,
            },
            {
              type: 'Control',
              scope: confirmScope,
              label: `Confirm ${field.label}`,
              i18n: field.i18nKey ? `${field.i18nKey}_confirm` : `${field.key}_confirm`,
              options: {
                format: 'password',
              },
            },
          ];
        }

        if (field.type === 'array') {
          const scope = parentKey
            ? `#/properties/${parentKey}/properties/${field.key}`
            : `#/properties/${field.key}`;

          let detailElements = [];
          if (field.children && field.children.length > 0) {
            detailElements = buildUISchemaForArrayItems(field.children);
          }
          if (field.visibility && field.visibility.length > 0 && field.parentVisibility) {
            let rule = {};
            rule = compileRule(field);
            return [
              {
                type: 'Control',
                scope: scope,
                label: field.label,
                i18n: field.i18nKey || field.label,
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
                rule: rule,
              },
            ];
          }

          return [
            {
              type: 'Control',
              scope: scope,
              label: field.label,
              i18n: field.i18nKey || field.label,
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
            },
          ];
        } else {
          let rule = {};
          if (field.visibility && field.visibility.length > 0 && field.parentVisibility) {
            rule = compileRule(field);
          }
          const scope = parentKey
            ? `#/properties/${parentKey}/properties/${field.key}`
            : `#/properties/${field.key}`;
          if (field.visibility && field.visibility.length > 0 && field.parentVisibility)
            return {
              ...field.uischema,
              scope: scope,
              label: field.label,
              i18n: field.i18nKey || field.label,
              rule: rule,
            };
          return {
            ...field.uischema,
            scope: scope,
            label: field.label,
            i18n: field.i18nKey || field.label,
          };
        }
      }
    });
};
