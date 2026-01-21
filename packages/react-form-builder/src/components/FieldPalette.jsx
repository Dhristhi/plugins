import React, { useState } from 'react';
import {
  Typography,
  Box,
  Divider,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import { IconLayersLinked, IconForms, IconClipboard } from '@tabler/icons-react';

import '../lib/registry/init';
import { getFieldTypes } from '../lib/registry/fieldRegistry';

const DraggableFieldItem = ({ fieldType }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: fieldType.id,
    data: {
      type: 'palette-item',
      fieldType: fieldType,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  const paperSx = (isDragging) => ({
    p: 1.5,
    mb: 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    border: 1,
    borderColor: 'grey.300',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    userSelect: 'none',
    transition: 'all 0.2s ease',

    '&:hover': {
      backgroundColor: 'grey.100',
      borderColor: 'primary.main',
      transform: 'translateY(-1px)',
    },

    ...(isDragging && {
      backgroundColor: 'primary.light',
      borderColor: 'primary.main',
      boxShadow: (theme) => `0 4px 12px ${theme.palette.primary.main}30`,
    }),
  });

  const iconBoxSx = {
    minWidth: '24px',
    display: 'flex',
    alignItems: 'center',
    color: 'primary.main',
  };

  const labelSx = {
    fontWeight: 500,
  };

  const captionSx = {
    fontSize: '11px',
    lineHeight: 1.2,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      elevation={isDragging ? 3 : 1}
      sx={paperSx(isDragging)}
    >
      <Box sx={iconBoxSx}>
        {React.createElement(fieldType.icon, {
          size: 18,
          stroke: 'currentColor',
        })}
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={labelSx}>
          {fieldType.label}
        </Typography>

        <Typography variant="caption" color="textSecondary" sx={captionSx}>
          {fieldType.isLayout ? 'Layout Container' : 'Form Input'}
        </Typography>
      </Box>
    </Paper>
  );
};

const FieldPalette = ({ onLoadSchema, schemas = [], loadedSchemaId = '' }) => {
  const [selectedSchema, setSelectedSchema] = useState(loadedSchemaId);

  React.useEffect(() => {
    setSelectedSchema(loadedSchemaId);
  }, [loadedSchemaId]);

  const handleSchemaChange = (event) => {
    const schemaId = event.target.value;
    if (schemaId && onLoadSchema) {
      const shouldUpdate = onLoadSchema(schemaId);
      // Only update selection if loading was successful (no confirmation needed)
      if (shouldUpdate) {
        setSelectedSchema(schemaId);
      }
    } else {
      setSelectedSchema(schemaId);
    }
  };

  const allTypes = getFieldTypes();
  const layoutTypes = allTypes.filter((ft) => ft.isLayout && ft.id !== 'object');
  const fieldTypes = allTypes.filter((ft) => !ft.isLayout);

  const sidebarContainerSx = {
    p: { xs: 2, sm: 3 },
    background: (theme) =>
      `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
    backdropFilter: 'blur(20px)',
    borderRight: { md: '1px solid' },
    borderColor: { md: 'grey.200' },
    height: '100%',
    overflowY: 'auto',
  };

  const sectionHeaderRowSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 1,
  };

  const sectionTitleSx = {
    color: 'grey.900',
    fontWeight: 700,
    fontSize: '1rem',
    letterSpacing: '-0.025em',
  };

  const selectSx = {
    backgroundColor: 'background.paper',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'grey.300',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'primary.main',
    },
  };

  const helperTextSx = {
    mb: 2.5,
    display: 'block',
    color: 'grey.600',
    fontSize: '0.875rem',
  };

  const itemLabelSx = {
    fontWeight: 500,
  };

  return (
    <Box sx={sidebarContainerSx}>
      {/* Schema Loader Section */}
      <Box sx={sectionHeaderRowSx}>
        <Box sx={{ color: 'primary.main' }}>
          <IconClipboard size={20} />
        </Box>
        <Typography variant="subtitle1" sx={sectionTitleSx}>
          Form Templates
        </Typography>
      </Box>

      <FormControl fullWidth size="small" sx={{ mb: 3 }}>
        <InputLabel>Choose Template</InputLabel>
        <Select
          value={selectedSchema}
          label="Choose Template"
          onChange={handleSchemaChange}
          sx={selectSx}
        >
          <MenuItem value="">
            <em>Select a template...</em>
          </MenuItem>

          {schemas.map((schema) => (
            <MenuItem key={schema.id} value={schema.id}>
              <Box>
                <Typography variant="body2" sx={itemLabelSx}>
                  {schema.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {schema.description}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider sx={{ my: 2 }} />

      {/* Layout Elements Section */}
      <Box sx={sectionHeaderRowSx}>
        <Box sx={{ color: 'primary.main' }}>
          <IconLayersLinked size={20} />
        </Box>
        <Typography variant="subtitle1" sx={sectionTitleSx}>
          Layouts
        </Typography>
      </Box>

      <Typography variant="body2" sx={helperTextSx}>
        Organize fields with containers
      </Typography>

      <Box sx={{ mb: 3 }}>
        {layoutTypes.map((fieldType) => (
          <DraggableFieldItem key={fieldType.id} fieldType={fieldType} />
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Form Fields Section */}
      <Box sx={sectionHeaderRowSx}>
        <Box sx={{ color: 'primary.main' }}>
          <IconForms size={20} />
        </Box>
        <Typography variant="subtitle1" sx={sectionTitleSx}>
          Form Fields
        </Typography>
      </Box>

      <Typography variant="body2" sx={helperTextSx}>
        Input controls for data collection
      </Typography>

      <Box>
        {fieldTypes.map((fieldType) => (
          <DraggableFieldItem key={fieldType.id} fieldType={fieldType} />
        ))}
      </Box>
    </Box>
  );
};

export default FieldPalette;
