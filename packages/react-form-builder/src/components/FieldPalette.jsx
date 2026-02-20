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
  Drawer,
  Button,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Switch,
} from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import {
  IconLayersLinked,
  IconForms,
  IconClipboard,
  IconSettings,
  IconChevronDown,
  IconX,
  IconTrash,
} from '@tabler/icons-react';

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

const FieldPalette = ({
  onLoadSchema,
  schemas = [],
  loadedSchemaId = '',
  visibleFields = {},
  onVisibleFieldsChange,
  screenResolutions,
  onScreenChanged,
  responsiveState,
}) => {
  const { t } = useTranslation();
  const [selectedSchema, setSelectedSchema] = useState(loadedSchemaId);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [tempVisibleFields, setTempVisibleFields] = useState({});
  const [expandedAccordions, setExpandedAccordions] = useState({
    layouts: false,
    formFields: false,
  });

  const accordionSx = {
    mb: 2,
    borderRadius: 0,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'none',
    mx: -2,
    transition: 'all 0.2s ease-in-out',
    '&:before': {
      display: 'none',
    },
    '&.Mui-expanded': {
      margin: '15px -15px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    },
    '&:hover': {
      borderRadius: 0,
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    },
  };

  const accordionSummarySx = {
    '& .MuiAccordionSummary-content': {
      alignItems: 'center',
    },
    '&:hover': {
      borderRadius: 0,
      backgroundColor: 'action.hover',
    },
    borderRadius: 3,
  };

  const propertiesPanelFooter = {
    p: '10px',
    bgcolor: 'background.paper',
    borderTop: 1,
    borderColor: 'divider',
    display: 'flex',
    gap: 2,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
    position: 'sticky',
    bottom: 0,
    zIndex: 10,
    height: 64,
  };

  React.useEffect(() => {
    setSelectedSchema(loadedSchemaId);
  }, [loadedSchemaId]);

  // Initialize visible fields state with all fields visible by default
  React.useEffect(() => {
    if (onVisibleFieldsChange && Object.keys(visibleFields).length === 0) {
      const allTypes = getFieldTypes();
      const initialVisibility = {};
      allTypes.forEach((fieldType) => {
        if (fieldType.type !== 'integer') initialVisibility[fieldType.id] = true;
      });
      onVisibleFieldsChange(initialVisibility);
    }
  }, [onVisibleFieldsChange, visibleFields]);

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

  const handleSettingsClick = () => {
    setTempVisibleFields(visibleFields);
    setIsSettingsDrawerOpen(true);
  };

  const handleSettingsSave = () => {
    if (onVisibleFieldsChange) {
      onVisibleFieldsChange(tempVisibleFields);
    }
    if (hasChanges) {
      onScreenChanged({ rows: rows, layout: resonsiveLayoutState });
    }
    setIsSettingsDrawerOpen(false);
  };

  const handleSettingsCancel = () => {
    setTempVisibleFields(visibleFields);
    setIsSettingsDrawerOpen(false);
  };

  const handleAccordionChange = (panel) => (_, isExpanded) => {
    setExpandedAccordions((prev) => ({
      ...prev,
      [panel]: isExpanded,
    }));
  };

  const handleFieldVisibilityChange = (fieldId) => {
    setTempVisibleFields((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  const handleLayoutsToggle = () => {
    const allTypes = getFieldTypes();
    const layoutFieldIds = allTypes
      .filter((ft) => ft.isLayout && ft.id !== 'object')
      .map((ft) => ft.id);
    const allLayoutsCurrentlyVisible = layoutFieldIds.every((id) => tempVisibleFields[id]);

    // If all are visible, hide all. If some or none are visible, show all.
    const newVisibility = !allLayoutsCurrentlyVisible;

    setTempVisibleFields((prev) => {
      const updated = { ...prev };
      layoutFieldIds.forEach((id) => {
        updated[id] = newVisibility;
      });
      return updated;
    });
  };

  const handleFormFieldsToggle = () => {
    const allTypes = getFieldTypes();
    const formFieldIds = allTypes
      .filter(
        (ft) =>
          !ft.isLayout &&
          ft.type !== 'integer' &&
          ft.id !== 'multiselect' &&
          ft.id !== 'multicheckbox'
      )
      .map((ft) => ft.id);
    const allFormFieldsCurrentlyVisible = formFieldIds.every((id) => tempVisibleFields[id]);

    // If all are visible, hide all. If some or none are visible, show all.
    const newVisibility = !allFormFieldsCurrentlyVisible;

    setTempVisibleFields((prev) => {
      const updated = { ...prev };
      formFieldIds.forEach((id) => {
        updated[id] = newVisibility;
      });
      return updated;
    });
  };

  const allTypes = getFieldTypes();

  // Calculate group states based on individual field visibility
  const layoutFieldIds = allTypes
    .filter((ft) => ft.isLayout && ft.id !== 'object')
    .map((ft) => ft.id);
  const formFieldIds = allTypes
    .filter(
      (ft) =>
        !ft.isLayout &&
        ft.type !== 'integer' &&
        ft.id !== 'multiselect' &&
        ft.id !== 'multicheckbox'
    )
    .map((ft) => ft.id);

  const currentFields = isSettingsDrawerOpen ? tempVisibleFields : visibleFields;

  const allLayoutsVisible =
    layoutFieldIds.length > 0 && layoutFieldIds.every((id) => currentFields[id]);
  const allFormFieldsVisible =
    formFieldIds.length > 0 && formFieldIds.every((id) => currentFields[id]);

  const someLayoutsVisible = layoutFieldIds.some((id) => currentFields[id]);
  const someFormFieldsVisible = formFieldIds.some((id) => currentFields[id]);

  const layoutTypes = allTypes.filter(
    (ft) => ft.isLayout && ft.id !== 'object' && visibleFields[ft.id]
  );
  const fieldTypes = allTypes.filter(
    (ft) =>
      !ft.isLayout &&
      ft.type !== 'integer' &&
      ft.id !== 'multiselect' &&
      ft.id !== 'multicheckbox' &&
      visibleFields[ft.id]
  );

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

  const [rows, setRows] = useState([]);

  React.useEffect(() => {
    setRows(screenResolutions);
  }, [screenResolutions]);

  const handleChange = (index, field) => (event) => {
    setIsScreenChanged(true);
    const value = event.target.value;
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]:
          field === 'width' || field === 'height'
            ? value === ''
              ? ''
              : Number(value) < 1
                ? 1
                : Number(value)
            : value,
      };
      return copy;
    });
  };

  const handleToggleEnabled = (index) => (event) => {
    setIsScreenChanged(true);
    const checked = event.target.checked;
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], enabled: checked };
      return copy;
    });
  };

  const handleDelete = (index) => () => {
    setIsScreenChanged(true);
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    setIsScreenChanged(true);
    setRows((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        label: '',
        width: '',
        height: '',
        enabled: true,
        isNew: true,
      },
    ]);
  };

  const [isScreenChanged, setIsScreenChanged] = useState(false);
  // Check if there are any changes to enable/disable save button
  const hasChanges = React.useMemo(() => {
    if (!isSettingsDrawerOpen) return false;
    if (JSON.stringify(tempVisibleFields) !== JSON.stringify(visibleFields)) return true;
    if (isScreenChanged) return true;
  }, [tempVisibleFields, visibleFields, isSettingsDrawerOpen, isScreenChanged]);

  const [resonsiveLayoutState, setResonsiveLayoutState] = useState(responsiveState || false);
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
          <Tooltip title="Settings" arrow>
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
          </Tooltip>
        </Box>

        {/* Settings Drawer */}
        <Drawer
          anchor="left"
          open={isSettingsDrawerOpen}
          onClose={handleSettingsCancel}
          sx={{
            '& .MuiDrawer-paper': {
              width: 500,
              boxSizing: 'border-box',
            },
          }}
        >
          <Box sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1,
                p: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t('settings')}
              </Typography>
              <IconButton
                onClick={handleSettingsCancel}
                size="small"
                sx={{
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
              >
                <IconX size={20} />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2, width: '100%' }} />
            <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }} width={500} px={2}>
              <Accordion defaultExpanded sx={accordionSx}>
                <AccordionSummary expandIcon={<IconChevronDown />} sx={accordionSummarySx}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {t('fieldVisibility')}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ overflow: 'auto' }}>
                    {/* Layout Controls Accordion */}
                    <Accordion
                      expanded={expandedAccordions.layouts}
                      onChange={handleAccordionChange('layouts')}
                      sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
                    >
                      <AccordionSummary
                        expandIcon={<IconChevronDown size={20} />}
                        sx={{
                          px: 0,
                          minHeight: '48px',
                          '& .MuiAccordionSummary-content': {
                            margin: 0,
                            alignItems: 'center',
                          },
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={allLayoutsVisible}
                              indeterminate={someLayoutsVisible && !allLayoutsVisible}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleLayoutsToggle();
                              }}
                              size="small"
                              color="primary"
                              onClick={(e) => e.stopPropagation()}
                            />
                          }
                          label={
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500, color: 'primary.main' }}
                            >
                              <IconLayersLinked
                                size={16}
                                style={{ marginRight: 4, verticalAlign: 'middle' }}
                              />
                              {t('layouts')}
                            </Typography>
                          }
                          sx={{ m: 0 }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </AccordionSummary>
                      <AccordionDetails sx={{ px: 0, pt: 0 }}>
                        <List dense sx={{ pl: 2 }}>
                          {allTypes
                            .filter((ft) => ft.isLayout && ft.id !== 'object')
                            .map((fieldType) => (
                              <ListItem key={fieldType.id} sx={{ py: 0.5 }}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={currentFields[fieldType.id] || false}
                                      onChange={() => handleFieldVisibilityChange(fieldType.id)}
                                      size="small"
                                      color="primary"
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
                      </AccordionDetails>
                    </Accordion>

                    {/* Field Controls Accordion */}
                    <Accordion
                      expanded={expandedAccordions.formFields}
                      onChange={handleAccordionChange('formFields')}
                      sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
                    >
                      <AccordionSummary
                        expandIcon={<IconChevronDown size={20} />}
                        sx={{
                          px: 0,
                          minHeight: '48px',
                          '& .MuiAccordionSummary-content': {
                            margin: 0,
                            alignItems: 'center',
                          },
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={allFormFieldsVisible}
                              indeterminate={someFormFieldsVisible && !allFormFieldsVisible}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleFormFieldsToggle();
                              }}
                              size="small"
                              color="primary"
                              onClick={(e) => e.stopPropagation()}
                            />
                          }
                          label={
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500, color: 'primary.main' }}
                            >
                              <IconForms
                                size={16}
                                style={{ marginRight: 4, verticalAlign: 'middle' }}
                              />
                              {t('formFields')}
                            </Typography>
                          }
                          sx={{ m: 0 }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </AccordionSummary>
                      <AccordionDetails sx={{ px: 0, pt: 0 }}>
                        <List dense sx={{ pl: 2 }}>
                          {allTypes
                            .filter(
                              (ft) =>
                                !ft.isLayout &&
                                ft.type !== 'integer' &&
                                ft.id !== 'multiselect' &&
                                ft.id !== 'multicheckbox'
                            )
                            .map((fieldType) => (
                              <ListItem key={fieldType.id} sx={{ py: 0.5 }}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={currentFields[fieldType.id] || false}
                                      onChange={() => handleFieldVisibilityChange(fieldType.id)}
                                      size="small"
                                      color="primary"
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
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                </AccordionDetails>
              </Accordion>
              <Accordion defaultExpanded sx={accordionSx}>
                <AccordionSummary expandIcon={<IconChevronDown />} sx={accordionSummarySx}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {t('responsiveUi')}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ overflow: 'auto' }}>
                    {/* Layout Controls Accordion */}
                    <Accordion
                      expanded={expandedAccordions.layouts}
                      onChange={handleAccordionChange('layouts')}
                      sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
                    >
                      <AccordionDetails sx={{ px: 0, pt: 0 }}>
                        <Box>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={resonsiveLayoutState.showResplayout}
                                onChange={(e) => {
                                  const status = e.target.checked;
                                  setResonsiveLayoutState({
                                    ...resonsiveLayoutState,
                                    showResplayout: status,
                                  });
                                  setIsScreenChanged(true);
                                }}
                                color="primary"
                              />
                            }
                            label={t('showResponsiveLayout')}
                            sx={{ mb: 2, display: 'block' }}
                          />
                          {resonsiveLayoutState.showResplayout && (
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={resonsiveLayoutState.showRotateOption}
                                  onChange={(e) => {
                                    const status = e.target.checked;
                                    setResonsiveLayoutState({
                                      ...resonsiveLayoutState,
                                      showRotateOption: status,
                                    });
                                    setIsScreenChanged(true);
                                  }}
                                  color="primary"
                                />
                              }
                              label={t('showRotateOption')}
                              sx={{ mb: 2, display: 'block' }}
                            />
                          )}
                        </Box>
                        {resonsiveLayoutState.showResplayout && (
                          <Box>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                              {t('responsiveScreens')}
                            </Typography>

                            {rows.map((row, index) => (
                              <Box
                                key={row.id}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  mb: 1,
                                }}
                              >
                                <Checkbox
                                  checked={row.enabled}
                                  onChange={handleToggleEnabled(index)}
                                  disabled={index === 0}
                                />
                                {row.isNew ? (
                                  <TextField
                                    label="Label"
                                    size="small"
                                    value={row.label}
                                    onChange={handleChange(index, 'label')}
                                    InputProps={{
                                      sx: {
                                        '& input': {
                                          fontSize: '14px', // 14px
                                          paddingLeft: '8px',
                                          paddingRight: '8px',
                                        },
                                      },
                                    }}
                                    disabled={index === 0}
                                    sx={{ minWidth: 180 }}
                                  />
                                ) : (
                                  <Typography sx={{ minWidth: 180 }}>{row.label}</Typography>
                                )}

                                {row.isNew ? (
                                  <TextField
                                    label="Width"
                                    type="number"
                                    size="small"
                                    value={row.width}
                                    onChange={handleChange(index, 'width')}
                                    InputProps={{
                                      inputProps: { min: 1 },
                                      sx: {
                                        '& input': {
                                          fontSize: '14px', // 14px
                                          paddingLeft: '8px',
                                          paddingRight: '8px',
                                        },
                                      },
                                    }}
                                    disabled={index === 0}
                                    sx={{ width: 120 }}
                                  />
                                ) : (
                                  <Typography sx={{ width: 120 }}>{row.width}</Typography>
                                )}

                                {row.isNew ? (
                                  <TextField
                                    label="Height"
                                    type="number"
                                    size="small"
                                    value={row.height}
                                    onChange={handleChange(index, 'height')}
                                    InputProps={{
                                      inputProps: { min: 1 },
                                      sx: {
                                        '& input': {
                                          fontSize: '14px', // 14px
                                          paddingLeft: '8px',
                                          paddingRight: '8px',
                                        },
                                      },
                                    }}
                                    disabled={index === 0}
                                    sx={{ width: 120 }}
                                  />
                                ) : (
                                  <Typography sx={{ width: 120 }}>{row.height}</Typography>
                                )}

                                {row.isNew && (
                                  <IconButton
                                    aria-label="delete"
                                    color="error"
                                    onClick={handleDelete(index)}
                                  >
                                    <IconTrash size={15} />
                                  </IconButton>
                                )}
                              </Box>
                            ))}

                            <Button variant="outlined" onClick={handleAdd}>
                              Add resolution
                            </Button>
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>

                    {/* Field Controls Accordion */}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Box>
            {/* Fixed Action Buttons at Bottom */}
            <Box sx={propertiesPanelFooter}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSettingsSave}
                disabled={!hasChanges}
              >
                {t('save', 'Save')}
              </Button>
              <Button fullWidth onClick={handleSettingsCancel} variant="outlined">
                {t('cancel', 'Cancel')}
              </Button>
            </Box>
          </Box>
        </Drawer>
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

      <Divider sx={{ my: 2, width: '100%' }} />

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
          <Divider sx={{ my: 2, width: '100%' }} />
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
