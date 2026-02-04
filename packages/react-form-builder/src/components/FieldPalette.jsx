import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  Box,
  Divider,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Popover,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
} from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import { IconLayersLinked, IconForms, IconClipboard, IconSettings } from '@tabler/icons-react';

import '../lib/registry/init';
import { getFieldTypes } from '../lib/registry/fieldRegistry';

const DraggableFieldItem = ({ fieldType }) => {
  const { t } = useTranslation();
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
          {fieldType.labelKey ? t(fieldType.labelKey) : fieldType.label}
        </Typography>

        <Typography variant="caption" color="textSecondary" sx={captionSx}>
          {fieldType.isLayout ? t('layoutContainer') : t('formInput')}
        </Typography>
      </Box>
    </Paper>
  );
};

const FieldPalette = ({ onLoadSchema, schemas = [], loadedSchemaId = '' }) => {
  const { t } = useTranslation();
  const [selectedSchema, setSelectedSchema] = useState(loadedSchemaId);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [visibleFields, setVisibleFields] = useState({});

  React.useEffect(() => {
    setSelectedSchema(loadedSchemaId);
  }, [loadedSchemaId]);

  // Initialize visible fields state with all fields visible by default
  React.useEffect(() => {
    const allTypes = getFieldTypes();
    const initialVisibility = {};
    allTypes.forEach((fieldType) => {
      initialVisibility[fieldType.id] = true;
    });
    setVisibleFields(initialVisibility);
  }, []);

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

  const handleSettingsClick = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleFieldVisibilityChange = (fieldId) => {
    setVisibleFields((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  const handleLayoutsToggle = () => {
    const allTypes = getFieldTypes();
    const layoutFieldIds = allTypes
      .filter((ft) => ft.isLayout && ft.id !== 'object')
      .map((ft) => ft.id);
    const allLayoutsCurrentlyVisible = layoutFieldIds.every((id) => visibleFields[id]);

    // If all are visible, hide all. If some or none are visible, show all.
    const newVisibility = !allLayoutsCurrentlyVisible;

    setVisibleFields((prev) => {
      const updated = { ...prev };
      layoutFieldIds.forEach((id) => {
        updated[id] = newVisibility;
      });
      return updated;
    });
  };

  const handleFormFieldsToggle = () => {
    const allTypes = getFieldTypes();
    const formFieldIds = allTypes.filter((ft) => !ft.isLayout).map((ft) => ft.id);
    const allFormFieldsCurrentlyVisible = formFieldIds.every((id) => visibleFields[id]);

    // If all are visible, hide all. If some or none are visible, show all.
    const newVisibility = !allFormFieldsCurrentlyVisible;

    setVisibleFields((prev) => {
      const updated = { ...prev };
      formFieldIds.forEach((id) => {
        updated[id] = newVisibility;
      });
      return updated;
    });
  };

  const isSettingsOpen = Boolean(settingsAnchorEl);

  const allTypes = getFieldTypes();

  // Calculate group states based on individual field visibility
  const layoutFieldIds = allTypes
    .filter((ft) => ft.isLayout && ft.id !== 'object')
    .map((ft) => ft.id);
  const formFieldIds = allTypes.filter((ft) => !ft.isLayout).map((ft) => ft.id);

  const allLayoutsVisible =
    layoutFieldIds.length > 0 && layoutFieldIds.every((id) => visibleFields[id]);
  const allFormFieldsVisible =
    formFieldIds.length > 0 && formFieldIds.every((id) => visibleFields[id]);

  const someLayoutsVisible = layoutFieldIds.some((id) => visibleFields[id]);
  const someFormFieldsVisible = formFieldIds.some((id) => visibleFields[id]);

  const layoutTypes = allTypes.filter(
    (ft) => ft.isLayout && ft.id !== 'object' && visibleFields[ft.id]
  );
  const fieldTypes = allTypes.filter((ft) => !ft.isLayout && visibleFields[ft.id]);

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
    mb: 2,
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
          {t('formTemplates')}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', ml: '84px' }}>
          <IconButton
            onClick={handleSettingsClick}
            size="small"
            sx={{
              border: 1,
              borderColor: 'grey.300',
              '&:hover': {
                backgroundColor: 'grey.100',
                borderColor: 'primary.main',
              },
            }}
          >
            <IconSettings size={18} />
          </IconButton>
        </Box>

        {/* Settings Popover */}
        <Popover
          open={isSettingsOpen}
          anchorEl={settingsAnchorEl}
          onClose={handleSettingsClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <Box sx={{ p: 2, minWidth: 250, maxHeight: 400, overflow: 'auto' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              {t('fieldVisibility', 'Field Visibility')}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {/* Layout Controls */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={allLayoutsVisible}
                  indeterminate={someLayoutsVisible && !allLayoutsVisible}
                  onChange={handleLayoutsToggle}
                  size="small"
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'primary.main' }}>
                  <IconLayersLinked size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  {t('layouts')}
                </Typography>
              }
              sx={{ m: 0 }}
            />

            <List dense sx={{ pl: 2 }}>
              {allTypes
                .filter((ft) => ft.isLayout && ft.id !== 'object')
                .map((fieldType) => (
                  <ListItem key={fieldType.id} sx={{ py: 0.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={visibleFields[fieldType.id] || false}
                          onChange={() => handleFieldVisibilityChange(fieldType.id)}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          {fieldType.labelKey ? t(fieldType.labelKey) : fieldType.label}
                        </Typography>
                      }
                      sx={{ m: 0 }}
                    />
                  </ListItem>
                ))}
            </List>

            <Divider sx={{ my: 1 }} />

            {/* Field Controls */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={allFormFieldsVisible}
                  indeterminate={someFormFieldsVisible && !allFormFieldsVisible}
                  onChange={handleFormFieldsToggle}
                  size="small"
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'primary.main' }}>
                  <IconForms size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  {t('formFields')}
                </Typography>
              }
              sx={{ m: 0 }}
            />

            <List dense sx={{ pl: 2 }}>
              {allTypes
                .filter((ft) => !ft.isLayout)
                .map((fieldType) => (
                  <ListItem key={fieldType.id} sx={{ py: 0.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={visibleFields[fieldType.id] || false}
                          onChange={() => handleFieldVisibilityChange(fieldType.id)}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          {fieldType.labelKey ? t(fieldType.labelKey) : fieldType.label}
                        </Typography>
                      }
                      sx={{ m: 0 }}
                    />
                  </ListItem>
                ))}
            </List>
          </Box>
        </Popover>
      </Box>

      <FormControl fullWidth size="small" sx={{ mb: 1 }}>
        <InputLabel>{t('chooseTemplate')}</InputLabel>
        <Select
          value={selectedSchema}
          label={t('chooseTemplate')}
          onChange={handleSchemaChange}
          sx={selectSx}
        >
          <MenuItem value="">
            <em>{t('selectTemplate')}</em>
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
      {(someLayoutsVisible || allLayoutsVisible) && (
        <Box>
          <Box sx={sectionHeaderRowSx}>
            <Box sx={{ color: 'primary.main' }}>
              <IconLayersLinked size={20} />
            </Box>
            <Typography variant="subtitle1" sx={sectionTitleSx}>
              {t('layouts')}
            </Typography>
          </Box>

          <Typography variant="body2" sx={helperTextSx}>
            {t('organizeFields')}
          </Typography>

          <Box sx={{ mb: 3 }}>
            {layoutTypes.map((fieldType) => (
              <DraggableFieldItem key={fieldType.id} fieldType={fieldType} />
            ))}
          </Box>
          <Divider sx={{ my: 2 }} />
        </Box>
      )}

      {/* Form Fields Section */}
      {(someFormFieldsVisible || allFormFieldsVisible) && (
        <Box>
          <Box sx={sectionHeaderRowSx}>
            <Box sx={{ color: 'primary.main' }}>
              <IconForms size={20} />
            </Box>
            <Typography variant="subtitle1" sx={sectionTitleSx}>
              {t('formFields')}
            </Typography>
          </Box>

          <Typography variant="body2" sx={helperTextSx}>
            {t('inputControls')}
          </Typography>

          <Box>
            {fieldTypes.map((fieldType) => (
              <DraggableFieldItem key={fieldType.id} fieldType={fieldType} />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FieldPalette;
