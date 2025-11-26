import React from 'react';
import { defaultFieldTypes, FieldType } from '../types';
import { Typography, Box } from '@mui/material';

interface FieldPaletteProps {
  onFieldSelect: (fieldType: FieldType) => void;
}

const FieldPalette: React.FC<FieldPaletteProps> = ({ onFieldSelect }) => {
  return (
    <div className="field-palette">
      <Typography variant="h6" gutterBottom>
        Field Components
      </Typography>
      <Box>
        {defaultFieldTypes.map((fieldType) => (
          <div
            key={fieldType.id}
            className="palette-item"
            onClick={() => onFieldSelect(fieldType)}
          >
            <span>{fieldType.icon}</span>
            <Typography variant="body2">{fieldType.label}</Typography>
          </div>
        ))}
      </Box>
    </div>
  );
};

export default FieldPalette;
