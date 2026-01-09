import { withJsonFormsControlProps } from '@jsonforms/react';
import { rankWith, isControl, and, schemaMatches } from '@jsonforms/core';
import { TextField } from '@mui/material';
import { formatDate } from '../utils';

const CustomDateControl = (props) => {
  const { data, handleChange, path, label, required, errors, uischema, config, schema } = props;

  const dateFormat = uischema?.options?.dateTimeFormat || 'friendly';
  const includeTime = uischema?.options?.includeTime || false;

  const getDisplayValue = () => {
    if (!data) return '';

    if (config?.readOnly) {
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
    if (!data || config?.readOnly) return null;
    return formatDate(data, dateFormat);
  };

  const getInputType = () => {
    if (config?.readOnly) return 'text';
    return includeTime ? 'datetime-local' : 'date';
  };

  const formattedDisplay = getFormattedDisplayText();

  return (
    <div>
      <TextField
        label={label}
        type={getInputType()}
        fullWidth
        required={required}
        value={getDisplayValue()}
        onChange={(e) => {
          if (!config?.readOnly) {
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
        margin="normal"
        variant="outlined"
        InputLabelProps={{
          shrink: true,
        }}
        disabled={config?.readOnly}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
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
        schema.format === 'datetime' ||
        (schema.type === 'string' && (schema.format === 'date' || schema.format === 'datetime'))
    )
  )
);

export default withJsonFormsControlProps(CustomDateControl);
