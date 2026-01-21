import { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { rankWith, formatIs } from '@jsonforms/core';

const CustomPasswordControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  uischema,
  visible,
  required,
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
      label={schema.title || uischema.label}
      onChange={(event) => handleChange(path, event.target.value)}
      error={!isValid}
      helperText={!isValid ? errors : schema.description}
      required={required}
      variant="outlined"
      fullWidth
      margin="normal"
      style={{ display: visible ? 'block' : 'none' }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
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
          </InputAdornment>
        ),
      }}
    />
  );
};

export const customPasswordTester = rankWith(10, formatIs('password'));

export default withJsonFormsControlProps(CustomPasswordControl);
