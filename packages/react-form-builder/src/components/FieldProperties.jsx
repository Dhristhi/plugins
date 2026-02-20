import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IconPlus, IconTrash, IconSettings, IconChevronDown, IconX } from '@tabler/icons-react';
import {
  Typography,
  TextField,
  FormControlLabel,
  Box,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  Grid,
  Checkbox,
  InputAdornment,
  Button,
} from '@mui/material';

import { defaultFieldTypes } from '../types';
import IconSelector from '../utils/IconSelector';
import { updateFieldById } from '../lib/structure/treeOps';

const FieldProperties = ({ field, onFieldUpdate, fields, setFields, visibleFields = {} }) => {
  const { t } = useTranslation();
  const [layout, setLayout] = useState('');
  const [newOption, setNewOption] = useState('');
  const [localField, setLocalField] = useState(null);
  const [enumOptions, setEnumOptions] = useState([]);
  const [selectedIcon, setSelectedIcon] = useState('');
  const [maxSizeInput, setMaxSizeInput] = useState('');
  const [enumDataType, setEnumDataType] = useState('string');
  const [defaultInput, setDefaultInput] = useState(
    Array.isArray(localField?.schema?.default)
      ? localField.schema.default.join(', ')
      : (localField?.schema?.default ?? '')
  );
  const [parentArrayField, setParentArrayField] = useState(null);
  const [isInsideArrayOfObjects, setIsInsideArrayOfObjects] = useState(false);
  const [showLogical, setShowLogical] = useState(false);
  const [logical, setLogical] = useState('');

  useEffect(() => {
    setMaxSizeInput(localField?.uischema?.options?.['ui:options']?.maxSize?.toString() || '');
  }, [localField?.uischema?.options?.['ui:options']?.maxSize]);

  const FILE_TYPE_OPTIONS = [
    { label: '.pdf', value: 'application/pdf' },

    { label: '.jpg/.jpeg', value: 'image/jpeg' },
    { label: '.png', value: 'image/png' },
    { label: '.gif', value: 'image/gif' },
    { label: '.webp', value: 'image/webp' },

    { label: '.doc', value: 'application/msword' },
    {
      label: '.docx',
      value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },

    { label: '.txt', value: 'text/plain' },
    { label: '.rtf', value: 'application/rtf' },

    { label: '.xls', value: 'application/vnd.ms-excel' },
    { label: '.xlsx', value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },

    { label: '.ppt', value: 'application/vnd.ms-powerpoint' },
    {
      label: '.pptx',
      value: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    },

    { label: '.csv', value: 'text/csv' },
  ];

  const OPERATORS = {
    string: [
      { label: t('op_equals'), value: 'equals' },
      { label: t('op_not_equals'), value: 'not_equals' },
    ],
    array: [
      { label: t('op_arr_equals'), value: 'equals' },
      { label: t('op_arr_not_equals'), value: 'not_equals' },
    ],
    boolean: [
      { label: t('op_is'), value: 'equals' },
      { label: t('op_is_not'), value: 'not_equals' },
    ],
    number: [
      { label: t('op_equals'), value: 'eq' },
      { label: t('op_not_equals'), value: 'neq' },
      { label: t('op_greater_than'), value: 'gt' },
      { label: t('op_greater_than_or_equals'), value: 'gte' },
      { label: t('op_less_than'), value: 'lt' },
      { label: t('op_less_than_or_equals'), value: 'lte' },
    ],
    text: [
      { label: t('op_equals'), value: 'equals' },
      { label: t('op_not_equals'), value: 'not_equals' },
      { label: t('op_contains'), value: 'pattern' },
      { label: t('op_starts_with'), value: 'starts_with' },
      { label: t('op_ends_with'), value: 'ends_with' },
    ],
    date: [
      { label: t('op_date_equals'), value: 'date_equals' },
      { label: t('op_date_not_equals'), value: 'date_not_equals' },
      { label: t('op_date_after'), value: 'date_after' },
      { label: t('op_date_on_or_after'), value: 'date_on_or_after' },
      { label: t('op_date_before'), value: 'date_before' },
      { label: t('op_date_on_or_before'), value: 'date_on_or_before' },
    ],
  };

  const defaultRows = [{ dependsOn: '', operator: '', value: '', logical: '', value2: '' }];
  const [rows, setRows] = useState(defaultRows);
  const [isInteger, setIsInteger] = useState(false);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [isMultiCheckbox, setIsMultiCheckbox] = useState(false);
  const [isCurrency, setIsCurrency] = useState(false);

  const updateCondition = (index, key, value) => {
    const updated = [...rows];
    updated[index][key] = value;
    setRows(() => {
      const next = updated;
      handleUpdate({ visibility: next });
      return next;
    });
  };

  const updateEffect = (value) => {
    handleUpdate({ effect: value });
  };

  const showOperator = () => {
    setShowLogical(true);
    setLogical('');
  };

  const addRow = (value) => {
    setRows(() => {
      const next = [
        ...rows,
        { dependsOn: '', operator: '', value: '', logical: value, value2: '' },
      ];
      handleUpdate({ visibility: next });
      setShowLogical(false);
      setLogical(value);
      return next;
    });
  };

  const removeRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    // setRows(updated);
    setRows(() => {
      const next = updated;
      handleUpdate({ visibility: next });
      return next;
    });
  };

  const setDependentState = (value) => {
    if (value) {
      setRows(() => {
        const next = defaultRows;
        handleUpdate({ parentVisibility: value });
        return next;
      });
    } else
      setRows(() => {
        handleUpdate({ visibility: [], parentVisibility: value, effect: '' });
        return [];
      });
  };

  const handleLayoutChange = (event) => {
    const newLayoutType = event.target.value;
    setLayout(newLayoutType);

    const uischemaType =
      newLayoutType === 'horizontal-layout' ? 'HorizontalLayout' : 'VerticalLayout';

    const updatedField = {
      ...localField,
      label: newLayoutType === 'horizontal-layout' ? 'Horizontal Layout' : 'Vertical Layout',
      type: newLayoutType,
      uischema: {
        ...localField.uischema,
        type: uischemaType,
      },
    };
    setLocalField(updatedField);
    onFieldUpdate(updatedField);
  };

  // Helper function to find parent array field
  const findParentArrayField = (fieldId, fieldsArray, parentField = null) => {
    for (const f of fieldsArray) {
      if (f.id === fieldId) {
        return parentField?.type === 'array' ? parentField : null;
      }
      if (f.children) {
        const result = findParentArrayField(fieldId, f.children, f);
        if (result) return result;
      }
    }
    return null;
  };

  // Helper function to update elementLabelProp in parent array
  const updateParentArrayElementLabel = (arrayField, newElementLabelProp) => {
    const updatedArrayField = {
      ...arrayField,
      uischema: {
        ...arrayField.uischema,
        options: {
          ...arrayField.uischema?.options,
          elementLabelProp: newElementLabelProp,
        },
      },
    };
    // Update fields directly without changing selected field
    setFields((prev) => updateFieldById(prev, updatedArrayField));
  };

  // Helper function to clear elementLabelProp from other fields in the same array
  const clearElementLabelFromSiblings = (arrayField, currentFieldKey) => {
    if (!arrayField?.children) return;

    const updateChildren = (children) => {
      return children.map((child) => {
        if (child.key !== currentFieldKey && child.isElementLabel) {
          const updatedChild = {
            ...child,
            isElementLabel: false,
          };
          // Update fields directly without changing selected field
          setFields((prev) => updateFieldById(prev, updatedChild));
          return updatedChild;
        }
        if (child.children) {
          return {
            ...child,
            children: updateChildren(child.children),
          };
        }
        return child;
      });
    };

    updateChildren(arrayField.children);
  };
  useEffect(() => {
    setDefaultInput(
      Array.isArray(localField?.schema?.default)
        ? localField.schema.default.join(', ')
        : (localField?.schema?.default ?? '')
    );
  }, [localField?.schema?.default]);

  // Helper function to convert value based on enum data type
  const convertEnumValue = (value, type) => {
    switch (type) {
      case 'number':
        return Number(value);
      default:
        return value;
    }
  };

  useEffect(() => {
    if (field && fields) {
      // Check if field is inside an array of objects
      const parentArray = findParentArrayField(field.id, fields);
      setIsInsideArrayOfObjects(!!parentArray);
      setParentArrayField(parentArray);
    }

    if (field) {
      let updatedField = { ...field };
      if (field.visibility && field.visibility.length > 0) {
        setRows(field.visibility);
      }

      if (field.type === 'integer') {
        setIsInteger(true);
      }

      if (field.type === 'number' || field.type === 'integer') {
        setIsCurrency(field.uischema?.options?.currency === true);
      }

      if (
        field.type === 'multiselect' &&
        (field.schema?.type === 'array' || field.uischema?.options?.multi === true)
      ) {
        setIsMultiSelect(true);
      }

      if (
        field.type === 'multicheckbox' &&
        (field.schema?.type === 'array' || field.uischema?.options?.multi === true)
      ) {
        setIsMultiCheckbox(true);
      }

      // Ensure date fields have default dateTimeFormat in UI schema
      if (
        (field.schema?.format === 'date' ||
          field.schema?.format === 'datetime' ||
          field.schema?.format === 'time' ||
          field.type === 'date') &&
        !field.uischema?.options?.dateTimeFormat
      ) {
        const defaultFormat = field.uischema?.options?.includeTime
          ? 'DD MMM YYYY, HH:mm'
          : 'D MMM YYYY';

        updatedField = {
          ...field,
          uischema: {
            ...field.uischema,
            options: {
              ...field.uischema?.options,
              dateTimeFormat: defaultFormat,
            },
          },
        };
      }

      // Ensure date range fields have default dateTimeFormat
      if (
        field.schema?.type === 'object' &&
        field.schema?.properties?.startDate &&
        field.schema?.properties?.endDate &&
        !field.uischema?.options?.dateTimeFormat
      ) {
        updatedField = {
          ...field,
          uischema: {
            ...field.uischema,
            options: {
              ...field.uischema?.options,
              dateTimeFormat: 'D MMM YYYY',
              isDateRange: true,
            },
          },
        };
      }

      // Detect file upload fields and correct their type for display
      if (
        updatedField.schema?.format === 'data-url' ||
        (updatedField.uischema?.options && updatedField.uischema.options['ui:widget'] === 'file')
      ) {
        updatedField = {
          ...updatedField,
          type: 'file',
        };
      }
      setLocalField(updatedField);
      if (field.isLayout) {
        setLayout(field.type);
      }
      if (field.schema.enum) {
        setEnumOptions([...field.schema.enum]);
        // Detect enum data type from first value
        const firstValue = field.schema.enum[0];
        if (typeof firstValue === 'number') {
          setEnumDataType('number');
        } else {
          setEnumDataType('string');
        }
      } else if (field.schema.items?.enum) {
        setEnumOptions([...field.schema.items.enum]);
        // Detect enum data type from first value
        const firstValue = field.schema.items.enum[0];
        if (typeof firstValue === 'number') {
          setEnumDataType('number');
        } else {
          setEnumDataType('string');
        }
      } else {
        setEnumOptions([]);
        setEnumDataType('string');
      }
      setSelectedIcon(field.icon || '');
    }
  }, [field, fields, onFieldUpdate]);

  const emptyStateContainerSx = {
    p: 3,
    textAlign: 'center',
  };

  const emptyStateTitleSx = {
    fontWeight: 500,
    color: 'text.secondary',
  };

  const mb16 = {
    marginBottom: '16px',
  };

  if (!localField) {
    return (
      <Box sx={emptyStateContainerSx}>
        <IconSettings size={48} sx={mb16} color="currentColor" />

        <Typography variant="h6" color="textSecondary" sx={emptyStateTitleSx}>
          {t('selectFieldToEdit')}
        </Typography>

        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {t('clickToConfig')}
        </Typography>
      </Box>
    );
  }

  const handleUpdate = (updates, options = {}) => {
    const updatedField = { ...localField, ...updates };
    setLocalField(updatedField);
    onFieldUpdate(updatedField, options);
  };

  const handleSchemaUpdate = (schemaUpdates) => {
    const updatedSchema = { ...localField.schema, ...schemaUpdates };
    handleUpdate({ schema: updatedSchema });
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      const convertedValue = convertEnumValue(newOption.trim(), enumDataType);
      if (Number.isNaN(convertedValue)) return;
      if (enumOptions.includes(convertedValue)) return;
      const newOptions = [...enumOptions, convertedValue];
      setEnumOptions(newOptions);
      if (localField.schema?.type === 'array' && localField.schema?.items) {
        handleSchemaUpdate({
          items: {
            ...localField.schema.items,
            enumType: enumDataType,
            enum: newOptions,
          },
        });
      } else {
        handleSchemaUpdate({
          enumType: enumDataType,
          enum: newOptions,
        });
      }
      setNewOption('');
    }
  };

  const handleRemoveOption = (index) => {
    const newOptions = enumOptions.filter((_, i) => i !== index);
    setEnumOptions(newOptions);
    if (localField.schema?.type === 'array' && localField.schema?.items) {
      handleSchemaUpdate({
        items:
          newOptions.length > 0
            ? { enumType: enumDataType, enum: newOptions }
            : { enumType: 'string' },
      });
    } else {
      handleSchemaUpdate({
        enumType: newOptions.length > 0 ? enumDataType : 'string',
        enum: newOptions.length > 0 ? newOptions : undefined,
      });
    }
  };

  const handleFieldTypeChange = (newTypeId) => {
    const newFieldType = defaultFieldTypes.find((ft) => ft.id === newTypeId);
    if (newFieldType && !newFieldType.isLayout) {
      // Generate new key based on field type
      const keyParts = localField.key.split('_');
      const newKey =
        keyParts.length > 1 ? `${newTypeId}_${keyParts[1]}` : `${newTypeId}_${keyParts[0]}`;

      const updatedField = {
        ...localField,
        type: newFieldType.id,
        label: newFieldType.label,
        key: newKey,
        schema: { ...newFieldType.schema, title: newFieldType.label },
        uischema: {
          ...newFieldType.uischema,
          scope: `#/properties/${newKey}`,
        },
      };

      // Update isInteger state when switching between number and integer
      if (newTypeId === 'integer') {
        setIsInteger(true);
      } else if (newTypeId === 'number') {
        setIsInteger(false);
      }

      // Preserve enum options and uischema options
      if (
        hasEnumOptions &&
        ['select', 'radio', 'multiselect', 'multicheckbox'].includes(newTypeId)
      ) {
        if (newTypeId === 'multiselect' || newTypeId === 'multicheckbox') {
          updatedField.schema.items = {
            type: 'string',
            enum: enumOptions,
          };
          delete updatedField.schema.enum;
          // Preserve existing uischema options for multiselect
          if (localField.uischema?.options) {
            updatedField.uischema.options = {
              ...updatedField.uischema.options,
              ...localField.uischema.options,
              displayType: newTypeId === 'multiselect' ? 'dropdown' : 'checkbox',
            };
          }
        } else {
          updatedField.schema.enum = enumOptions;
          // Set format for radio
          if (newTypeId === 'radio') {
            updatedField.uischema.options = {
              ...updatedField.uischema.options,
              format: 'radio',
            };
          }
        }
      }
      setLocalField(updatedField);
      onFieldUpdate(updatedField);

      // Update enum options state for new type
      if (newFieldType.schema.enum) {
        setEnumOptions([...newFieldType.schema.enum]);
      } else if (newFieldType.schema.items?.enum) {
        setEnumOptions([...newFieldType.schema.items.enum]);
      } else if (!['select', 'radio', 'multiselect', 'multicheckbox'].includes(newTypeId)) {
        setEnumOptions([]);
      }
    }
  };

  const getCompatibleFieldTypes = () => {
    const toCheckedTypes = ['select', 'radio'];
    const toCheckedMultiType = ['multiselect', 'multicheckbox'];
    const currentSchemaType = toCheckedTypes.includes(localField.type)
      ? 'string'
      : toCheckedMultiType.includes(localField.type)
        ? 'array'
        : localField.type === 'checkbox'
          ? 'boolean'
          : localField.schema?.type;

    // Check if this is a date range field
    const isDateRange =
      localField.schema?.type === 'object' &&
      localField.schema?.properties?.startDate &&
      localField.schema?.properties?.endDate;

    // File upload fields should show file type option
    if (localField.type === 'file') {
      return availableFieldTypes.filter((ft) => ft.id === 'file');
    }

    // Array fields with enum items (multiselect) can switch between multiselect types and array
    if (currentSchemaType === 'array' && localField.schema?.items?.enum) {
      return availableFieldTypes.filter(
        (ft) => ft.id === 'multiselect' || ft.id === 'multicheckbox' || ft.id === 'array'
      );
    }

    // Array fields without enum can switch between array and multiselect types
    if (currentSchemaType === 'array' && localField.type !== 'file') {
      return availableFieldTypes.filter(
        (ft) => ft.id === 'array' || ft.id === 'multiselect' || ft.id === 'multicheckbox'
      );
    }

    // Date range fields should show date type option
    if (isDateRange) {
      return availableFieldTypes.filter((ft) => ft.id === 'date');
    }

    return availableFieldTypes.filter((ft) => {
      // Don't allow converting to array types from other types
      if (ft.id === 'array' || ft.id === 'multiselect' || ft.id === 'multicheckbox') return false;

      const targetSchemaType = ft.schema?.type;
      if (currentSchemaType === 'number' || currentSchemaType === 'integer') {
        if (targetSchemaType === 'number' || targetSchemaType === 'integer') return true;
      }

      // Allow switching within same schema type
      if (currentSchemaType === targetSchemaType) {
        return true;
      }

      return false;
    });
  };

  const availableFieldTypes = defaultFieldTypes.filter((ft) => {
    if (ft.isLayout) return false;

    // multiselect should depend on select field visibility
    if (ft.id === 'multiselect') {
      return visibleFields[ft.id] !== false && visibleFields['select'] !== false;
    }

    // multicheckbox should depend on checkbox field visibility
    if (ft.id === 'multicheckbox') {
      return visibleFields[ft.id] !== false && visibleFields['checkbox'] !== false;
    }

    return visibleFields[ft.id] !== false;
  });
  const hasEnumOptions =
    ['select', 'radio', 'multiselect', 'multicheckbox'].includes(localField.type) ||
    (localField.schema?.type === 'array' &&
      !!localField.schema?.items &&
      localField.uischema?.options?.multi) ||
    localField.uischema?.options?.format === 'select' ||
    (localField.type === 'checkbox' && localField.uischema?.options?.multi === true);

  const isGroup = localField.uischema?.type === 'Group';
  const isLayout = localField.isLayout && localField.uischema?.type !== 'Group';

  const handleUiOptionsUpdate = (updates) => {
    const existingUiOptions = localField.uischema?.options?.['ui:options'] || {};
    const updatedUiSchema = {
      ...localField.uischema,
      options: {
        ...localField.uischema?.options,
        'ui:options': {
          ...existingUiOptions,
          ...updates,
        },
      },
    };
    handleUpdate({ uischema: updatedUiSchema });
  };

  const outlinedTextFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
    },
  };

  const outlinedTextFieldNumberSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
    },
    width: 75,
  };

  const layoutSelectSx = {
    borderRadius: 2,
  };

  const layoutSelectRuleSx = {
    borderRadius: 2,
    //width: 110,
    fontSize: 13,
  };

  const fieldTypeMenuItemSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  };

  const requiredSwitchSx = {
    mt: 1,
  };

  const iconSelectorContainerSx = {
    mt: 2,
  };

  const accordionSx = {
    mb: 2,
    borderRadius: 0,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'none',
    mx: -2,
    transition: 'all 0.2s ease-in-out',
    '&:before': {
      display: 'none',
    },
    '&.Mui-expanded': {
      margin: '15px -15px',
    },
    '&:hover': {
      borderRadius: 0,
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    },
  };

  const accordionSummarySx = {
    '& .MuiAccordionSummary-content': {
      alignItems: 'center',
    },
    '&:hover': {
      borderRadius: 0,
      backgroundColor: 'action.hover',
    },
    borderRadius: 3,
  };

  const optionInputRowSx = {
    display: 'flex',
    gap: 1,
    mb: 2,
  };

  const newOptionTextFieldSx = {
    flex: 1,
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
    },
  };

  const addOptionButtonSx = {
    borderRadius: 1.5,
  };

  const optionChipsWrapperSx = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1,
  };

  const optionChipSx = {
    borderRadius: 1.5,
    '& .MuiChip-deleteIcon': {
      color: 'error.main',
      '&:hover': {
        color: 'error.dark',
      },
    },
  };

  const formControlLabelSx = { mb: 1, display: 'block' };

  const flattenFields = (fields) => {
    const result = [];

    function traverse(items) {
      for (const item of items) {
        // Add current item's id and label
        if (!item.isLayout) {
          result.push(item);
        }

        // If it has children, recursively traverse them
        if (item.children && Array.isArray(item.children)) {
          traverse(item.children);
        }
      }
    }

    traverse(fields);
    return result;
  };
  const filteredFields = flattenFields(fields);
  const excludedTypes = ['array', 'array-strings', 'file', 'date'];

  const convertFieldKey = (isInt, key) => {
    const splitedKey = key.split('_');
    if (splitedKey.length === 2) {
      const newKey = isInt ? `integer_${splitedKey[1]}` : `number_${splitedKey[1]}`;
      return newKey;
    }
    return key;
  };

  const arrEnumTypes = ['select', 'multiselect', 'radio', 'multicheckbox'];

  const getEnumData = (field) => {
    return ['select', 'radio'].includes(field.type)
      ? field.schema?.enum
      : field.schema?.items?.enum;
  };

  const fieldSelectionSx = {
    display: 'flex',
    gap: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: '5px',
  };

  return (
    <Box>
      {/* Basic Properties */}
      <Accordion defaultExpanded sx={accordionSx}>
        <AccordionSummary expandIcon={<IconChevronDown />} sx={accordionSummarySx}>
          <Typography variant="subtitle1" fontWeight={600}>
            {t('basicProperties')}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {/* Layout selector for vertical/horizontal layouts */}
            {isLayout && (
              <FormControl fullWidth margin="normal">
                <InputLabel id="layout-select-label">{t('layoutType')}</InputLabel>
                <Select
                  labelId="layout-select-label"
                  value={layout}
                  label={t('layoutType')}
                  onChange={handleLayoutChange}
                  sx={layoutSelectSx}
                >
                  {visibleFields['vertical-layout'] && (
                    <MenuItem value="vertical-layout">{t('verticalLayout')}</MenuItem>
                  )}
                  {visibleFields['horizontal-layout'] && (
                    <MenuItem value="horizontal-layout">{t('horizontalLayout')}</MenuItem>
                  )}
                </Select>
              </FormControl>
            )}

            {!isLayout && !isGroup && (
              <>
                <TextField
                  label={t('fieldKey')}
                  fullWidth
                  value={localField.key}
                  onChange={(e) => handleUpdate({ key: e.target.value })}
                  margin="normal"
                  disabled="true"
                  variant="outlined"
                  helperText={t('uniqueIdentifier')}
                  sx={outlinedTextFieldSx}
                />

                <FormControl fullWidth margin="normal">
                  <InputLabel>{t('fieldType')}</InputLabel>
                  <Select
                    value={localField.type}
                    label={t('fieldType')}
                    onChange={(e) => handleFieldTypeChange(e.target.value)}
                    sx={layoutSelectSx}
                  >
                    {getCompatibleFieldTypes().map((fieldType) => {
                      const IconComponent = fieldType.icon;
                      return (
                        <MenuItem key={fieldType.id} value={fieldType.id}>
                          <Box sx={fieldTypeMenuItemSx}>
                            <IconComponent size={18} />
                            <Typography>{fieldType.label}</Typography>
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </>
            )}

            {/* Multi-select toggle for select fields */}
            {(localField.type === 'select' || localField.type === 'multiselect') && (
              <FormControlLabel
                control={
                  <Switch
                    checked={isMultiSelect}
                    onChange={(e) => {
                      const isMulti = e.target.checked;
                      setIsMultiSelect(isMulti);
                      let updatedSchema = { ...localField.schema };
                      let updatedUISchema = { ...localField.uischema };
                      let type = '';
                      let label = '';
                      let newKey = '';
                      delete updatedSchema.default;
                      if (isMulti) {
                        // Convert to multi-select
                        type = 'multiselect';
                        label = 'Multi Select';
                        const keyParts = localField.key.split('_');
                        newKey =
                          keyParts.length > 1
                            ? `multiselect_${keyParts[1]}`
                            : `multiselect_${keyParts[0]}`;
                        updatedSchema.type = 'array';
                        updatedSchema.items = {
                          type: 'string',
                          enum: enumOptions,
                        };
                        updatedSchema.uniqueItems = true;
                        delete updatedSchema.enum;
                        updatedUISchema.options = {
                          ...updatedUISchema.options,
                          multi: true,
                          format: 'select',
                          displayType: 'autocomplete',
                          autocompleteProps: {
                            limitTags: 5,
                          },
                        };
                        updatedUISchema.scope = `#/properties/${newKey}`;
                      } else {
                        // Convert to single select
                        type = 'select';
                        label = 'Select';
                        const keyParts = localField.key.split('_');
                        newKey =
                          keyParts.length > 1 ? `select_${keyParts[1]}` : `select_${keyParts[0]}`;
                        updatedSchema.type = 'string';
                        updatedSchema.enum = enumOptions;
                        delete updatedSchema.items;
                        delete updatedSchema.uniqueItems;
                        updatedUISchema.options = {
                          ...updatedUISchema.options,
                          multi: false,
                        };
                        delete updatedUISchema.options.displayType;
                        delete updatedUISchema.options.autocompleteProps;
                        updatedUISchema.scope = `#/properties/${newKey}`;
                      }

                      handleUpdate(
                        {
                          type,
                          label,
                          key: newKey,
                          schema: updatedSchema,
                          uischema: updatedUISchema,
                        },
                        {
                          resetFormData: true, // Clear the form data for this field
                        }
                      );
                    }}
                    color="primary"
                  />
                }
                label={t('enableMultiSelect')}
                sx={{ mb: 2, display: 'block' }}
              />
            )}

            {(localField.type === 'number' || localField.type === 'integer') && (
              <>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isInteger}
                      onChange={(e) => {
                        const isInt = e.target.checked;
                        setIsInteger(isInt);
                        let key = convertFieldKey(isInt, localField.key);

                        const type = isInt ? 'integer' : 'number';
                        const label = isInt ? 'Integer' : 'Number';
                        const updatedSchema = {
                          ...localField.schema,
                          type,
                          title: label,
                        };
                        handleUpdate({
                          type,
                          label,
                          key,
                          schema: updatedSchema,
                        });
                      }}
                      color="primary"
                    />
                  }
                  label={t('acceptInteger')}
                  sx={{ mb: 2, display: 'block' }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={isCurrency}
                      onChange={(e) => {
                        const useCurrency = e.target.checked;
                        setIsCurrency(useCurrency);
                        const updatedUISchema = {
                          ...localField.uischema,
                          options: {
                            ...localField.uischema?.options,
                            currency: useCurrency,
                            format: useCurrency ? 'currency' : undefined,
                          },
                        };
                        handleUpdate({ uischema: updatedUISchema });
                      }}
                      color="primary"
                    />
                  }
                  label={t('useAsCurrencyPrefix')}
                  sx={{ mb: 2, display: 'block' }}
                />
              </>
            )}

            {/* Multi-select toggle for checkbox fields */}
            {(localField.type === 'checkbox' || localField.type === 'multicheckbox') && (
              <FormControlLabel
                control={
                  <Switch
                    checked={isMultiCheckbox}
                    onChange={(e) => {
                      const isMulti = e.target.checked;
                      setIsMultiCheckbox(isMulti);
                      let updatedSchema = { ...localField.schema };
                      let updatedUISchema = { ...localField.uischema };
                      delete updatedSchema.default;
                      let type = '';
                      let label = '';
                      let newKey = '';
                      if (isMulti) {
                        type = 'multicheckbox';
                        label = 'Multi Checkbox';
                        const keyParts = localField.key.split('_');
                        newKey =
                          keyParts.length > 1
                            ? `multicheckbox_${keyParts[1]}`
                            : `multicheckbox_${keyParts[0]}`;
                        const defaultEnumOptions =
                          enumOptions.length > 0
                            ? enumOptions
                            : ['Option 1', 'Option 2', 'Option 3'];
                        updatedSchema.type = 'array';
                        updatedSchema.items = {
                          type: 'string',
                          enum: defaultEnumOptions,
                        };
                        updatedSchema.uniqueItems = true;
                        updatedUISchema.options = {
                          ...updatedUISchema.options,
                          multi: true,
                          format: 'checkbox',
                          displayType: 'checkbox',
                        };
                        updatedUISchema.scope = `#/properties/${newKey}`;
                        // Initialize enum options if not already set
                        if (enumOptions.length === 0) {
                          setEnumOptions(defaultEnumOptions);
                        }
                      } else {
                        type = 'checkbox';
                        label = 'Checkbox';
                        const keyParts = localField.key.split('_');
                        newKey =
                          keyParts.length > 1
                            ? `checkbox_${keyParts[1]}`
                            : `checkbox_${keyParts[0]}`;
                        // Convert to single checkbox (boolean)
                        updatedSchema.type = 'boolean';
                        delete updatedSchema.items;
                        delete updatedSchema.uniqueItems;
                        delete updatedSchema.enum;
                        updatedUISchema.options = {
                          ...updatedUISchema.options,
                          multi: false,
                        };
                        delete updatedUISchema.options.format;
                        delete updatedUISchema.options.displayType;
                        updatedUISchema.scope = `#/properties/${newKey}`;
                      }

                      handleUpdate(
                        {
                          type,
                          label,
                          key: newKey,
                          schema: updatedSchema,
                          uischema: updatedUISchema,
                        },
                        {
                          resetFormData: true, // Clear the form data for this field
                        }
                      );
                    }}
                    color="primary"
                  />
                }
                label={t('enableMultiCheckbox')}
                sx={{ mb: 2, display: 'block' }}
              />
            )}

            {/* Textarea toggle for text fields */}
            {localField.type === 'text' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={localField.uischema?.options?.multi === true}
                    onChange={(e) => {
                      const isMulti = e.target.checked;
                      let updatedUISchema = { ...localField.uischema };

                      updatedUISchema.options = {
                        ...updatedUISchema.options,
                        multi: isMulti,
                      };

                      handleUpdate({
                        uischema: updatedUISchema,
                      });
                    }}
                    color="primary"
                  />
                }
                label={t('enableTextarea')}
                sx={{ mb: 2, display: 'block' }}
              />
            )}

            {isGroup && (
              <>
                <TextField
                  label={t('groupName')}
                  fullWidth
                  value={localField.label}
                  onChange={(e) => {
                    const newLabel = e.target.value;
                    const updatedUISchema = {
                      ...localField.uischema,
                      label: newLabel,
                    };
                    handleUpdate({
                      label: newLabel,
                      uischema: updatedUISchema,
                    });
                  }}
                  margin="normal"
                  variant="outlined"
                  helperText={t('displayedAsHeader')}
                  sx={outlinedTextFieldSx}
                />
                <Box sx={iconSelectorContainerSx}>
                  <IconSelector
                    value={selectedIcon}
                    onChange={(iconName) => {
                      setSelectedIcon(iconName);
                      handleUpdate({ icon: iconName });
                    }}
                  />
                </Box>
              </>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
      {/* Display Options */}
      {!isLayout && !isGroup && (
        <Accordion sx={accordionSx}>
          <AccordionSummary expandIcon={<IconChevronDown />} sx={accordionSummarySx}>
            <Typography variant="subtitle1" fontWeight={600}>
              {t('displayOptions')}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Box>
              {localField.type !== 'file' && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={localField.uischema?.options?.readonly || false}
                      onChange={(e) => {
                        const updatedUISchema = {
                          ...localField.uischema,
                          options: {
                            ...localField.uischema?.options,
                            readonly: e.target.checked,
                          },
                        };

                        if (e.target.checked) {
                          // Clear all validation rules when readonly is enabled
                          const clearedSchema = {
                            ...localField.schema,
                            required: undefined,
                            minLength: undefined,
                            maxLength: undefined,
                            pattern: undefined,
                            minimum: undefined,
                            maximum: undefined,
                            formatMinimum: undefined,
                            formatMaximum: undefined,
                            minItems: undefined,
                            maxItems: undefined,
                          };

                          if (clearedSchema.properties?.startDate) {
                            clearedSchema.properties.startDate = {
                              ...clearedSchema.properties.startDate,
                              formatMinimum: undefined,
                              formatMaximum: undefined,
                            };
                          }

                          if (clearedSchema.properties?.endDate) {
                            clearedSchema.properties.endDate = {
                              ...clearedSchema.properties.endDate,
                              formatMinimum: undefined,
                              formatMaximum: undefined,
                            };
                          }

                          handleUpdate({
                            uischema: updatedUISchema,
                            schema: clearedSchema,
                            required: false,
                          });
                        } else {
                          handleUpdate({ uischema: updatedUISchema });
                        }
                      }}
                      color="primary"
                    />
                  }
                  label={t('readOnly')}
                  sx={formControlLabelSx}
                />
              )}

              {/* Show label field only for non-layout and non-group fields */}
              {localField.type !== 'layout' && localField.type !== 'group' && (
                <TextField
                  label={t('label')}
                  fullWidth
                  value={localField.label}
                  onChange={(e) => {
                    handleUpdate({ label: e.target.value });
                  }}
                  margin="normal"
                  variant="outlined"
                  helperText={t('displayLabel')}
                  sx={outlinedTextFieldSx}
                />
              )}

              {/* Date Format Selector for Date Fields */}
              {localField.schema?.format === 'date' ||
              localField.schema?.format === 'date-time' ||
              localField.schema?.format === 'datetime' ||
              localField.schema?.format === 'time' ||
              localField.type === 'date' ||
              (localField.schema?.type === 'object' &&
                localField.schema?.properties?.startDate &&
                localField.schema?.properties?.endDate) ? (
                <>
                  {/* Date Type Selector */}
                  <FormControl fullWidth margin="normal" sx={outlinedTextFieldSx}>
                    <InputLabel>{t('dateType')}</InputLabel>
                    <Select
                      value={(() => {
                        const isRange =
                          localField.schema?.type === 'object' &&
                          localField.schema?.properties?.startDate &&
                          localField.schema?.properties?.endDate;
                        const includeTime = localField.uischema?.options?.includeTime;

                        if (isRange) return 'range';
                        if (includeTime) return 'datetime';
                        return 'date';
                      })()}
                      onChange={(e) => {
                        const type = e.target.value;
                        let updatedSchema = { ...localField.schema };
                        let updatedUISchema = {
                          ...localField.uischema,
                          options: { ...localField.uischema?.options },
                        };

                        // Reset values
                        updatedSchema.default = undefined;
                        updatedSchema.formatMinimum = undefined;
                        updatedSchema.formatMaximum = undefined;
                        delete updatedSchema.minimum;
                        delete updatedSchema.maximum;

                        if (type === 'date') {
                          // Simple date
                          updatedSchema.type = 'string';
                          updatedSchema.format = 'date';
                          updatedUISchema.options.includeTime = false;
                          updatedUISchema.options.isDateRange = false;
                          updatedUISchema.options.dateTimeFormat = 'D MMM YYYY';
                          delete updatedSchema.properties;
                          delete updatedSchema.items;
                        } else if (type === 'datetime') {
                          // Date with time
                          updatedSchema.type = 'string';
                          updatedSchema.format = 'date-time';
                          updatedUISchema.options.includeTime = true;
                          updatedUISchema.options.isDateRange = false;
                          updatedUISchema.options.dateTimeFormat = 'DD MMM YYYY, HH:mm';
                          delete updatedSchema.properties;
                          delete updatedSchema.items;
                        } else if (type === 'range') {
                          // Date range
                          updatedSchema.type = 'object';
                          updatedSchema.properties = {
                            startDate: {
                              type: 'string',
                              format: 'date',
                              title: t('startDate'),
                            },
                            endDate: {
                              type: 'string',
                              format: 'date',
                              title: t('endDate'),
                            },
                          };
                          updatedSchema.required = ['startDate', 'endDate'];
                          delete updatedSchema.format;
                          updatedUISchema.options.isDateRange = true;
                          updatedUISchema.options.includeTime = false;
                          updatedUISchema.options.dateTimeFormat = 'D MMM YYYY';
                        }

                        handleUpdate(
                          {
                            type: 'date', // Keep field type as 'date' regardless of schema type
                            schema: updatedSchema,
                            uischema: updatedUISchema,
                          },
                          { resetFormData: true }
                        );
                      }}
                      label={t('dateType')}
                    >
                      <MenuItem value="date">{t('dateOnly')}</MenuItem>
                      <MenuItem value="datetime">{t('dateAndTime')}</MenuItem>
                      <MenuItem value="range">{t('dateRange')}</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Date Format Selector */}
                  {!(
                    localField.schema?.type === 'object' &&
                    localField.schema?.properties?.startDate &&
                    localField.schema?.properties?.endDate
                  ) && (
                    <FormControl fullWidth margin="normal" sx={outlinedTextFieldSx}>
                      <InputLabel>{t('dateDisplayFormat')}</InputLabel>
                      <Select
                        value={(() => {
                          const currentFormat = localField.uischema?.options?.dateTimeFormat;
                          const includeTime = localField.uischema?.options?.includeTime;

                          if (!includeTime) {
                            const dateOnlyFormats = [
                              'D MMM YYYY',
                              'DD MMMM YYYY',
                              'MM/DD/YYYY',
                              'DD/MM/YYYY',
                              'YYYY-MM-DD',
                            ];
                            return dateOnlyFormats.includes(currentFormat)
                              ? currentFormat
                              : 'D MMM YYYY';
                          } else {
                            const dateTimeFormats = [
                              'DD MMM YYYY, HH:mm',
                              'MMMM D, YYYY at h:mm A',
                              'MMM D, YYYY • HH:mm',
                              'ddd, D MMM YYYY, HH:mm',
                            ];
                            return dateTimeFormats.includes(currentFormat)
                              ? currentFormat
                              : 'DD MMM YYYY, HH:mm';
                          }
                        })()}
                        label={t('dateDisplayFormat')}
                        onChange={(e) => {
                          const updatedUISchema = {
                            ...localField.uischema,
                            options: {
                              ...localField.uischema?.options,
                              dateTimeFormat: e.target.value,
                            },
                          };
                          handleUpdate({ uischema: updatedUISchema });
                        }}
                      >
                        {!localField.uischema?.options?.includeTime
                          ? [
                              <MenuItem key="D MMM YYYY" value="D MMM YYYY">
                                D MMM YYYY (8 Jan 2025)
                              </MenuItem>,
                              <MenuItem key="DD MMMM YYYY" value="DD MMMM YYYY">
                                DD MMMM YYYY (08 January 2025)
                              </MenuItem>,
                              <MenuItem key="MM/DD/YYYY" value="MM/DD/YYYY">
                                MM/DD/YYYY (01/08/2025)
                              </MenuItem>,
                              <MenuItem key="DD/MM/YYYY" value="DD/MM/YYYY">
                                DD/MM/YYYY (08/01/2025)
                              </MenuItem>,
                              <MenuItem key="YYYY-MM-DD" value="YYYY-MM-DD">
                                YYYY-MM-DD (2025-01-08)
                              </MenuItem>,
                            ]
                          : [
                              <MenuItem key="DD MMM YYYY, HH:mm" value="DD MMM YYYY, HH:mm">
                                DD MMM YYYY, HH:mm (08 Jan 2025, 14:30)
                              </MenuItem>,
                              <MenuItem key="MMMM D, YYYY at h:mm A" value="MMMM D, YYYY at h:mm A">
                                MMMM D, YYYY at h:mm A (January 8, 2025 at 2:30 PM)
                              </MenuItem>,
                              <MenuItem key="MMM D, YYYY • HH:mm" value="MMM D, YYYY • HH:mm">
                                MMM D, YYYY • HH:mm (Jan 8, 2025 • 14:30)
                              </MenuItem>,
                              <MenuItem key="ddd, D MMM YYYY, HH:mm" value="ddd, D MMM YYYY, HH:mm">
                                ddd, D MMM YYYY, HH:mm (Thu, 8 Jan 2025, 14:30)
                              </MenuItem>,
                            ]}
                      </Select>
                    </FormControl>
                  )}

                  {/* Default Date Value Picker */}
                  {!(
                    localField.schema?.type === 'object' &&
                    localField.schema?.properties?.startDate &&
                    localField.schema?.properties?.endDate
                  ) && (
                    <TextField
                      label={t('defaultDateValue')}
                      type={localField.uischema?.options?.includeTime ? 'datetime-local' : 'date'}
                      fullWidth
                      value={(() => {
                        const defaultDate = localField.schema?.default;
                        if (!defaultDate) return '';

                        const includeTime = localField.uischema?.options?.includeTime;
                        if (includeTime) {
                          const date = new Date(defaultDate);
                          if (!isNaN(date.getTime())) {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const hours = String(date.getHours()).padStart(2, '0');
                            const minutes = String(date.getMinutes()).padStart(2, '0');
                            return `${year}-${month}-${day}T${hours}:${minutes}`;
                          }
                        }
                        return defaultDate ? defaultDate.split('T')[0] : '';
                      })()}
                      onChange={(e) => {
                        let dateValue = e.target.value;

                        if (dateValue) {
                          const includeTime = localField.uischema?.options?.includeTime;
                          if (includeTime) {
                            const date = new Date(dateValue);
                            dateValue = date.toISOString();
                          } else {
                            dateValue = dateValue.split('T')[0];
                          }
                        } else {
                          dateValue = undefined;
                        }

                        handleSchemaUpdate({ default: dateValue });
                      }}
                      inputProps={{
                        min: (() => {
                          const minDate = localField.schema?.formatMinimum;
                          if (!minDate) return undefined;
                          const includeTime = localField.uischema?.options?.includeTime;
                          if (includeTime) {
                            const date = new Date(minDate);
                            if (!isNaN(date.getTime())) {
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              const hours = String(date.getHours()).padStart(2, '0');
                              const minutes = String(date.getMinutes()).padStart(2, '0');
                              return `${year}-${month}-${day}T${hours}:${minutes}`;
                            }
                          }
                          return minDate ? minDate.split('T')[0] : undefined;
                        })(),
                        max: (() => {
                          const maxDate = localField.schema?.formatMaximum;
                          if (!maxDate) return undefined;
                          const includeTime = localField.uischema?.options?.includeTime;
                          if (includeTime) {
                            const date = new Date(maxDate);
                            if (!isNaN(date.getTime())) {
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              const hours = String(date.getHours()).padStart(2, '0');
                              const minutes = String(date.getMinutes()).padStart(2, '0');
                              return `${year}-${month}-${day}T${hours}:${minutes}`;
                            }
                          }
                          return maxDate ? maxDate.split('T')[0] : undefined;
                        })(),
                      }}
                      margin="normal"
                      variant="outlined"
                      helperText={t('defaultDateHelp')}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      InputProps={{
                        endAdornment: localField.schema?.default && (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleSchemaUpdate({
                                  default: undefined,
                                })
                              }
                              edge="end"
                              sx={{
                                color: 'text.secondary',
                                '&:hover': { color: 'error.main' },
                              }}
                            >
                              <IconX size={16} />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={outlinedTextFieldSx}
                    />
                  )}

                  {/* Default Date Range Values - only for date range fields */}
                  {localField.schema?.type === 'object' &&
                    localField.schema?.properties?.startDate &&
                    localField.schema?.properties?.endDate && (
                      <>
                        <Box sx={{ mt: 2, mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight={500}>
                            {t('defaultDateRange')}
                          </Typography>
                        </Box>
                        <Grid container spacing={2}>
                          {/* Start Date Default */}
                          <Grid item xs={6}>
                            <TextField
                              label={t('defaultStartDate')}
                              type="date"
                              fullWidth
                              value={(() => {
                                const defaultDate =
                                  localField.schema?.properties?.startDate?.default;
                                return defaultDate ? defaultDate.split('T')[0] : '';
                              })()}
                              inputProps={{
                                min: (() => {
                                  const minStartDate =
                                    localField.schema?.properties?.startDate?.formatMinimum;
                                  return minStartDate ? minStartDate.split('T')[0] : undefined;
                                })(),
                                max: (() => {
                                  const endDateDefault =
                                    localField.schema?.properties?.endDate?.default;
                                  const maxEndDate =
                                    localField.schema?.properties?.endDate?.formatMaximum;
                                  if (endDateDefault) return endDateDefault.split('T')[0];
                                  return maxEndDate ? maxEndDate.split('T')[0] : undefined;
                                })(),
                              }}
                              onChange={(e) => {
                                let dateValue = e.target.value;
                                if (dateValue) {
                                  const date = new Date(dateValue);
                                  dateValue = date.toISOString().split('T')[0];
                                } else {
                                  dateValue = undefined;
                                }
                                handleSchemaUpdate({
                                  properties: {
                                    ...localField.schema.properties,
                                    startDate: {
                                      ...localField.schema.properties.startDate,
                                      default: dateValue,
                                    },
                                  },
                                });
                              }}
                              margin="normal"
                              variant="outlined"
                              helperText={t('defaultStartDateHelp')}
                              InputLabelProps={{
                                shrink: true,
                              }}
                              InputProps={{
                                endAdornment: localField.schema?.properties?.startDate?.default && (
                                  <InputAdornment position="end">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleSchemaUpdate({
                                          properties: {
                                            ...localField.schema.properties,
                                            startDate: {
                                              ...localField.schema.properties.startDate,
                                              default: undefined,
                                            },
                                          },
                                        })
                                      }
                                      edge="end"
                                      sx={{
                                        color: 'text.secondary',
                                        '&:hover': { color: 'error.main' },
                                      }}
                                    >
                                      <IconX size={16} />
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>

                          {/* End Date Default */}
                          <Grid item xs={6}>
                            <TextField
                              label={t('defaultEndDate')}
                              type="date"
                              fullWidth
                              value={(() => {
                                const defaultDate = localField.schema?.properties?.endDate?.default;
                                return defaultDate ? defaultDate.split('T')[0] : '';
                              })()}
                              inputProps={{
                                min: (() => {
                                  const startDateDefault =
                                    localField.schema?.properties?.startDate?.default;
                                  const minStartDate =
                                    localField.schema?.properties?.startDate?.formatMinimum;
                                  if (startDateDefault) return startDateDefault.split('T')[0];
                                  return minStartDate ? minStartDate.split('T')[0] : undefined;
                                })(),
                                max: (() => {
                                  const maxEndDate =
                                    localField.schema?.properties?.endDate?.formatMaximum;
                                  return maxEndDate ? maxEndDate.split('T')[0] : undefined;
                                })(),
                              }}
                              onChange={(e) => {
                                let dateValue = e.target.value;
                                if (dateValue) {
                                  const date = new Date(dateValue);
                                  dateValue = date.toISOString().split('T')[0];
                                } else {
                                  dateValue = undefined;
                                }
                                handleSchemaUpdate({
                                  properties: {
                                    ...localField.schema.properties,
                                    endDate: {
                                      ...localField.schema.properties.endDate,
                                      default: dateValue,
                                    },
                                  },
                                });
                              }}
                              margin="normal"
                              variant="outlined"
                              helperText={t('defaultEndDateHelp')}
                              InputLabelProps={{
                                shrink: true,
                              }}
                              InputProps={{
                                endAdornment: localField.schema?.properties?.endDate?.default && (
                                  <InputAdornment position="end">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleSchemaUpdate({
                                          properties: {
                                            ...localField.schema.properties,
                                            endDate: {
                                              ...localField.schema.properties.endDate,
                                              default: undefined,
                                            },
                                          },
                                        })
                                      }
                                      edge="end"
                                      sx={{
                                        color: 'text.secondary',
                                        '&:hover': { color: 'error.main' },
                                      }}
                                    >
                                      <IconX size={16} />
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          </Grid>
                        </Grid>
                      </>
                    )}
                </>
              ) : // Default Value field for non-date fields
              localField.type !== 'array' &&
                localField.type !== 'checkbox' &&
                localField.type !== 'file' &&
                !arrEnumTypes.includes(localField.type) ? (
                <TextField
                  label={t('defaultValue')}
                  fullWidth
                  type={
                    localField.type === 'number' || localField.type === 'integer'
                      ? 'number'
                      : 'text'
                  }
                  value={defaultInput}
                  onChange={(e) => {
                    setDefaultInput(e.target.value);
                    onFieldUpdate({ defaultvalueUpdate: true });
                  }}
                  onBlur={(e) => {
                    let defaultValue = e.target.value;

                    // Convert to appropriate type
                    if (localField.type === 'number' || localField.type === 'integer') {
                      defaultValue = defaultValue ? Number(defaultValue) : undefined;
                      handleSchemaUpdate({ default: defaultValue });
                    } else if (localField.type === 'checkbox') {
                      defaultValue = defaultValue.toLowerCase() === 'true';
                      handleSchemaUpdate({ default: defaultValue });
                    } else {
                      handleSchemaUpdate({ default: defaultValue });
                    }
                  }}
                  margin="normal"
                  variant="outlined"
                  helperText={t('initialValue')}
                  sx={outlinedTextFieldSx}
                />
              ) : localField.type === 'checkbox' ? (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={localField.schema?.default === true} // reflects builder default
                      onChange={(e) => {
                        handleSchemaUpdate({ default: e.target.checked });
                      }}
                    />
                  }
                  label={t('checkedByDefault')}
                />
              ) : arrEnumTypes.includes(localField.type) ? (
                <FormControl fullWidth margin="normal">
                  <InputLabel>{t('defaultValue')}</InputLabel>
                  <Select
                    value={localField.schema?.default || []}
                    multiple={
                      localField.type === 'multiselect' || localField.type === 'multicheckbox'
                    }
                    label={t('defaultValue')}
                    onChange={(e) => {
                      handleSchemaUpdate({
                        default: e.target.value,
                      });
                    }}
                    sx={layoutSelectSx}
                  >
                    {getEnumData(localField).map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : null}
              {/* Array Item Type Selector */}
              {localField.type === 'array' && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>{t('arrayItemType')}</InputLabel>
                  <Select
                    value={localField.schema?.items?.type || 'object'}
                    label={t('arrayItemType')}
                    onChange={(e) => {
                      const itemType = e.target.value;
                      let updatedSchema = { ...localField.schema };

                      if (itemType === 'object') {
                        // For objects, set up the structure with detail layout
                        updatedSchema.items = {
                          type: 'object',
                          properties: {},
                        };

                        const updatedUISchema = {
                          ...localField.uischema,
                          options: {
                            ...localField.uischema?.options,
                            detail: {
                              type: 'VerticalLayout',
                              elements: [],
                            },
                          },
                        };

                        handleUpdate({
                          schema: updatedSchema,
                          uischema: updatedUISchema,
                        });
                      } else {
                        // For primitive types (string/number), remove object-specific properties
                        updatedSchema.items = { type: itemType };

                        const updatedUISchema = {
                          ...localField.uischema,
                          options: {
                            ...localField.uischema?.options,
                            detail: undefined,
                            elementLabelProp: undefined,
                          },
                        };

                        handleUpdate({
                          schema: updatedSchema,
                          uischema: updatedUISchema,
                        });
                      }
                    }}
                    sx={layoutSelectSx}
                  >
                    <MenuItem value="string">{t('string')}</MenuItem>
                    <MenuItem value="number">{t('number')}</MenuItem>
                    <MenuItem value="object">{t('object')}</MenuItem>
                  </Select>
                </FormControl>
              )}

              <TextField
                label={t('description')}
                fullWidth
                multiline
                rows={2}
                value={localField.schema?.description || ''}
                onChange={(e) => handleSchemaUpdate({ description: e.target.value || undefined })}
                margin="normal"
                variant="outlined"
                helperText={t('helpText')}
                sx={outlinedTextFieldSx}
              />
              {/* Multiselect Display Type */}
              {(localField.type === 'multiselect' ||
                localField.type === 'multicheckbox' ||
                isMultiCheckbox ||
                isMultiSelect) && (
                <>
                  {localField.uischema?.options?.displayType !== 'checkbox' && !isMultiCheckbox && (
                    <TextField
                      label={t('visibleChipsCount')}
                      type="number"
                      fullWidth
                      value={localField.uischema?.options?.autocompleteProps?.limitTags || ''}
                      onChange={(e) => {
                        const count = e.target.value;
                        const updatedUISchema = {
                          ...localField.uischema,
                          options: {
                            ...localField.uischema?.options,
                            autocompleteProps: {
                              ...localField.uischema?.options?.autocompleteProps,
                              limitTags: Number(count),
                            },
                          },
                        };
                        handleUpdate({ uischema: updatedUISchema });
                      }}
                      margin="normal"
                      variant="outlined"
                      helperText={t('chipsCountHelp')}
                      inputProps={{ min: 1, max: 20 }}
                      sx={outlinedTextFieldSx}
                    />
                  )}

                  {/* Maximum Selections Limit */}
                  <TextField
                    label={t('maxSelections')}
                    type="number"
                    fullWidth
                    value={localField.uischema?.options?.maxSelections || ''}
                    onChange={(e) => {
                      const maxSelections = e.target.value;
                      const enumOptions =
                        localField.schema?.enum || localField.schema?.items?.enum || [];
                      const maxPossible = Math.max(2, enumOptions.length);

                      const validMaxSelections =
                        maxSelections &&
                        Number(maxSelections) >= 2 &&
                        Number(maxSelections) <= maxPossible
                          ? Number(maxSelections)
                          : undefined;
                      const updatedUISchema = {
                        ...localField.uischema,
                        options: {
                          ...localField.uischema?.options,
                          maxSelections: validMaxSelections,
                        },
                      };
                      handleUpdate({ uischema: updatedUISchema });
                    }}
                    margin="normal"
                    variant="outlined"
                    helperText={(() => {
                      const enumOptions =
                        localField.schema?.enum || localField.schema?.items?.enum || [];
                      const maxPossible = enumOptions.length;
                      return `${t('maxSelectionsHelp')} (min 2, max ${maxPossible} available)`;
                    })()}
                    inputProps={{
                      min: 2,
                      max: Math.max(
                        2,
                        (localField.schema?.enum || localField.schema?.items?.enum || []).length
                      ),
                    }}
                    sx={outlinedTextFieldSx}
                  />
                </>
              )}
              {/* Password Confirmation Toggle */}
              {localField.type === 'password' && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={localField.requireConfirmation || false}
                      onChange={(e) => {
                        handleUpdate({ requireConfirmation: e.target.checked });
                      }}
                      color="primary"
                    />
                  }
                  label={t('requirePasswordConfirmation')}
                  sx={formControlLabelSx}
                />
              )}

              {/* Make Field as Element Label switch - only for fields inside array of objects */}
              {isInsideArrayOfObjects && !isLayout && !isGroup && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={localField.isElementLabel || false}
                      onChange={(e) => {
                        const isChecked = e.target.checked;

                        if (isChecked && parentArrayField) {
                          // Clear element label from other fields in the same array
                          clearElementLabelFromSiblings(parentArrayField, localField.key);

                          // Set this field as element label
                          handleUpdate({ isElementLabel: true });

                          // Update parent array's elementLabelProp
                          updateParentArrayElementLabel(parentArrayField, localField.key);
                        } else {
                          // Remove element label from this field
                          handleUpdate({ isElementLabel: false });

                          // Clear elementLabelProp from parent array if this was the selected field
                          if (
                            parentArrayField?.uischema?.options?.elementLabelProp === localField.key
                          ) {
                            updateParentArrayElementLabel(parentArrayField, undefined);
                          }
                        }
                      }}
                      color="primary"
                    />
                  }
                  label={t('makeFieldElementLabel')}
                  sx={formControlLabelSx}
                />
              )}

              {/* File Upload Options */}
              {localField.type === 'file' && (
                <>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="allowed-file-types-label" shrink>
                      {t('allowedFileTypes')}
                    </InputLabel>

                    <Select
                      labelId="allowed-file-types-label"
                      multiple
                      displayEmpty
                      label={t('allowedFileTypes')}
                      value={
                        localField.uischema?.options?.['ui:options']?.accept
                          ? localField.uischema.options['ui:options'].accept
                              .split(',')
                              .filter(Boolean)
                          : []
                      }
                      onChange={(e) => {
                        const values = e.target.value;
                        handleUiOptionsUpdate({
                          accept: values.length ? values.join(',') : undefined,
                        });
                      }}
                      renderValue={(selected) => {
                        if (selected.length === 0) {
                          return (
                            <Typography sx={{ color: 'text.disabled' }}>
                              {t('selectFileTypes')}
                            </Typography>
                          );
                        }
                        return selected
                          .map((mime) => FILE_TYPE_OPTIONS.find((o) => o.value === mime)?.label)
                          .join(', ');
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 240,
                            minWidth: 280,
                          },
                        },
                      }}
                    >
                      {FILE_TYPE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={
                          localField.uischema?.options?.['ui:options']?.enablePreview || false
                        }
                        onChange={(e) => {
                          const value = e.target.checked;
                          handleUiOptionsUpdate({
                            enablePreview: value,
                          });
                        }}
                        color="primary"
                      />
                    }
                    label={t('enablePreview')}
                    sx={{ mt: 1, mb: 1 }}
                  />
                </>
              )}

              {/* Enum Values for Select/Radio/Multiselect Fields */}
              {hasEnumOptions && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                    {t('enumValues')}
                  </Typography>

                  {/* Dynamic Data Toggle for select fields */}
                  {(localField.type === 'select' ||
                    localField.type === 'multiselect' ||
                    localField.type === 'multicheckbox' ||
                    (localField.schema?.type === 'array' &&
                      localField.uischema?.options?.multi)) && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localField.uischema?.options?.entity !== undefined}
                          onChange={(e) => {
                            const isDynamic = e.target.checked;
                            const isMultiSelectField =
                              localField.type === 'select' &&
                              (localField.schema?.type === 'array' ||
                                localField.uischema?.options?.multi);
                            const updatedUISchema = {
                              ...localField.uischema,
                              options: {
                                ...localField.uischema?.options,
                                format: isDynamic ? 'dynamicselect' : 'select',
                                multi: isMultiSelectField ? true : undefined,
                                entity: isDynamic ? '' : undefined,
                                key: isDynamic ? '' : undefined,
                                value: isDynamic ? '' : undefined,
                              },
                            };
                            handleUpdate({ uischema: updatedUISchema });
                          }}
                          color="primary"
                        />
                      }
                      label={t('useDynamicData')}
                      sx={{ mb: 2 }}
                    />
                  )}

                  {localField.uischema?.options?.entity !== undefined ? (
                    <Box>
                      <TextField
                        label={t('apiEntity')}
                        fullWidth
                        value={localField.uischema?.options?.entity || ''}
                        onChange={(e) => {
                          const updatedUISchema = {
                            ...localField.uischema,
                            options: {
                              ...localField.uischema?.options,
                              entity: e.target.value,
                            },
                          };
                          handleUpdate({ uischema: updatedUISchema });
                        }}
                        margin="normal"
                        variant="outlined"
                        helperText={t('apiEntityHelp')}
                        sx={outlinedTextFieldSx}
                      />
                      <TextField
                        label={t('valueFieldName')}
                        fullWidth
                        value={localField.uischema?.options?.key || ''}
                        onChange={(e) => {
                          const updatedUISchema = {
                            ...localField.uischema,
                            options: {
                              ...localField.uischema?.options,
                              key: e.target.value,
                            },
                          };
                          handleUpdate({ uischema: updatedUISchema });
                        }}
                        margin="normal"
                        variant="outlined"
                        helperText={t('valueFieldHelp')}
                        sx={outlinedTextFieldSx}
                      />
                      <TextField
                        label={t('labelFieldName')}
                        fullWidth
                        value={localField.uischema?.options?.value || ''}
                        onChange={(e) => {
                          const updatedUISchema = {
                            ...localField.uischema,
                            options: {
                              ...localField.uischema?.options,
                              value: e.target.value,
                            },
                          };
                          handleUpdate({ uischema: updatedUISchema });
                        }}
                        margin="normal"
                        variant="outlined"
                        helperText={t('labelFieldHelp')}
                        sx={outlinedTextFieldSx}
                      />
                    </Box>
                  ) : (
                    <>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>{t('enumDataType')}</InputLabel>
                        <Select
                          value={enumDataType}
                          label={t('enumDataType')}
                          onChange={(e) => {
                            const newType = e.target.value;
                            setEnumDataType(newType);

                            // Reset to default options based on type
                            const defaultOptions =
                              newType === 'number'
                                ? [1, 2, 3]
                                : ['Option 1', 'Option 2', 'Option 3'];
                            setEnumOptions(defaultOptions);
                            setDefaultInput('');
                            // Update schema with default options
                            if (localField.schema?.type === 'array' && localField.schema?.items) {
                              handleSchemaUpdate({
                                default: undefined,
                                items: {
                                  enumType: newType,
                                  enum: defaultOptions,
                                },
                              });
                            } else {
                              handleSchemaUpdate({
                                type: newType,
                                default: undefined,
                                enumType: newType,
                                enum: defaultOptions,
                              });
                            }
                          }}
                          sx={layoutSelectSx}
                        >
                          <MenuItem value="string">{t('string')}</MenuItem>
                          <MenuItem value="number">{t('number')}</MenuItem>
                        </Select>
                      </FormControl>

                      <Typography variant="body2" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
                        {t('addEnum')}
                      </Typography>

                      <Box sx={optionInputRowSx}>
                        <TextField
                          label={t('newOption')}
                          size="small"
                          value={newOption}
                          onChange={(e) => setNewOption(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddOption();
                            }
                          }}
                          variant="outlined"
                          sx={newOptionTextFieldSx}
                        />

                        <IconButton onClick={handleAddOption} sx={addOptionButtonSx}>
                          <IconPlus size={20} />
                        </IconButton>
                      </Box>

                      <Box sx={optionChipsWrapperSx}>
                        {enumOptions.map((option, index) => (
                          <Chip
                            key={index}
                            label={String(option)}
                            onDelete={() => handleRemoveOption(index)}
                            deleteIcon={<IconTrash size={16} />}
                            variant="outlined"
                            sx={optionChipSx}
                          />
                        ))}
                      </Box>
                    </>
                  )}
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
      {/* Validations */}
      {!isLayout && !isGroup && (
        <Accordion sx={accordionSx} disabled={localField.uischema?.options?.readonly || false}>
          <AccordionSummary expandIcon={<IconChevronDown />} sx={accordionSummarySx}>
            <Typography variant="subtitle1" fontWeight={600}>
              {t('validationRules')}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <FormControlLabel
              control={
                <Checkbox
                  checked={localField.required || false}
                  onChange={(e) => handleUpdate({ required: e.target.checked })}
                  color="primary"
                  disabled={localField.uischema?.options?.readonly || false}
                />
              }
              label={t('requiredField')}
              sx={requiredSwitchSx}
            />

            <Box>
              {(localField.type === 'text' ||
                localField.type === 'password' ||
                localField.type === 'url') && (
                <>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label={t('minLength')}
                        type="number"
                        fullWidth
                        value={localField.schema?.minLength || ''}
                        onChange={(e) =>
                          handleSchemaUpdate({
                            minLength: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === '-') {
                            e.preventDefault();
                          }
                        }}
                        margin="normal"
                        variant="outlined"
                        disabled={localField.uischema?.options?.readonly || false}
                        inputProps={{
                          step: 1,
                          min: 0,
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label={t('maxLength')}
                        type="number"
                        fullWidth
                        value={localField.schema?.maxLength || ''}
                        onChange={(e) =>
                          handleSchemaUpdate({
                            maxLength: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === '-') {
                            e.preventDefault();
                          }
                        }}
                        margin="normal"
                        variant="outlined"
                        disabled={localField.uischema?.options?.readonly || false}
                        inputProps={{
                          step: 1,
                          min: 0,
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    label={t('pattern')}
                    fullWidth
                    value={localField.schema?.pattern || ''}
                    onChange={(e) =>
                      handleSchemaUpdate({
                        pattern: e.target.value || undefined,
                      })
                    }
                    margin="normal"
                    variant="outlined"
                    disabled={localField.uischema?.options?.readonly || false}
                    helperText={t('patternHelp')}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </>
              )}

              {localField.type === 'email' && (
                <TextField
                  label={t('pattern')}
                  fullWidth
                  value={localField.schema?.pattern || ''}
                  onChange={(e) =>
                    handleSchemaUpdate({
                      pattern: e.target.value || undefined,
                    })
                  }
                  margin="normal"
                  variant="outlined"
                  disabled={localField.uischema?.options?.readonly || false}
                  helperText={t('patternHelp')}
                  sx={outlinedTextFieldSx}
                />
              )}
              {(localField.type === 'number' || localField.type === 'integer') && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label={t('minimumValue')}
                      type="number"
                      fullWidth
                      value={localField.schema?.minimum || ''}
                      onChange={(e) =>
                        handleSchemaUpdate({
                          minimum: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      margin="normal"
                      variant="outlined"
                      disabled={localField.uischema?.options?.readonly || false}
                      inputProps={localField.type === 'integer' ? { step: 1 } : {}}
                      sx={outlinedTextFieldSx}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      label={t('maximumValue')}
                      type="number"
                      fullWidth
                      value={localField.schema?.maximum || ''}
                      onChange={(e) =>
                        handleSchemaUpdate({
                          maximum: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      margin="normal"
                      variant="outlined"
                      disabled={localField.uischema?.options?.readonly || false}
                      inputProps={localField.type === 'integer' ? { step: 1 } : {}}
                      sx={outlinedTextFieldSx}
                    />
                  </Grid>
                </Grid>
              )}

              {/* Date Range Validation */}
              {(localField.schema?.format === 'date' ||
                localField.schema?.format === 'date-time' ||
                localField.schema?.format === 'datetime' ||
                localField.type === 'date') &&
                !(
                  localField.schema?.type === 'object' &&
                  localField.schema?.properties?.startDate &&
                  localField.schema?.properties?.endDate
                ) && (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label={t('minDate')}
                        type={localField.uischema?.options?.includeTime ? 'datetime-local' : 'date'}
                        fullWidth
                        value={(() => {
                          const minDate = localField.schema?.formatMinimum;
                          if (!minDate) return '';

                          const includeTime = localField.uischema?.options?.includeTime;
                          if (includeTime) {
                            const date = new Date(minDate);
                            if (!isNaN(date.getTime())) {
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              const hours = String(date.getHours()).padStart(2, '0');
                              const minutes = String(date.getMinutes()).padStart(2, '0');
                              return `${year}-${month}-${day}T${hours}:${minutes}`;
                            }
                          }

                          return minDate ? minDate.split('T')[0] : '';
                        })()}
                        onChange={(e) => {
                          let dateValue = e.target.value;

                          if (dateValue) {
                            const includeTime = localField.uischema?.options?.includeTime;
                            if (includeTime) {
                              // Keep datetime in local timezone format (YYYY-MM-DDTHH:mm:ss)
                              dateValue = dateValue + ':00';
                            } else {
                              // Ensure date-only format (YYYY-MM-DD)
                              dateValue = dateValue.split('T')[0];
                            }
                          } else {
                            dateValue = undefined;
                          }

                          handleSchemaUpdate({ formatMinimum: dateValue });

                          // Clear default if it's now invalid
                          const currentDefault = localField.schema?.default;
                          if (
                            currentDefault &&
                            dateValue &&
                            new Date(currentDefault) < new Date(dateValue)
                          ) {
                            handleSchemaUpdate({ formatMinimum: dateValue, default: undefined });
                          }
                        }}
                        inputProps={{
                          max: (() => {
                            const maxDate = localField.schema?.formatMaximum;
                            if (!maxDate) return undefined;
                            const includeTime = localField.uischema?.options?.includeTime;
                            if (includeTime) {
                              const date = new Date(maxDate);
                              if (!isNaN(date.getTime())) {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                const hours = String(date.getHours()).padStart(2, '0');
                                const minutes = String(date.getMinutes()).padStart(2, '0');
                                return `${year}-${month}-${day}T${hours}:${minutes}`;
                              }
                            }
                            return maxDate ? maxDate.split('T')[0] : undefined;
                          })(),
                        }}
                        margin="normal"
                        variant="outlined"
                        disabled={localField.uischema?.options?.readonly || false}
                        helperText={t('minDateHelp')}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          endAdornment: localField.schema?.formatMinimum && (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                onClick={() => handleSchemaUpdate({ formatMinimum: undefined })}
                                edge="end"
                                disabled={localField.uischema?.options?.readonly || false}
                                sx={{
                                  color: 'text.secondary',
                                  '&:hover': { color: 'error.main' },
                                }}
                              >
                                <IconX size={16} />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label={t('maxDate')}
                        type={localField.uischema?.options?.includeTime ? 'datetime-local' : 'date'}
                        fullWidth
                        value={(() => {
                          const maxDate = localField.schema?.formatMaximum;
                          if (!maxDate) return '';

                          const includeTime = localField.uischema?.options?.includeTime;
                          if (includeTime) {
                            const date = new Date(maxDate);
                            if (!isNaN(date.getTime())) {
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              const hours = String(date.getHours()).padStart(2, '0');
                              const minutes = String(date.getMinutes()).padStart(2, '0');
                              return `${year}-${month}-${day}T${hours}:${minutes}`;
                            }
                          }

                          return maxDate ? maxDate.split('T')[0] : '';
                        })()}
                        onChange={(e) => {
                          let dateValue = e.target.value;

                          if (dateValue) {
                            const includeTime = localField.uischema?.options?.includeTime;
                            if (includeTime) {
                              // Keep datetime in local timezone format (YYYY-MM-DDTHH:mm:ss)
                              dateValue = dateValue + ':00';
                            } else {
                              // Ensure date-only format (YYYY-MM-DD)
                              dateValue = dateValue.split('T')[0];
                            }
                          } else {
                            dateValue = undefined;
                          }

                          handleSchemaUpdate({ formatMaximum: dateValue });

                          // Clear default if it's now invalid
                          const currentDefault = localField.schema?.default;
                          if (
                            currentDefault &&
                            dateValue &&
                            new Date(currentDefault) > new Date(dateValue)
                          ) {
                            handleSchemaUpdate({ formatMaximum: dateValue, default: undefined });
                          }
                        }}
                        inputProps={{
                          min: (() => {
                            const minDate = localField.schema?.formatMinimum;
                            if (!minDate) return undefined;
                            const includeTime = localField.uischema?.options?.includeTime;
                            if (includeTime) {
                              const date = new Date(minDate);
                              if (!isNaN(date.getTime())) {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                const hours = String(date.getHours()).padStart(2, '0');
                                const minutes = String(date.getMinutes()).padStart(2, '0');
                                return `${year}-${month}-${day}T${hours}:${minutes}`;
                              }
                            }
                            return minDate ? minDate.split('T')[0] : undefined;
                          })(),
                        }}
                        margin="normal"
                        variant="outlined"
                        disabled={localField.uischema?.options?.readonly || false}
                        helperText={t('maxDateHelp')}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          endAdornment: localField.schema?.formatMaximum && (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                onClick={() => handleSchemaUpdate({ formatMaximum: undefined })}
                                edge="end"
                                disabled={localField.uischema?.options?.readonly || false}
                                sx={{
                                  color: 'text.secondary',
                                  '&:hover': { color: 'error.main' },
                                }}
                              >
                                <IconX size={16} />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                  </Grid>
                )}

              {/* Date Range Configuration */}
              {localField.schema?.type === 'object' &&
                localField.schema?.properties?.startDate &&
                localField.schema?.properties?.endDate && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 2, fontWeight: 500 }}>
                      {t('dateRangeValidation')}
                    </Typography>
                    <Grid container spacing={2}>
                      {/* Min Date */}
                      <Grid item xs={6}>
                        <TextField
                          label={t('minDate')}
                          type="date"
                          fullWidth
                          value={(() => {
                            const minDate = localField.schema?.properties?.startDate?.formatMinimum;
                            return minDate ? minDate.split('T')[0] : '';
                          })()}
                          onChange={(e) => {
                            let dateValue = e.target.value;
                            if (dateValue) {
                              const date = new Date(dateValue);
                              dateValue = date.toISOString().split('T')[0];
                            } else {
                              dateValue = undefined;
                            }

                            const updates = {
                              properties: {
                                ...localField.schema.properties,
                                startDate: {
                                  ...localField.schema.properties.startDate,
                                  formatMinimum: dateValue,
                                },
                                endDate: {
                                  ...localField.schema.properties.endDate,
                                  formatMinimum: dateValue,
                                },
                              },
                            };

                            // Clear defaults if they become invalid
                            const defaultStartDate =
                              localField.schema?.properties?.startDate?.default;
                            const defaultEndDate = localField.schema?.properties?.endDate?.default;

                            if (
                              defaultStartDate &&
                              dateValue &&
                              new Date(defaultStartDate) < new Date(dateValue)
                            ) {
                              updates.properties.startDate.default = undefined;
                            }
                            if (
                              defaultEndDate &&
                              dateValue &&
                              new Date(defaultEndDate) < new Date(dateValue)
                            ) {
                              updates.properties.endDate.default = undefined;
                            }

                            handleSchemaUpdate(updates);
                          }}
                          inputProps={{
                            max: (() => {
                              const maxEndDate =
                                localField.schema?.properties?.endDate?.formatMaximum;
                              return maxEndDate ? maxEndDate.split('T')[0] : undefined;
                            })(),
                          }}
                          margin="normal"
                          variant="outlined"
                          disabled={localField.uischema?.options?.readonly || false}
                          helperText={t('minDateRangeHelp')}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          InputProps={{
                            endAdornment: localField.schema?.properties?.startDate
                              ?.formatMinimum && (
                              <InputAdornment position="end">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleSchemaUpdate({
                                      properties: {
                                        ...localField.schema.properties,
                                        startDate: {
                                          ...localField.schema.properties.startDate,
                                          formatMinimum: undefined,
                                        },
                                        endDate: {
                                          ...localField.schema.properties.endDate,
                                          formatMinimum: undefined,
                                        },
                                      },
                                    })
                                  }
                                  edge="end"
                                  disabled={localField.uischema?.options?.readonly || false}
                                  sx={{
                                    color: 'text.secondary',
                                    '&:hover': { color: 'error.main' },
                                  }}
                                >
                                  <IconX size={16} />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>

                      {/* Max Date */}
                      <Grid item xs={6}>
                        <TextField
                          label={t('maxDate')}
                          type="date"
                          fullWidth
                          value={(() => {
                            const maxDate = localField.schema?.properties?.endDate?.formatMaximum;
                            return maxDate ? maxDate.split('T')[0] : '';
                          })()}
                          onChange={(e) => {
                            let dateValue = e.target.value;
                            if (dateValue) {
                              const date = new Date(dateValue);
                              dateValue = date.toISOString().split('T')[0];
                            } else {
                              dateValue = undefined;
                            }

                            const updates = {
                              properties: {
                                ...localField.schema.properties,
                                startDate: {
                                  ...localField.schema.properties.startDate,
                                  formatMaximum: dateValue,
                                },
                                endDate: {
                                  ...localField.schema.properties.endDate,
                                  formatMaximum: dateValue,
                                },
                              },
                            };

                            // Clear defaults if they become invalid
                            const defaultStartDate =
                              localField.schema?.properties?.startDate?.default;
                            const defaultEndDate = localField.schema?.properties?.endDate?.default;

                            if (
                              defaultStartDate &&
                              dateValue &&
                              new Date(defaultStartDate) > new Date(dateValue)
                            ) {
                              updates.properties.startDate.default = undefined;
                            }
                            if (
                              defaultEndDate &&
                              dateValue &&
                              new Date(defaultEndDate) > new Date(dateValue)
                            ) {
                              updates.properties.endDate.default = undefined;
                            }

                            handleSchemaUpdate(updates);
                          }}
                          inputProps={{
                            min: (() => {
                              const minStartDate =
                                localField.schema?.properties?.startDate?.formatMinimum;
                              return minStartDate ? minStartDate.split('T')[0] : undefined;
                            })(),
                          }}
                          margin="normal"
                          variant="outlined"
                          disabled={localField.uischema?.options?.readonly || false}
                          helperText={t('maxDateRangeHelp')}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          InputProps={{
                            endAdornment: localField.schema?.properties?.endDate?.formatMaximum && (
                              <InputAdornment position="end">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleSchemaUpdate({
                                      properties: {
                                        ...localField.schema.properties,
                                        startDate: {
                                          ...localField.schema.properties.startDate,
                                          formatMaximum: undefined,
                                        },
                                        endDate: {
                                          ...localField.schema.properties.endDate,
                                          formatMaximum: undefined,
                                        },
                                      },
                                    })
                                  }
                                  edge="end"
                                  disabled={localField.uischema?.options?.readonly || false}
                                  sx={{
                                    color: 'text.secondary',
                                    '&:hover': { color: 'error.main' },
                                  }}
                                >
                                  <IconX size={16} />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

              {(localField.type === 'array' || localField.type === 'multiselect') && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label={t('minItems')}
                      type="number"
                      fullWidth
                      value={localField.schema?.minItems || ''}
                      onChange={(e) =>
                        handleSchemaUpdate({
                          minItems: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      margin="normal"
                      variant="outlined"
                      disabled={localField.uischema?.options?.readonly || false}
                      helperText={t('minItemsHelp')}
                      inputProps={{ min: 0 }}
                      sx={outlinedTextFieldSx}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      label={t('maxItems')}
                      type="number"
                      fullWidth
                      value={localField.schema?.maxItems || ''}
                      onChange={(e) =>
                        handleSchemaUpdate({
                          maxItems: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      margin="normal"
                      variant="outlined"
                      disabled={localField.uischema?.options?.readonly || false}
                      helperText={t('maxItemsHelp')}
                      inputProps={{ min: 0 }}
                      sx={outlinedTextFieldSx}
                    />
                  </Grid>
                </Grid>
              )}
            </Box>
            <Box>
              {localField.type === 'file' && (
                <>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <TextField
                        label={t('maxFileSize')}
                        type="number"
                        fullWidth
                        value={maxSizeInput}
                        onChange={(e) => {
                          setMaxSizeInput(e.target.value);
                          const value = e.target.value;
                          handleUiOptionsUpdate({
                            maxSize: value === '' ? undefined : Number(value),
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === '-') {
                            e.preventDefault();
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          handleUiOptionsUpdate({
                            maxSize: value === '' ? undefined : Number(value),
                          });
                        }}
                        margin="normal"
                        variant="outlined"
                        disabled={localField.uischema?.options?.readonly || false}
                        helperText={t('maxFileSizeHelp')}
                        inputProps={{
                          step: 0.1,
                          min: 0,
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Rules */}
      {!isLayout && !isGroup && (
        <Accordion sx={accordionSx}>
          <AccordionSummary expandIcon={<IconChevronDown />} sx={accordionSummarySx}>
            <Typography variant="subtitle1" fontWeight={600}>
              {t('rules')}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'nowrap' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={localField.parentVisibility || false}
                    onChange={(e) => {
                      setDependentState(e.target.checked);

                      // handleUpdate({ uischema: updatedUISchema });
                    }}
                    color="primary"
                  />
                }
                label={t('isDependent')}
                sx={formControlLabelSx}
              />
            </Box>

            {localField.parentVisibility && (
              <>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <FormControl fullWidth margin="normal" size="small">
                    <InputLabel id="effect">{t('chooseEffect')}</InputLabel>
                    <Select
                      labelId="effect"
                      label={t('chooseEffect')}
                      size="small"
                      value={localField.effect || ''}
                      onChange={(e) => {
                        updateEffect(e.target.value);
                      }}
                      sx={layoutSelectSx}
                    >
                      {['SHOW', 'HIDE', 'ENABLE', 'DISABLE'].map((v) => (
                        <MenuItem key={v} value={v}>
                          <Box sx={fieldTypeMenuItemSx}>{t(`effect_${v.toLowerCase()}`)}</Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ marginTop: '10px' }}>
                  {rows.map((row, index) => {
                    const dependsOnField = filteredFields.find((f) => f.key === row.dependsOn);
                    return (
                      <>
                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                          sx={{ textAlign: 'center' }}
                        >
                          {row.logical}
                        </Typography>
                        <Box key={index} sx={fieldSelectionSx}>
                          {/* Field selector */}
                          <FormControl size="small" sx={{ minWidth: 100 }}>
                            <InputLabel id={`depends-on-label-${index}`}>
                              {t('conditionalLogic.field')}
                            </InputLabel>
                            <Select
                              labelId={`depends-on-label-${index}`}
                              size="small"
                              label={t('conditionalLogic.field')}
                              value={row.dependsOn || ''}
                              onChange={
                                (e) => updateCondition(index, 'dependsOn', e.target.value)
                                // updateCurrentSelection(e.target.value)
                              }
                              sx={layoutSelectRuleSx}
                            >
                              {filteredFields
                                .filter((f) => {
                                  return f.id !== field.id && !excludedTypes.includes(f.type);
                                })
                                .map((f) => (
                                  <MenuItem key={f.key} value={f.key}>
                                    <Box sx={fieldTypeMenuItemSx}>{f.label}</Box>
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                          {/* {<pre>{JSON.stringify(dependsOnField)}</pre>} */}
                          {/* Operator selector */}
                          {dependsOnField && (
                            <>
                              {/* operator */}
                              <FormControl size="small" sx={{ minWidth: 110 }}>
                                <InputLabel id={`operator-label-${index}`}>
                                  {t('conditionalLogic.operator')}
                                </InputLabel>
                                <Select
                                  labelId={`operator-label-${index}`}
                                  label={t('conditionalLogic.operator')}
                                  size="small"
                                  value={row.operator || ''}
                                  onChange={(e) =>
                                    updateCondition(index, 'operator', e.target.value)
                                  }
                                  sx={layoutSelectRuleSx}
                                >
                                  {dependsOnField &&
                                    dependsOnField?.schema?.enum &&
                                    OPERATORS[dependsOnField.schema.type]?.map((op) => (
                                      <MenuItem key={op.value} value={op.value}>
                                        {op.label}
                                      </MenuItem>
                                    ))}

                                  {dependsOnField &&
                                    dependsOnField.schema?.type === 'array' &&
                                    OPERATORS['array']?.map((op) => (
                                      <MenuItem key={op.value} value={op.value}>
                                        {op.label}
                                      </MenuItem>
                                    ))}

                                  {dependsOnField &&
                                    (dependsOnField.schema.type === 'number' ||
                                      dependsOnField.schema.type === 'integer') &&
                                    OPERATORS['number']?.map((op) => (
                                      <MenuItem key={op.value} value={op.value}>
                                        {op.label}
                                      </MenuItem>
                                    ))}

                                  {!dependsOnField?.schema?.enum &&
                                    dependsOnField.schema.type === 'string' &&
                                    dependsOnField.type !== 'date' &&
                                    OPERATORS['text']?.map((op) => (
                                      <MenuItem key={op.value} value={op.value}>
                                        {op.label}
                                      </MenuItem>
                                    ))}

                                  {dependsOnField.type === 'date' &&
                                    OPERATORS['date']?.map((op) => (
                                      <MenuItem key={op.value} value={op.value}>
                                        {op.label}
                                      </MenuItem>
                                    ))}
                                  {dependsOnField.schema.type === 'boolean' &&
                                    OPERATORS[dependsOnField.schema.type]?.map((op) => (
                                      <MenuItem key={op.value} value={op.value}>
                                        {op.label}
                                      </MenuItem>
                                    ))}
                                </Select>
                              </FormControl>

                              {/* select or radio  */}
                              {dependsOnField?.schema?.enum && (
                                <FormControl size="small" sx={{ minWidth: 100 }}>
                                  <InputLabel id={`value-label-${index}`}>
                                    {t('conditionalLogic.value')}
                                  </InputLabel>
                                  <Select
                                    labelId={`value-label-${index}`}
                                    size="small"
                                    disabled={!dependsOnField}
                                    value={row.value ?? ''}
                                    label={t('conditionalLogic.value')}
                                    onChange={(e) => {
                                      updateCondition(index, 'value', e.target.value);
                                    }}
                                    sx={layoutSelectRuleSx}
                                  >
                                    {dependsOnField?.schema?.enum?.map((opt) => (
                                      <MenuItem key={opt} value={opt}>
                                        {opt}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}

                              {dependsOnField.schema?.type === 'array' && (
                                <FormControl size="small" sx={{ minWidth: 100 }}>
                                  <InputLabel id={`value-label-${index}`}>
                                    {t('conditionalLogic.value')}
                                  </InputLabel>
                                  <Select
                                    labelId={`value-label-${index}`}
                                    size="small"
                                    disabled={!dependsOnField}
                                    value={row.value ?? ''}
                                    label={t('conditionalLogic.value')}
                                    onChange={(e) => {
                                      updateCondition(index, 'value', e.target.value);
                                    }}
                                    sx={layoutSelectRuleSx}
                                  >
                                    {dependsOnField?.schema?.items?.enum?.map((opt) => (
                                      <MenuItem key={opt} value={opt}>
                                        {opt}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}

                              {/* checkbox */}
                              {dependsOnField?.schema.type === 'boolean' && (
                                <FormControl size="small" sx={{ minWidth: 100 }}>
                                  <InputLabel id={`value-label-${index}`}>
                                    {t('conditionalLogic.value')}
                                  </InputLabel>
                                  <Select
                                    labelId={`value-label-${index}`}
                                    size="small"
                                    disabled={!dependsOnField}
                                    label={t('conditionalLogic.value')}
                                    value={row.value ?? ''}
                                    onChange={(e) => {
                                      updateCondition(index, 'value', e.target.value);
                                    }}
                                    sx={layoutSelectRuleSx}
                                  >
                                    {['true', 'false'].map((v) => (
                                      <MenuItem key={v} value={v}>
                                        {v === 'true' ? 'True' : 'False'}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}

                              {/* number */}
                              {(dependsOnField.schema.type === 'number' ||
                                dependsOnField.schema.type === 'integer') && (
                                <TextField
                                  type="number"
                                  size="small"
                                  value={row.value ?? ''}
                                  onChange={(e) => {
                                    updateCondition(index, 'value', e.target.value);
                                  }}
                                  variant="outlined"
                                  sx={{
                                    ...outlinedTextFieldNumberSx,
                                    '& input[type=number]': {
                                      MozAppearance: 'textfield',
                                    },
                                    '& input[type=number]::-webkit-outer-spin-button': {
                                      WebkitAppearance: 'none',
                                      margin: 0,
                                    },
                                    '& input[type=number]::-webkit-inner-spin-button': {
                                      WebkitAppearance: 'none',
                                      margin: 0,
                                    },
                                  }}
                                />
                              )}

                              {/* string type other than select */}
                              {!dependsOnField?.schema?.enum &&
                                dependsOnField.schema.type === 'string' &&
                                dependsOnField.type !== 'date' && (
                                  <TextField
                                    size="small"
                                    value={row.value ?? ''}
                                    onChange={(e) => {
                                      updateCondition(index, 'value', e.target.value);
                                    }}
                                    variant="outlined"
                                    sx={outlinedTextFieldNumberSx}
                                  />
                                )}

                              {dependsOnField.type === 'date' && (
                                <TextField
                                  size="small"
                                  type="date"
                                  value={row.value ?? ''}
                                  onChange={(e) => {
                                    updateCondition(index, 'value', e.target.value);
                                  }}
                                  variant="outlined"
                                  sx={outlinedTextFieldSx}
                                />
                              )}
                              {/* Delete row */}
                              {rows.length > 1 && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => removeRow(index)}
                                >
                                  <IconTrash size={19} />
                                </IconButton>
                              )}
                            </>
                          )}
                        </Box>
                      </>
                    ); //return
                  })}
                </Box>
                {/* Add More button */}
                <Button variant="contained" onClick={showOperator} sx={{ width: 150 }}>
                  {t('addMore')}
                </Button>
                {showLogical && (
                  <FormControl sx={{ marginLeft: '10px', minWidth: 110 }} size="small">
                    <InputLabel id={`condition-label`}>{t('condition')}</InputLabel>
                    <Select
                      labelId={`condition-label`}
                      label={t('condition')}
                      size="small"
                      value={logical || ''}
                      onChange={(e) => addRow(e.target.value)}
                      sx={layoutSelectSx}
                    >
                      {['AND', 'OR'].map((v) => (
                        <MenuItem key={v} value={v}>
                          {v}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </>
            )}
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};

export default FieldProperties;
