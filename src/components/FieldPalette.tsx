import React from 'react';
import { defaultFieldTypes, FieldType } from '../types';
import { Typography, Box, Divider, Paper } from '@mui/material';

interface FieldPaletteProps {
  onFieldSelect: (fieldType: FieldType) => void;
}

const FieldPalette: React.FC<FieldPaletteProps> = ({ onFieldSelect }) => {
  const layoutTypes = defaultFieldTypes.filter((ft) => ft.isLayout);
  const fieldTypes = defaultFieldTypes.filter((ft) => !ft.isLayout);

  const renderFieldItem = (fieldType: FieldType) => (
    <Paper
      key={fieldType.id}
      elevation={1}
      sx={{
        p: 1.5,
        mb: 1,
        cursor: 'pointer',
        border: '1px solid #e0e0e0',
        '&:hover': {
          backgroundColor: '#f5f5f5',
          borderColor: '#2196f3',
        },
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
      onClick={() => onFieldSelect(fieldType)}
    >
      <Typography variant="body2" sx={{ fontSize: '18px', minWidth: '24px' }}>
        {fieldType.icon}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {fieldType.label}
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ p: 2 }}>
      {/* Layout Elements Section */}
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: '#2196f3', fontWeight: 'bold' }}
      >
        📐 Layouts
      </Typography>
      <Typography
        variant="caption"
        color="textSecondary"
        sx={{ mb: 2, display: 'block' }}
      >
        Organize fields with containers
      </Typography>
      <Box sx={{ mb: 3 }}>{layoutTypes.map(renderFieldItem)}</Box>

      <Divider sx={{ my: 2 }} />

      {/* Form Fields Section */}
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: '#2196f3', fontWeight: 'bold' }}
      >
        📝 Form Fields
      </Typography>
      <Typography
        variant="caption"
        color="textSecondary"
        sx={{ mb: 2, display: 'block' }}
      >
        Input controls for data collection
      </Typography>
      <Box>{fieldTypes.map(renderFieldItem)}</Box>
    </Box>
  );
};

export default FieldPalette;
