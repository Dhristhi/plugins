import React, { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import { IconPlus, IconTrash, IconSettings } from '@tabler/icons-react';

const FieldProperties = ({ field, onFieldUpdate }) => {
  const [localField, setLocalField] = useState(null);
  const [enumOptions, setEnumOptions] = useState([]);
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    if (field) {
      setLocalField({ ...field });
      if (field.schema.enum) {
        setEnumOptions([...field.schema.enum]);
      } else {
        setEnumOptions([]);
      }
    }
  }, [field]);

  if (!localField) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <IconSettings
          size={48}
          style={{ marginBottom: '16px' }}
          color="currentColor"
        />
        <Typography
          variant="h6"
          color="textSecondary"
          sx={{ fontWeight: 500, color: 'grey.400' }}
        >
          Select a field to edit
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Click on any field in the form structure to configure its properties
        </Typography>
      </Box>
    );
  }

  const handleUpdate = (updates) => {
    const updatedField = { ...localField, ...updates };
    setLocalField(updatedField);
    onFieldUpdate(updatedField);
  };

  const handleSchemaUpdate = (schemaUpdates) => {
    const updatedSchema = { ...localField.schema, ...schemaUpdates };
    handleUpdate({ schema: updatedSchema });
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      const newOptions = [...enumOptions, newOption.trim()];
      setEnumOptions(newOptions);
      handleSchemaUpdate({ enum: newOptions });
      setNewOption('');
    }
  };

  const handleRemoveOption = (index) => {
    const newOptions = enumOptions.filter((_, i) => i !== index);
    setEnumOptions(newOptions);
    handleSchemaUpdate({
      enum: newOptions.length > 0 ? newOptions : undefined,
    });
  };

  const hasEnumOptions = ['select', 'radio'].includes(localField.type);
  const isGroup = localField.type === 'group';
  const isLayout = localField.isLayout && !isGroup;

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: 'grey.800',
          mb: 3,
        }}
      >
        {isGroup
          ? 'Group Properties'
          : isLayout
          ? 'Layout Properties'
          : 'Field Properties'}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          label={isGroup ? 'Group Title' : 'Label'}
          fullWidth
          value={localField.label}
          onChange={(e) => {
            const newLabel = e.target.value;
            if (isGroup) {
              // Update both field label and UI schema label for groups
              const updatedUISchema = {
                ...localField.uischema,
                label: newLabel,
              };
              handleUpdate({
                label: newLabel,
                uischema: updatedUISchema,
              });
            } else {
              handleUpdate({ label: newLabel });
            }
          }}
          margin="normal"
          variant="outlined"
          helperText={isGroup ? 'Displayed as the group header' : ''}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        {!isLayout && !isGroup && (
          <>
            <TextField
              label="Field Key"
              fullWidth
              value={localField.key}
              onChange={(e) => handleUpdate({ key: e.target.value })}
              margin="normal"
              variant="outlined"
              helperText="Unique identifier for this field"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={localField.required || false}
                  onChange={(e) => handleUpdate({ required: e.target.checked })}
                />
              }
              label="Required"
            />
          </>
        )}

        {isGroup && (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={localField.uischema?.options?.collapsed || false}
                  onChange={(e) => {
                    const updatedUISchema = {
                      ...localField.uischema,
                      options: {
                        ...localField.uischema?.options,
                        collapsed: e.target.checked,
                      },
                    };
                    handleUpdate({ uischema: updatedUISchema });
                  }}
                />
              }
              label="Collapsible"
            />

            {localField.uischema?.options?.collapsed && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      localField.uischema?.options?.showUnfocusedDescription ||
                      false
                    }
                    onChange={(e) => {
                      const updatedUISchema = {
                        ...localField.uischema,
                        options: {
                          ...localField.uischema?.options,
                          showUnfocusedDescription: e.target.checked,
                        },
                      };
                      handleUpdate({ uischema: updatedUISchema });
                    }}
                  />
                }
                label="Start Collapsed"
              />
            )}
          </>
        )}
      </Box>

      {hasEnumOptions && (
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Options
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              label="New Option"
              size="small"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddOption();
                }
              }}
              variant="outlined"
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                },
              }}
            />
            <IconButton
              onClick={handleAddOption}
              sx={{
                color: 'success.main',
                backgroundColor: 'success.light',
                borderRadius: 1.5,
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.success.light,
                  color: 'success.dark',
                },
              }}
            >
              <IconPlus size={20} />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {enumOptions.map((option, index) => (
              <Chip
                key={index}
                label={option}
                onDelete={() => handleRemoveOption(index)}
                deleteIcon={<IconTrash size={16} />}
                variant="outlined"
                sx={{
                  borderRadius: 1.5,
                  '& .MuiChip-deleteIcon': {
                    color: 'error.main',
                    '&:hover': {
                      color: 'error.dark',
                    },
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {isGroup
            ? 'Group Container'
            : isLayout
            ? 'Layout Container'
            : `Field Type: ${localField.type}`}
        </Typography>

        {!isGroup &&
          !isLayout &&
          localField.type === 'string' &&
          localField.schema.format && (
            <Typography
              variant="caption"
              sx={{
                color: 'grey.600',
                backgroundColor: 'grey.100',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                display: 'inline-block',
              }}
            >
              Format: {localField.schema.format}
            </Typography>
          )}

        {isGroup && (
          <Typography
            variant="body2"
            sx={{
              color: 'grey.500',
              fontStyle: 'italic',
            }}
          >
            Groups provide visual separation and can contain any fields or
            layouts
          </Typography>
        )}

        {isLayout && (
          <Typography
            variant="body2"
            sx={{
              color: 'grey.500',
              fontStyle: 'italic',
            }}
          >
            {localField.type === 'vertical-layout'
              ? 'Stacks elements vertically'
              : 'Arranges elements horizontally'}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default FieldProperties;
