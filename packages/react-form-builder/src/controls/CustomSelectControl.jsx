import { useEffect, useState } from 'react';
import { Unwrapped } from '@jsonforms/material-renderers';
import { and, isControl, rankWith } from '@jsonforms/core';
import { useJsonForms, withJsonFormsControlProps } from '@jsonforms/react';
import {
  Box,
  Chip,
  Select,
  Checkbox,
  MenuItem,
  TextField,
  FormLabel,
  InputLabel,
  FormControl,
  Autocomplete,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { updateNestedValue } from '../utils';

// Extract MaterialEnumControl from Unwrapped
const { MaterialEnumControl } = Unwrapped;

// Helper function to get nested property value using dot notation
const getNestedProperty = (obj, path) => {
  if (!path) return obj;
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
};

// Smart property getter: tries dot notation first, then auto-detection
const getProperty = (obj, path) => {
  if (!path) return obj;

  // Try dot notation first
  const dotNotationResult = getNestedProperty(obj, path);
  if (dotNotationResult !== undefined) {
    return dotNotationResult;
  }
  // Fallback: try direct property access (handles non-nested keys)
  const directResult = obj?.[path];
  if (directResult !== undefined) {
    return directResult;
  }
  // Explicitly return null when no value is found to avoid implicit undefined
  return null;
};

const CustomSelectControl = (props) => {
  const { t } = useTranslation();
  const { core } = useJsonForms();

  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllChips, setShowAllChips] = useState(false);

  const { schema, uischema, path, handleChange, data, errors, label, visible, enabled, required } =
    props;
  const {
    entity,
    key,
    value,
    multi,
    displayType,
    maxSelections: rawMaxSelections,
    autocompleteProps: { limitTags: visibleChipsCount } = {},
  } = uischema.options || {};

  // Ensure maxSelections is at least 2 for multi-select fields
  const maxSelections = rawMaxSelections && rawMaxSelections > 1 ? rawMaxSelections : undefined;

  const formData = core?.data || {};

  // Determine if this is a multi-select field
  const isMulti = multi || schema.type === 'array' || displayType === 'checkbox';

  const apiCall = async (entity) => {
    setIsLoading(true);
    try {
      const response = await fetch(entity);
      const json = await response.json();
      setIsLoading(false);

      // If response is already an array, return it
      if (Array.isArray(json)) {
        return json;
      }

      // Recursively find first array in nested object
      const findArray = (obj) => {
        for (const key in obj) {
          if (Array.isArray(obj[key])) {
            return obj[key];
          }
          if (obj[key] && typeof obj[key] === 'object') {
            const result = findArray(obj[key]);
            if (result) return result;
          }
        }
        return null;
      };

      return findArray(json) || [];
    } catch (error) {
      console.error('API call failed:', error);
      setIsLoading(false);
      return [];
    }
  };

  useEffect(() => {
    const fetchOptions = async () => {
      if (entity) {
        const res = await apiCall(entity);
        if (res.length > 0) {
          const newOptions = res.map((item) => ({
            label: value ? String(getProperty(item, value)) : String(item),
            value: key ? getProperty(item, key) : item,
            raw: item,
          }));
          setOptions(newOptions);
        } else {
          // Clear options when API returns empty array or fails
          setOptions([]);
        }
      } else {
        const newOptions =
          schema.enum?.map((enumItem) => ({
            label: enumItem,
            value: enumItem,
            raw: enumItem,
          })) ||
          schema.items?.enum?.map((enumItem) => ({
            label: enumItem,
            value: enumItem,
            raw: enumItem,
          })) ||
          [];
        setOptions(newOptions);
      }
    };
    fetchOptions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, key, value, schema]);

  const handleOnChange = (event, selectedVal) => {
    handleChange(path, selectedVal);
    updateNestedValue(formData, path, selectedVal);
  };

  const hasError = errors && errors.length > 0;
  const validationError = hasError ? errors : null;

  const isReadOnly = uischema.options?.readonly || isLoading || false;

  const fieldLabel = label || schema.title || 'Select';
  if (!visible) return null;

  return isMulti ? (
    displayType === 'autocomplete' || uischema.options?.autocomplete ? (
      <FormControl fullWidth error={hasError}>
        <Autocomplete
          multiple
          disableCloseOnSelect
          disabled={isReadOnly || !enabled}
          required={required}
          options={options}
          getOptionLabel={(opt) => opt.label}
          value={options.filter((o) => Array.isArray(data) && data.includes(o.value))}
          onChange={(_e, newValues) => {
            if (maxSelections && newValues.length > maxSelections) {
              return;
            }
            const selectedVals = newValues.map((v) => v.value);
            handleOnChange(_e, selectedVals);
          }}
          getOptionDisabled={(option) => {
            const currentCount = Array.isArray(data) ? data.length : 0;
            const isSelected = Array.isArray(data) && data.includes(option.value);
            return maxSelections && currentCount >= maxSelections && !isSelected;
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={fieldLabel}
              required={required}
              error={hasError}
              helperText={validationError}
            />
          )}
          {...(uischema.options?.autocompleteProps || {})}
        />
        {maxSelections && (
          <FormHelperText>
            {t('maxSelectionsHint', {
              current: Array.isArray(data) ? data.length : 0,
              max: maxSelections,
              defaultValue: `Selected {{current}} of {{max}} maximum`,
            })}
          </FormHelperText>
        )}
        {schema?.description && <FormHelperText>{schema?.description}</FormHelperText>}
      </FormControl>
    ) : displayType === 'checkbox' ? (
      <FormControl fullWidth error={hasError}>
        <FormLabel>
          {fieldLabel} {required && <span> *</span>}
        </FormLabel>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, flexWrap: 'wrap' }}>
          {options.map((opt) => {
            const isChecked = Array.isArray(data) && data.includes(opt.value);
            const currentValues = Array.isArray(data) ? data : [];
            const isMaxReached = maxSelections && currentValues.length >= maxSelections;
            const shouldDisable = isReadOnly || (isMaxReached && !isChecked);

            return (
              <FormControlLabel
                key={opt.value}
                control={
                  <Checkbox
                    checked={isChecked}
                    disabled={isReadOnly || !enabled || shouldDisable}
                    onChange={(e) => {
                      if (isReadOnly) {
                        return;
                      }
                      const currentValues = Array.isArray(data) ? data : [];
                      if (e.target.checked) {
                        // Check if maxSelections limit would be exceeded
                        if (maxSelections && currentValues.length >= maxSelections) {
                          return; // Don't allow more selections
                        }
                        const newValues = [...currentValues, opt.value];
                        handleOnChange(e, newValues);
                      } else {
                        const newValues = currentValues.filter((v) => v !== opt.value);
                        handleOnChange(e, newValues);
                      }
                    }}
                  />
                }
                label={opt.label}
                sx={{ textTransform: 'capitalize' }}
              />
            );
          })}
        </Box>
        {maxSelections && (
          <FormHelperText>
            {t('maxSelectionsHint', {
              current: Array.isArray(data) ? data.length : 0,
              max: maxSelections,
              defaultValue: `Selected {{current}} of {{max}} maximum`,
            })}
          </FormHelperText>
        )}
        {schema?.description && <FormHelperText>{schema?.description}</FormHelperText>}
        {hasError && <FormHelperText>{validationError}</FormHelperText>}
      </FormControl>
    ) : (
      <FormControl fullWidth error={hasError}>
        <InputLabel>{fieldLabel}</InputLabel>
        <Select
          label={fieldLabel}
          multiple
          disabled={isReadOnly || !enabled}
          value={Array.isArray(data) ? data : []}
          onChange={(e) => {
            if (isReadOnly) {
              return;
            }
            // Check maxSelections limit
            if (maxSelections && e.target.value.length > maxSelections) {
              return; // Don't allow more than max selections
            }
            handleOnChange(e, e.target.value);
          }}
          renderValue={(selected) => {
            const visibleCount = showAllChips ? selected.length : visibleChipsCount;
            const hasMore = selected.length > visibleChipsCount;
            return (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                {selected.slice(0, visibleCount).map((val) => {
                  const opt = options.find((o) => o.value === val);
                  return (
                    <Chip
                      key={val}
                      label={opt ? opt.label : val}
                      onDelete={
                        isReadOnly
                          ? undefined
                          : () => {
                              const newSelected = selected.filter((v) => v !== val);
                              handleChange(path, newSelected);
                              updateNestedValue(formData, path, newSelected);
                            }
                      }
                      onMouseDown={(e) => e.stopPropagation()}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  );
                })}
                {hasMore && !showAllChips && (
                  <Chip
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllChips(true);
                    }}
                    sx={{ cursor: 'pointer', bgcolor: 'action.hover' }}
                    label={t('showMore', `+${selected.length - visibleChipsCount} more`)}
                  />
                )}
                {showAllChips && hasMore && (
                  <Chip
                    size="small"
                    label={t('showLess', 'Show less')}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllChips(false);
                    }}
                    sx={{ cursor: 'pointer', bgcolor: 'action.hover' }}
                  />
                )}
              </Box>
            );
          }}
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} sx={{ textTransform: 'capitalize' }}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
        {maxSelections && (
          <FormHelperText>
            {t('maxSelectionsHint', {
              current: Array.isArray(data) ? data.length : 0,
              max: maxSelections,
              defaultValue: `Selected {{current}} of {{max}} maximum`,
            })}
          </FormHelperText>
        )}
        {schema?.description && <FormHelperText>{schema?.description}</FormHelperText>}
        {hasError && <FormHelperText>{validationError}</FormHelperText>}
      </FormControl>
    )
  ) : (
    <MaterialEnumControl
      {...props}
      path={path}
      schema={{ ...schema, title: fieldLabel }}
      options={options}
      uischema={uischema}
      disabled={isReadOnly}
      handleChange={handleOnChange}
    />
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const customSelectTester = rankWith(
  Number.MAX_VALUE,
  and(isControl, (uischema, schema) => {
    const format = uischema?.options?.format;
    const isMulti = uischema?.options?.multi;

    if (format === 'select' || format === 'checkbox' || format === 'dynamicselect') {
      return true;
    }

    if (isMulti && schema?.type === 'array' && schema?.items?.enum) {
      return true;
    }

    return false;
  })
);

const CustomSelectControlWrapper = withJsonFormsControlProps(CustomSelectControl);

export default CustomSelectControlWrapper;
