import { useEffect, useState, useMemo } from 'react';
import { Unwrapped } from '@jsonforms/material-renderers';
import { and, isControl, optionIs, rankWith } from '@jsonforms/core';
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

import { updateNestedValue } from '../utils';

// Extract MaterialEnumControl from Unwrapped
const { MaterialEnumControl } = Unwrapped;

const CustomSelectControl = (props) => {
  const { core } = useJsonForms();

  const [options, setOptions] = useState([]);
  const [showAllChips, setShowAllChips] = useState(false);

  const { schema, uischema, path, handleChange, data, errors, visible } = props;
  const {
    key,
    value,
    multi,
    displayType,
    autocompleteProps: { limitTags: visibleChipsCount } = {},
  } = uischema.options || {};

  const formData = core?.data || {};
  useEffect(() => {
    const fetchOptions = async () => {
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
    };
    fetchOptions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, value, schema]);

  const handleOnChange = (event, selectedVal) => {
    handleChange(path, selectedVal);
    updateNestedValue(formData, path, selectedVal);
  };

  const hasError = errors && errors.length > 0;
  const validationError = hasError ? errors : null;

  const isReadOnly = uischema.options?.readonly || false;

  const fieldLabel = useMemo(() => {
    return schema.title || 'Select';
  }, [path, schema.title]);
  if (!visible) return null;

  return multi ? (
    displayType === 'autocomplete' || uischema.options?.autocomplete ? (
      <FormControl fullWidth error={hasError}>
        <Autocomplete
          multiple
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
                    label={`+${selected.length - visibleChipsCount} more`}
                  />
                )}
                {showAllChips && hasMore && (
                  <Chip
                    size="small"
                    label="Show less"
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
  and(isControl, optionIs('format', 'select'))
);

const CustomSelectControlWrapper = withJsonFormsControlProps(CustomSelectControl);

export default CustomSelectControlWrapper;
