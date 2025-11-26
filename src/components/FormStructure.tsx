import React from 'react';
import { FormField } from '../types';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Typography, IconButton, Box } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

interface FormStructureProps {
  fields: FormField[];
  onFieldsChange: (fields: FormField[]) => void;
  onFieldSelect: (field: FormField) => void;
  selectedField?: FormField | null;
  onAddFieldClick: (index?: number) => void;
}

const FormStructure: React.FC<FormStructureProps> = ({
  fields,
  onFieldsChange,
  onFieldSelect,
  selectedField,
  onAddFieldClick,
}) => {
  const handleDeleteField = (fieldId: string) => {
    const newFields = fields.filter((f) => f.id !== fieldId);
    onFieldsChange(newFields);
  };

  const moveField = (fromIndex: number, toIndex: number) => {
    const newFields = Array.from(fields);
    const [reorderedField] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, reorderedField);
    onFieldsChange(newFields);
  };

  return (
    <div className="form-structure">
      <Typography variant="h6" gutterBottom>
        Form Structure
      </Typography>

      {fields.length === 0 ? (
        <div className="drop-zone" onClick={() => onAddFieldClick()}>
          Click to add your first field
        </div>
      ) : (
        <Box sx={{ padding: 1 }}>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className={`form-field ${
                selectedField?.id === field.id ? 'selected' : ''
              }`}
              onClick={() => onFieldSelect(field)}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <Typography variant="subtitle2">{field.label}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {field.type} - {field.key}
                  </Typography>
                </div>
                <div className="field-controls">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (index > 0) moveField(index, index - 1);
                    }}
                    disabled={index === 0}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (index < fields.length - 1)
                        moveField(index, index + 1);
                    }}
                    disabled={index === fields.length - 1}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFieldSelect(field);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteField(field.id);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              </div>
            </div>
          ))}

          {/* Add field button at the end */}
          <div
            className="drop-zone"
            onClick={() => onAddFieldClick(fields.length)}
            style={{ marginTop: '16px' }}
          >
            + Add Field
          </div>
        </Box>
      )}
    </div>
  );
};

export default FormStructure;
