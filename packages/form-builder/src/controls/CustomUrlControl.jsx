import { withJsonFormsControlProps } from '@jsonforms/react';
import { rankWith, isControl, and, schemaMatches } from '@jsonforms/core';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { IconLink, IconExternalLink } from '@tabler/icons-react';

const CustomUrlControl = (props) => {
  const { data, handleChange, path, label, required, errors, config } = props;

  const isValidUrl = (urlString) => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleOpenUrl = () => {
    if (data && isValidUrl(data)) {
      window.open(data, '_blank', 'noopener,noreferrer');
    }
  };

  const getDisplayValue = () => {
    return data || '';
  };

  return (
    <TextField
      label={label}
      type="url"
      fullWidth
      required={required}
      value={getDisplayValue()}
      onChange={(e) => {
        if (!config?.readOnly) {
          handleChange(path, e.target.value);
        }
      }}
      error={errors && errors.length > 0}
      helperText={errors && errors.length > 0 ? errors[0].message : undefined}
      margin="normal"
      variant="outlined"
      disabled={config?.readOnly}
      placeholder="https://example.com"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <IconLink size={20} style={{ color: '#666' }} />
          </InputAdornment>
        ),
        endAdornment: data && isValidUrl(data) && (
          <InputAdornment position="end">
            <IconButton
              onClick={handleOpenUrl}
              size="small"
              title="Open URL in new tab"
              disabled={config?.readOnly}
            >
              <IconExternalLink size={16} />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
        },
      }}
    />
  );
};

export const customUrlTester = rankWith(
  1000,
  and(
    isControl,
    schemaMatches(
      (schema) => schema.format === 'uri' || (schema.type === 'string' && schema.format === 'uri')
    )
  )
);

export default withJsonFormsControlProps(CustomUrlControl);
