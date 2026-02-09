import { useState } from 'react';
import { rankWith, formatIs } from '@jsonforms/core';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { TextField, InputAdornment, IconButton } from '@mui/material';

const CustomPasswordControl = ({
  data,
  path,
  label,
  errors,
  schema,
  visible,
  required,
  handleChange,
  enabled,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isValid = errors.length === 0;

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <TextField
      type={showPassword ? 'text' : 'password'}
      value={data || ''}
      label={label}
      onChange={(event) => handleChange(path, event.target.value)}
      error={!isValid}
      helperText={!isValid ? errors : schema.description}
      required={required}
      variant="outlined"
      disabled={!enabled}
      fullWidth
      style={{ display: visible ? 'block' : 'none' }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {enabled && (
              <IconButton
                onClick={handleTogglePasswordVisibility}
                edge="end"
                size="small"
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
              </IconButton>
            )}
          </InputAdornment>
        ),
      }}
    />
  );
};

export const customPasswordTester = rankWith(10, formatIs('password'));

export default withJsonFormsControlProps(CustomPasswordControl);
