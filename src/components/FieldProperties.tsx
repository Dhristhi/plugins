import React, { useState, useEffect } from 'react';
import { FormField } from '../types';
import {
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface FieldPropertiesProps {
  field: FormField | null;
  onFieldUpdate: (field: FormField) => void;
}

const FieldProperties: React.FC<FieldPropertiesProps> = ({
  field,
  onFieldUpdate,
}) => {
  const [localField, setLocalField] = useState<FormField | null>(null);
  const [enumOptions, setEnumOptions] = useState<string[]>([]);
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
      <Box p={2}>
        <Typography variant="h6" color="textSecondary">
          Select a field to edit its properties
        </Typography>
      </Box>
    );
  }

  const handleUpdate = (updates: Partial<FormField>) => {
    const updatedField = { ...localField, ...updates };
    setLocalField(updatedField);
    onFieldUpdate(updatedField);
  };

  const handleSchemaUpdate = (schemaUpdates: any) => {
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

  const handleRemoveOption = (index: number) => {
    const newOptions = enumOptions.filter((_, i) => i !== index);
    setEnumOptions(newOptions);
    handleSchemaUpdate({
      enum: newOptions.length > 0 ? newOptions : undefined,
    });
  };

  const hasEnumOptions = ['select', 'radio'].includes(localField.type);

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Field Properties
      </Typography>

      <Box mb={3}>
        <TextField
          label="Label"
          fullWidth
          value={localField.label}
          onChange={(e) => handleUpdate({ label: e.target.value })}
          margin="normal"
        />

        <TextField
          label="Field Key"
          fullWidth
          value={localField.key}
          onChange={(e) => handleUpdate({ key: e.target.value })}
          margin="normal"
          helperText="Unique identifier for this field"
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
      </Box>

      {hasEnumOptions && (
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Options
          </Typography>

          <Box display="flex" gap={1} mb={2}>
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
            />
            <IconButton onClick={handleAddOption} color="primary">
              <AddIcon />
            </IconButton>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={1}>
            {enumOptions.map((option, index) => (
              <Chip
                key={index}
                label={option}
                onDelete={() => handleRemoveOption(index)}
                deleteIcon={<DeleteIcon />}
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Field Type: {localField.type}
        </Typography>

        {localField.type === 'string' && localField.schema.format && (
          <Typography variant="caption" color="textSecondary">
            Format: {localField.schema.format}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default FieldProperties;
