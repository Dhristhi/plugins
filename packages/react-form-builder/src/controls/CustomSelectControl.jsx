import { useEffect, useState } from 'react';
import { Unwrapped } from '@jsonforms/material-renderers';
import { and, isControl, optionIs, rankWith, or } from '@jsonforms/core';
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

const CustomSelectControl = (props) => {
  const { t } = useTranslation();
  const { core } = useJsonForms();

  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllChips, setShowAllChips] = useState(false);

  const { schema, uischema, path, handleChange, data, errors, label, visible } = props;
  const {
    entity,
    key,
    value,
    multi,
    displayType,
    autocompleteProps: { limitTags: visibleChipsCount } = {},
  } = uischema.options || {};

  const formData = core?.data || {};

  // Determine if this is a multi-select field
  const isMulti = multi || schema.type === 'array' || displayType === 'checkbox';

  const apiCall = async (entity) => {
    setIsLoading(true);
    try {
      const response = await fetch(entity);
      const json = await response.json();
      setIsLoading(false);
      // Handle nested data structure (e.g., {data: [...]} or direct array)
      return Array.isArray(json) ? json : json.data || [];
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
          const newOptions = res.map((r) => ({
            label: value ? String(r[value]) : String(r),
            value: key ? r[key] : r,
            raw: r,
          }));
          setOptions(newOptions);
        }
      } else {
        const newOptions =
          schema.enum?.map((r) => ({
            label: r,
            value: r,
            raw: r,
          })) ||
          schema.items?.enum?.map((r) => ({
            label: r,
            value: r,
            raw: r,
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
          disabled={isReadOnly}
          options={options}
          getOptionLabel={(opt) => opt.label}
          value={options.filter((o) => Array.isArray(data) && data.includes(o.value))}
          onChange={(_e, newValues) => {
            const selectedVals = newValues.map((v) => v.value);
            handleOnChange(_e, selectedVals);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={fieldLabel}
              error={hasError}
              helperText={validationError}
            />
          )}
          {...(uischema.options?.autocompleteProps || {})}
        />
        {schema?.description && <FormHelperText>{schema?.description}</FormHelperText>}
      </FormControl>
    ) : displayType === 'checkbox' ? (
      <FormControl fullWidth error={hasError}>
        <FormLabel>{fieldLabel}</FormLabel>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, flexWrap: 'wrap' }}>
          {options.map((opt) => {
            const isChecked = Array.isArray(data) && data.includes(opt.value);
            return (
              <FormControlLabel
                key={opt.value}
                control={
                  <Checkbox
                    checked={isChecked}
                    disabled={isReadOnly}
                    onChange={(e) => {
                      if (isReadOnly) {
                        return;
                      }
                      const currentValues = Array.isArray(data) ? data : [];
                      const newValues = e.target.checked
                        ? [...currentValues, opt.value]
                        : currentValues.filter((v) => v !== opt.value);
                      handleOnChange(e, newValues);
                    }}
                  />
                }
                label={opt.label}
                sx={{ textTransform: 'capitalize' }}
              />
            );
          })}
        </Box>
        {schema?.description && <FormHelperText>{schema?.description}</FormHelperText>}
        {hasError && <FormHelperText>{validationError}</FormHelperText>}
      </FormControl>
    ) : (
      <FormControl fullWidth error={hasError}>
        <InputLabel>{fieldLabel}</InputLabel>
        <Select
          label={fieldLabel}
          multiple
          disabled={isReadOnly}
          value={Array.isArray(data) ? data : []}
          onChange={(e) => {
            if (isReadOnly) {
              return;
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
  and(
    isControl,
    or(
      optionIs('format', 'select'),
      optionIs('format', 'dynamicselect'),
      optionIs('displayType', 'checkbox')
    )
  )
);

const CustomSelectControlWrapper = withJsonFormsControlProps(CustomSelectControl);

export default CustomSelectControlWrapper;
