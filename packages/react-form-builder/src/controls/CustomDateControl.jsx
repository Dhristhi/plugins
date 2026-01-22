import { TextField } from '@mui/material';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { rankWith, isControl, and, schemaMatches } from '@jsonforms/core';

import { formatDate } from '../utils';

const CustomDateControl = (props) => {
  console.log('props', props);
  const { data, handleChange, path, label, required, errors, uischema, schema, visible } = props;

  const minDate = schema?.minimum;
  const maxDate = schema?.maximum;
  const isReadOnly = uischema?.options?.readonly;
  const includeTime = uischema?.options?.includeTime || false;
  const dateFormat = uischema?.options?.dateTimeFormat || 'friendly';
  const getDisplayValue = () => {
    if (!data) return '';

    if (isReadOnly) {
      return formatDate(data, dateFormat);
    }

    if (includeTime) {
      const date = new Date(data);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      }
    }

    return data ? data.split('T')[0] : '';
  };

  const getFormattedDisplayText = () => {
    if (!data || isReadOnly) return null;
    return formatDate(data, dateFormat);
  };

  const getInputType = () => {
    if (isReadOnly) {
      return 'text';
    }
    if (includeTime) {
      return 'datetime-local';
    }
    return 'date';
    //return includeTime ? 'datetime-local' : 'date';
  };

  const getMinValue = () => {
    if (!minDate) return undefined;

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
  };

  const getMaxValue = () => {
    if (!maxDate) return undefined;

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
  };

  const formattedDisplay = getFormattedDisplayText();
  if (!visible) return null;

  return (
    <div>
      <TextField
        label={label}
        type={getInputType()}
        fullWidth
        required={required}
        value={getDisplayValue()}
        min={getMinValue()}
        max={getMaxValue()}
        placeholder={undefined}
        InputProps={{
          placeholder: undefined,
        }}
        inputProps={{
          min: getMinValue(),
          max: getMaxValue(),
        }}
        onChange={(e) => {
          if (!isReadOnly) {
            let value = e.target.value;

            if (includeTime && value) {
              const date = new Date(value);
              value = date.toISOString();
            }

            handleChange(path, value);
          }
        }}
        error={errors && (Array.isArray(errors) ? errors.length > 0 : !!errors)}
        helperText={(() => {
          if (!errors) return undefined;
          if (Array.isArray(errors) && errors.length > 0) {
            return errors[0].message || errors[0];
          }
          if (typeof errors === 'string') {
            return errors;
          }
          return undefined;
        })()}
        variant="outlined"
        InputLabelProps={{
          shrink: true,
        }}
        disabled={isReadOnly}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
          '& .MuiInputLabel-root': {
            // Adjust label positioning to match other fields
            transform: 'translate(14px, -9px) scale(0.75)',
            '&.Mui-focused': {
              transform: 'translate(14px, -9px) scale(0.75)',
            },
          },
        }}
      />
      {formattedDisplay && (
        <div
          style={{
            fontSize: '0.875rem',
            color: '#666',
            marginTop: '4px',
            marginLeft: '14px',
          }}
        >
          Preview: {formattedDisplay}
        </div>
      )}
    </div>
  );
};

export const customDateTester = rankWith(
  1000,
  and(
    isControl,
    schemaMatches(
      (schema) =>
        schema.format === 'date' ||
        schema.format === 'date-time' ||
        schema.format === 'datetime' ||
        (schema.type === 'string' &&
          (schema.format === 'date' ||
            schema.format === 'date-time' ||
            schema.format === 'datetime'))
    )
  )
);

export default withJsonFormsControlProps(CustomDateControl);
