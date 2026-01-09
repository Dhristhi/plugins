import {
  Typography,
  TextField,
  FormControlLabel,
  Box,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  Grid,
  Slider,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { IconPlus, IconTrash, IconSettings, IconChevronDown, IconEdit } from '@tabler/icons-react';

import { defaultFieldTypes } from '../types';
import IconSelector from '../utils/IconSelector';

const FieldProperties = ({ field, onFieldUpdate }) => {
  const [localField, setLocalField] = useState(null);
  const [enumOptions, setEnumOptions] = useState([]);
  const [newOption, setNewOption] = useState('');
  const [selectedAccess, setSelectedAccess] = useState([]);
  const [layout, setLayout] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');

  const FILE_TYPE_OPTIONS = [
    { label: '.pdf', value: 'application/pdf' },

    { label: '.jpg/.jpeg', value: 'image/jpeg' },
    { label: '.png', value: 'image/png' },
    { label: '.gif', value: 'image/gif' },
    { label: '.webp', value: 'image/webp' },

    { label: '.doc', value: 'application/msword' },
    {
      label: '.docx',
      value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },

    { label: '.txt', value: 'text/plain' },
    { label: '.rtf', value: 'application/rtf' },

    { label: '.xls', value: 'application/vnd.ms-excel' },
    { label: '.xlsx', value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },

    { label: '.ppt', value: 'application/vnd.ms-powerpoint' },
    {
      label: '.pptx',
      value: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    },

    { label: '.csv', value: 'text/csv' },
  ];

  const handleLayoutChange = (event) => {
    const newLayoutType = event.target.value;
    setLayout(newLayoutType);

    const uischemaType =
      newLayoutType === 'horizontal-layout' ? 'HorizontalLayout' : 'VerticalLayout';

    const updatedField = {
      ...localField,
      label: newLayoutType === 'horizontal-layout' ? 'Horizontal Layout' : 'Vertical Layout',
      type: newLayoutType,
      uischema: {
        ...localField.uischema,
        type: uischemaType,
      },
    };
    setLocalField(updatedField);
    onFieldUpdate(updatedField);
  };

  useEffect(() => {
    if (field) {
      let updatedField = { ...field };

      // Ensure date fields have default dateTimeFormat in UI schema
      if (
        (field.schema?.format === 'date' ||
          field.schema?.format === 'datetime' ||
          field.schema?.format === 'time' ||
          field.type === 'date') &&
        !field.uischema?.options?.dateTimeFormat
      ) {
        const defaultFormat = field.uischema?.options?.includeTime
          ? 'DD MMM YYYY, HH:mm'
          : 'D MMM YYYY';

        updatedField = {
          ...field,
          uischema: {
            ...field.uischema,
            options: {
              ...field.uischema?.options,
              dateTimeFormat: defaultFormat,
            },
          },
        };

        // Update the field in the parent component
        onFieldUpdate(updatedField);
      }

      setLocalField(updatedField);

      if (field.isLayout) {
        setLayout(field.type);
      }
      if (field.schema.enum) {
        setEnumOptions([...field.schema.enum]);
      } else if (field.schema.items?.enum) {
        setEnumOptions([...field.schema.items.enum]);
      } else {
        setEnumOptions([]);
      }
      setSelectedAccess(field.schema?.allowedAccess || []);
      setSelectedIcon(field.icon || '');
    }
  }, [field, onFieldUpdate]);

  const emptyStateContainerSx = {
    p: 3,
    textAlign: 'center',
  };

  const emptyStateTitleSx = {
    fontWeight: 500,
    color: 'grey.400',
  };

  const mb16 = {
    marginBottom: '16px',
  };

  if (!localField) {
    return (
      <Box sx={emptyStateContainerSx}>
        <IconSettings size={48} sx={mb16} color="currentColor" />

        <Typography variant="h6" color="textSecondary" sx={emptyStateTitleSx}>
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
      if (localField.schema?.type === 'array' && localField.schema?.items) {
        handleSchemaUpdate({
          items: {
            ...localField.schema.items,
            enum: newOptions,
          },
        });
      } else {
        handleSchemaUpdate({ enum: newOptions });
      }
      setNewOption('');
    }
  };

  const handleRemoveOption = (index) => {
    const newOptions = enumOptions.filter((_, i) => i !== index);
    setEnumOptions(newOptions);
    if (localField.schema?.type === 'array' && localField.schema?.items) {
      handleSchemaUpdate({
        items:
          newOptions.length > 0
            ? { ...localField.schema.items, enum: newOptions }
            : { type: 'string' },
      });
    } else {
      handleSchemaUpdate({
        enum: newOptions.length > 0 ? newOptions : undefined,
      });
    }
  };

  const handleFieldTypeChange = (newTypeId) => {
    const newFieldType = defaultFieldTypes.find((ft) => ft.id === newTypeId);
    if (newFieldType && !newFieldType.isLayout) {
      const updatedField = {
        ...localField,
        type: newFieldType.id,
        schema: { ...newFieldType.schema, title: localField.label },
        uischema: {
          ...newFieldType.uischema,
          scope: `#/properties/${localField.key}`,
        },
      };

      // Preserve enum options and uischema options
      if (hasEnumOptions && ['select', 'radio', 'multiselect'].includes(newTypeId)) {
        if (newTypeId === 'multiselect') {
          updatedField.schema.items = {
            type: 'string',
            enum: enumOptions,
          };
          delete updatedField.schema.enum;
          // Preserve existing uischema options for multiselect
          if (localField.uischema?.options) {
            updatedField.uischema.options = {
              ...updatedField.uischema.options,
              ...localField.uischema.options,
            };
          }
        } else {
          updatedField.schema.enum = enumOptions;
        }
      }

      setLocalField(updatedField);
      onFieldUpdate(updatedField);

      // Update enum options state for new type
      if (newFieldType.schema.enum) {
        setEnumOptions([...newFieldType.schema.enum]);
      } else if (newFieldType.schema.items?.enum) {
        setEnumOptions([...newFieldType.schema.items.enum]);
      } else if (!['select', 'radio', 'multiselect'].includes(newTypeId)) {
        setEnumOptions([]);
      }
    }
  };

  const getCompatibleFieldTypes = () => {
    const currentSchemaType = localField.schema?.type;

    // Array fields with enum items (multiselect) can switch between multiselect and array
    if (currentSchemaType === 'array' && localField.schema?.items?.enum) {
      return availableFieldTypes.filter(
        (ft) => ft.id === 'multiselect' || ft.id === 'array' || ft.id === 'array-strings'
      );
    }

    // Array fields without enum can switch between array and multiselect
    if (currentSchemaType === 'array') {
      return availableFieldTypes.filter(
        (ft) => ft.id === 'array' || ft.id === 'multiselect' || ft.id === 'array-strings'
      );
    }

    return availableFieldTypes.filter((ft) => {
      // Don't allow converting to array types from other types
      if (ft.id === 'array' || ft.id === 'multiselect' || ft.id === 'array-strings') return false;

      const targetSchemaType = ft.schema?.type;

      // Allow switching within same schema type
      if (currentSchemaType === targetSchemaType) {
        return true;
      }

      return false;
    });
  };

  const getFieldTypeIcon = (typeId) => {
    const fieldType = defaultFieldTypes.find((ft) => ft.id === typeId);
    return fieldType?.icon || IconEdit;
  };

  const availableFieldTypes = defaultFieldTypes.filter((ft) => !ft.isLayout);
  const hasEnumOptions =
    ['select', 'radio', 'multiselect'].includes(localField.type) ||
    (localField.schema?.type === 'array' &&
      !!localField.schema?.items &&
      localField.uischema?.options?.multi) ||
    localField.uischema?.options?.format === 'dynamicselect';

  const isGroup = localField.uischema?.type === 'Group';
  const isLayout = localField.isLayout && localField.uischema?.type !== 'Group';

  const handleUiOptionsUpdate = (updates) => {
    const existingUiOptions = localField.uischema?.options?.['ui:options'] || {};
    const updatedUiSchema = {
      ...localField.uischema,
      options: {
        ...localField.uischema?.options,
        'ui:options': {
          ...existingUiOptions,
          ...updates,
        },
      },
    };
    handleUpdate({ uischema: updatedUiSchema });
  };

  const outlinedTextFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
    },
  };

  const layoutSelectSx = {
    borderRadius: 2,
  };

  const fieldTypeMenuItemSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  };

  const requiredSwitchSx = {
    mt: 1,
  };

  const iconSelectorContainerSx = {
    mt: 2,
  };

  const collapsibleGroupSwitchSx = {
    mt: 1,
  };

  const accordionSx = {
    mb: 2,
    boxShadow: 1,
  };

  const optionInputRowSx = {
    display: 'flex',
    gap: 1,
    mb: 2,
  };

  const newOptionTextFieldSx = {
    flex: 1,
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
    },
  };

  const addOptionButtonSx = {
    color: 'success.main',
    backgroundColor: 'success.light',
    borderRadius: 1.5,
    '&:hover': {
      backgroundColor: (theme) => theme.palette.success.light,
      color: 'success.dark',
    },
  };

  const optionChipsWrapperSx = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1,
  };

  const optionChipSx = {
    borderRadius: 1.5,
    textTransform: 'capitalize',
    '& .MuiChip-deleteIcon': {
      color: 'error.main',
      '&:hover': {
        color: 'error.dark',
      },
    },
  };

  const captionTypographySx = { color: 'text.secondary', fontWeight: 600 };
  const chipsContainerSx = { display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 };
  const formControlLabelSx = { mb: 1 };
  const sliderContainerSx = { mt: 2 };

  const containerSx = {
    mt: 3,
    p: 2,
    backgroundColor: 'grey.50',
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'grey.200',
  };

  const subtitleSx = {
    gutterBottom: true,
    color: 'grey.700',
  };

  const infoRowSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 1,
  };

  const bodyTextSx = {
    color: 'grey.600',
    mb: 1,
  };

  const italicTextSx = {
    color: 'grey.500',
    fontStyle: 'italic',
  };

  const textTransCaps = {
    textTransform: 'capitalize',
  };
  return (
    <Box>
      {/* Basic Properties */}
      <Accordion defaultExpanded sx={accordionSx}>
        <AccordionSummary expandIcon={<IconChevronDown />}>
          <Typography variant="subtitle1" fontWeight={600}>
            Basic Properties
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {/* Show label field only for groups and non-layout fields */}
            {!isLayout && (
              <TextField
                label={isGroup ? 'Group Title' : 'Label'}
                fullWidth
                value={localField.label}
                onChange={(e) => {
                  const newLabel = e.target.value;
                  if (isGroup) {
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
                helperText={
                  isGroup ? 'Displayed as the group header' : 'The display label for this field'
                }
                sx={outlinedTextFieldSx}
              />
            )}

            {/* Layout selector for vertical/horizontal layouts */}
            {isLayout && (
              <FormControl fullWidth margin="normal">
                <InputLabel id="layout-select-label">Layout Type</InputLabel>
                <Select
                  labelId="layout-select-label"
                  value={layout}
                  label="Layout Type"
                  onChange={handleLayoutChange}
                  sx={layoutSelectSx}
                >
                  <MenuItem value="vertical-layout">Vertical Layout</MenuItem>
                  <MenuItem value="horizontal-layout">Horizontal Layout</MenuItem>
                </Select>
              </FormControl>
            )}

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
                  sx={outlinedTextFieldSx}
                />

                <FormControl fullWidth margin="normal">
                  <InputLabel>Field Type</InputLabel>
                  <Select
                    value={localField.type}
                    label="Field Type"
                    onChange={(e) => handleFieldTypeChange(e.target.value)}
                    sx={layoutSelectSx}
                  >
                    {getCompatibleFieldTypes().map((fieldType) => {
                      const IconComponent = fieldType.icon;
                      return (
                        <MenuItem key={fieldType.id} value={fieldType.id}>
                          <Box sx={fieldTypeMenuItemSx}>
                            <IconComponent size={18} />
                            <Typography>{fieldType.label}</Typography>
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={localField.required || false}
                      onChange={(e) => handleUpdate({ required: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Required Field"
                  sx={requiredSwitchSx}
                />
              </>
            )}

            {isGroup && (
              <>
                <Box sx={iconSelectorContainerSx}>
                  <IconSelector
                    value={selectedIcon}
                    onChange={(iconName) => {
                      setSelectedIcon(iconName);
                      handleUpdate({ icon: iconName });
                    }}
                  />
                </Box>

                <FormControlLabel
                  control={
                    <Switch
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
                      color="primary"
                    />
                  }
                  label="Collapsible Group"
                  sx={collapsibleGroupSwitchSx}
                />

                {localField.uischema?.options?.collapsed && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localField.uischema?.options?.showUnfocusedDescription || false}
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
                        color="primary"
                      />
                    }
                    label="Start Collapsed"
                  />
                )}
              </>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
      {/* Display Options */}
      {!isLayout && !isGroup && (
        <Accordion sx={accordionSx}>
          <AccordionSummary expandIcon={<IconChevronDown />}>
            <Typography variant="subtitle1" fontWeight={600}>
              Display Options
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Box>
              {/* Date Format Selector for Date Fields */}
              {localField.schema?.format === 'date' ||
              localField.schema?.format === 'datetime' ||
              localField.schema?.format === 'time' ||
              localField.type === 'date' ? (
                <>
                  <FormControl fullWidth margin="normal" sx={outlinedTextFieldSx}>
                    <InputLabel>Date Display Format</InputLabel>
                    <Select
                      value={(() => {
                        const currentFormat = localField.uischema?.options?.dateTimeFormat;
                        const includeTime = localField.uischema?.options?.includeTime;

                        if (!includeTime) {
                          const dateOnlyFormats = [
                            'D MMM YYYY',
                            'DD MMMM YYYY',
                            'MM/DD/YYYY',
                            'DD/MM/YYYY',
                            'YYYY-MM-DD',
                          ];
                          return dateOnlyFormats.includes(currentFormat)
                            ? currentFormat
                            : 'D MMM YYYY';
                        } else {
                          const dateTimeFormats = [
                            'DD MMM YYYY, HH:mm',
                            'MMMM D, YYYY at h:mm A',
                            'MMM D, YYYY • HH:mm',
                            'ddd, D MMM YYYY, HH:mm',
                          ];
                          return dateTimeFormats.includes(currentFormat)
                            ? currentFormat
                            : 'DD MMM YYYY, HH:mm';
                        }
                      })()}
                      label="Date Display Format"
                      onChange={(e) => {
                        const updatedUISchema = {
                          ...localField.uischema,
                          options: {
                            ...localField.uischema?.options,
                            dateTimeFormat: e.target.value,
                          },
                        };
                        handleUpdate({ uischema: updatedUISchema });
                      }}
                    >
                      {!localField.uischema?.options?.includeTime
                        ? [
                            <MenuItem key="D MMM YYYY" value="D MMM YYYY">
                              D MMM YYYY (8 Jan 2025)
                            </MenuItem>,
                            <MenuItem key="DD MMMM YYYY" value="DD MMMM YYYY">
                              DD MMMM YYYY (08 January 2025)
                            </MenuItem>,
                            <MenuItem key="MM/DD/YYYY" value="MM/DD/YYYY">
                              MM/DD/YYYY (01/08/2025)
                            </MenuItem>,
                            <MenuItem key="DD/MM/YYYY" value="DD/MM/YYYY">
                              DD/MM/YYYY (08/01/2025)
                            </MenuItem>,
                            <MenuItem key="YYYY-MM-DD" value="YYYY-MM-DD">
                              YYYY-MM-DD (2025-01-08)
                            </MenuItem>,
                          ]
                        : [
                            <MenuItem key="DD MMM YYYY, HH:mm" value="DD MMM YYYY, HH:mm">
                              DD MMM YYYY, HH:mm (08 Jan 2025, 14:30)
                            </MenuItem>,
                            <MenuItem key="MMMM D, YYYY at h:mm A" value="MMMM D, YYYY at h:mm A">
                              MMMM D, YYYY at h:mm A (January 8, 2025 at 2:30 PM)
                            </MenuItem>,
                            <MenuItem key="MMM D, YYYY • HH:mm" value="MMM D, YYYY • HH:mm">
                              MMM D, YYYY • HH:mm (Jan 8, 2025 • 14:30)
                            </MenuItem>,
                            <MenuItem key="ddd, D MMM YYYY, HH:mm" value="ddd, D MMM YYYY, HH:mm">
                              ddd, D MMM YYYY, HH:mm (Thu, 8 Jan 2025, 14:30)
                            </MenuItem>,
                          ]}
                    </Select>
                  </FormControl>

                  {/* Include Time Toggle */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localField.uischema?.options?.includeTime || false}
                        onChange={(e) => {
                          const includeTime = e.target.checked;
                          let defaultFormat = includeTime ? 'DD MMM YYYY, HH:mm' : 'D MMM YYYY';

                          const updatedUISchema = {
                            ...localField.uischema,
                            options: {
                              ...localField.uischema?.options,
                              includeTime,
                              dateTimeFormat: defaultFormat,
                            },
                          };
                          handleUpdate({ uischema: updatedUISchema });
                        }}
                        color="primary"
                      />
                    }
                    label="Include Time"
                    sx={{ mt: 1, mb: 1 }}
                  />
                </>
              ) : // Default Value field for non-date fields
              localField.type !== 'array' && localField.type !== 'array-strings' ? (
                <TextField
                  label="Default Value"
                  fullWidth
                  value={localField.schema?.default || ''}
                  onChange={(e) => {
                    let defaultValue = e.target.value;

                    // Convert to appropriate type
                    if (localField.type === 'number') {
                      defaultValue = defaultValue ? Number(defaultValue) : undefined;
                    } else if (localField.type === 'checkbox') {
                      defaultValue = defaultValue.toLowerCase() === 'true';
                    }

                    handleSchemaUpdate({ default: defaultValue });
                  }}
                  margin="normal"
                  variant="outlined"
                  helperText="Initial value for this field"
                  sx={outlinedTextFieldSx}
                />
              ) : null}
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={localField.schema?.description || ''}
                onChange={(e) => handleSchemaUpdate({ description: e.target.value || undefined })}
                margin="normal"
                variant="outlined"
                helperText="Help text displayed below the field"
                sx={outlinedTextFieldSx}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
      {/* File Upload Options */}
      {localField.type === 'file' && (
        <Accordion sx={accordionSx}>
          <AccordionSummary expandIcon={<IconChevronDown />}>
            <Typography variant="subtitle1" fontWeight={600}>
              File Upload Options
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Box>
              <FormControl fullWidth>
                <InputLabel id="allowed-file-types-label" shrink>
                  Allowed File Types
                </InputLabel>

                <Select
                  labelId="allowed-file-types-label"
                  multiple
                  displayEmpty
                  label="Allowed File Types"
                  value={
                    localField.uischema?.options?.['ui:options']?.accept
                      ? localField.uischema.options['ui:options'].accept.split(',').filter(Boolean)
                      : []
                  }
                  onChange={(e) => {
                    const values = e.target.value;
                    handleUiOptionsUpdate({
                      accept: values.length ? values.join(',') : undefined,
                    });
                  }}
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return (
                        <Typography sx={{ color: 'text.disabled' }}>Select file types</Typography>
                      );
                    }
                    return selected
                      .map((mime) => FILE_TYPE_OPTIONS.find((o) => o.value === mime)?.label)
                      .join(', ');
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 240,
                        minWidth: 280,
                      },
                    },
                  }}
                >
                  {FILE_TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
      {/* Validation Rules */}
      {!isLayout && !isGroup && (
        <Accordion sx={accordionSx}>
          <AccordionSummary expandIcon={<IconChevronDown />}>
            <Typography variant="subtitle1" fontWeight={600}>
              Validation Rules
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Box>
              {(localField.type === 'text' ||
                localField.type === 'textarea' ||
                localField.type === 'password') && (
                <>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Min Length"
                        type="number"
                        fullWidth
                        value={localField.schema?.minLength || ''}
                        onChange={(e) =>
                          handleSchemaUpdate({
                            minLength: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        margin="normal"
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Max Length"
                        type="number"
                        fullWidth
                        value={localField.schema?.maxLength || ''}
                        onChange={(e) =>
                          handleSchemaUpdate({
                            maxLength: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        margin="normal"
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    label="Pattern (RegEx)"
                    fullWidth
                    value={localField.schema?.pattern || ''}
                    onChange={(e) =>
                      handleSchemaUpdate({
                        pattern: e.target.value || undefined,
                      })
                    }
                    margin="normal"
                    variant="outlined"
                    helperText="Regular expression for validation (e.g., ^[A-Za-z]+$ for letters only)"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </>
              )}

              {localField.type === 'email' && (
                <TextField
                  label="Pattern (RegEx)"
                  fullWidth
                  value={localField.schema?.pattern || ''}
                  onChange={(e) =>
                    handleSchemaUpdate({
                      pattern: e.target.value || undefined,
                    })
                  }
                  margin="normal"
                  variant="outlined"
                  helperText="Regular expression for validation (e.g., ^[A-Za-z]+$ for letters only)"
                  sx={outlinedTextFieldSx}
                />
              )}
              {localField.type === 'number' && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Minimum Value"
                      type="number"
                      fullWidth
                      value={localField.schema?.minimum || ''}
                      onChange={(e) =>
                        handleSchemaUpdate({
                          minimum: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      margin="normal"
                      variant="outlined"
                      sx={outlinedTextFieldSx}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      label="Maximum Value"
                      type="number"
                      fullWidth
                      value={localField.schema?.maximum || ''}
                      onChange={(e) =>
                        handleSchemaUpdate({
                          maximum: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      margin="normal"
                      variant="outlined"
                      sx={outlinedTextFieldSx}
                    />
                  </Grid>
                </Grid>
              )}
            </Box>
            <Box>
              {localField.type === 'file' && (
                <>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <TextField
                        label="Maximum File Size (MB)"
                        type="number"
                        fullWidth
                        value={localField.uischema?.options?.['ui:options']?.maxSize || ''}
                        onChange={(e) =>
                          handleUiOptionsUpdate({
                            maxSize: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        margin="normal"
                        variant="outlined"
                        helperText="Maximum allowed file size in megabytes (e.g., 5 = 5MB)"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
      {/* Options for Select/Radio Fields */}
      {hasEnumOptions && (
        <Accordion defaultExpanded sx={accordionSx}>
          <AccordionSummary expandIcon={<IconChevronDown />}>
            <Typography variant="subtitle1" fontWeight={600}>
              Options
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {(localField.type === 'select' ||
                localField.type === 'multiselect' ||
                (localField.schema?.type === 'array' && localField.uischema?.options?.multi) ||
                localField.uischema?.options?.format === 'dynamicselect') && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={localField.uischema?.options?.entity !== undefined}
                      onChange={(e) => {
                        const isDynamic = e.target.checked;
                        const isMultiSelect =
                          localField.type === 'multiselect' || localField.schema?.type === 'array';
                        const updatedUISchema = {
                          ...localField.uischema,
                          options: {
                            ...localField.uischema?.options,
                            format: isDynamic ? 'dynamicselect' : undefined,
                            multi: isMultiSelect ? true : undefined,
                            entity: isDynamic ? '' : undefined,
                            key: isDynamic ? '' : undefined,
                            value: isDynamic ? '' : undefined,
                          },
                        };
                        handleUpdate({ uischema: updatedUISchema });
                      }}
                      color="primary"
                    />
                  }
                  label="Use Dynamic Data (API)"
                  sx={{ mb: 2 }}
                />
              )}

              {localField.uischema?.options?.entity !== undefined ? (
                <Box>
                  <TextField
                    label="API Entity"
                    fullWidth
                    value={localField.uischema?.options?.entity || ''}
                    onChange={(e) => {
                      const updatedUISchema = {
                        ...localField.uischema,
                        options: {
                          ...localField.uischema?.options,
                          entity: e.target.value,
                        },
                      };
                      handleUpdate({ uischema: updatedUISchema });
                    }}
                    margin="normal"
                    variant="outlined"
                    helperText="API endpoint name (e.g., countries, cities)"
                    sx={outlinedTextFieldSx}
                  />
                  <TextField
                    label="Value Field Name"
                    fullWidth
                    value={localField.uischema?.options?.key || ''}
                    onChange={(e) => {
                      const updatedUISchema = {
                        ...localField.uischema,
                        options: {
                          ...localField.uischema?.options,
                          key: e.target.value,
                        },
                      };
                      handleUpdate({ uischema: updatedUISchema });
                    }}
                    margin="normal"
                    variant="outlined"
                    helperText="Field name for stored value (e.g., code, id). Leave empty for primitive arrays."
                    sx={outlinedTextFieldSx}
                  />
                  <TextField
                    label="Label Field Name"
                    fullWidth
                    value={localField.uischema?.options?.value || ''}
                    onChange={(e) => {
                      const updatedUISchema = {
                        ...localField.uischema,
                        options: {
                          ...localField.uischema?.options,
                          value: e.target.value,
                        },
                      };
                      handleUpdate({ uischema: updatedUISchema });
                    }}
                    margin="normal"
                    variant="outlined"
                    helperText="Field name for display label (e.g., name, label). Leave empty for primitive arrays."
                    sx={outlinedTextFieldSx}
                  />
                </Box>
              ) : (
                <>
                  <Box sx={optionInputRowSx}>
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
                      sx={newOptionTextFieldSx}
                    />

                    <IconButton onClick={handleAddOption} sx={addOptionButtonSx}>
                      <IconPlus size={20} />
                    </IconButton>
                  </Box>

                  <Box sx={optionChipsWrapperSx}>
                    {enumOptions.map((option, index) => (
                      <Chip
                        key={index}
                        label={option}
                        onDelete={() => handleRemoveOption(index)}
                        deleteIcon={<IconTrash size={16} />}
                        variant="outlined"
                        sx={optionChipSx}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
      {/* Advanced Options */}
      {!isLayout && !isGroup && (
        <Accordion sx={accordionSx}>
          <AccordionSummary expandIcon={<IconChevronDown />}>
            <Typography variant="subtitle1" fontWeight={600}>
              Advanced Options
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={localField.uischema?.options?.readonly || false}
                    onChange={(e) => {
                      const updatedUISchema = {
                        ...localField.uischema,
                        options: {
                          ...localField.uischema?.options,
                          readonly: e.target.checked,
                        },
                      };
                      handleUpdate({ uischema: updatedUISchema });
                    }}
                    color="primary"
                  />
                }
                label="Read Only"
                sx={formControlLabelSx}
              />

              {localField.type === 'textarea' && (
                <Box sx={sliderContainerSx}>
                  <Typography variant="body2" gutterBottom>
                    Rows: {localField.uischema?.options?.rows || 3}
                  </Typography>
                  <Slider
                    value={localField.uischema?.options?.rows || 3}
                    onChange={(e, value) => {
                      const updatedUISchema = {
                        ...localField.uischema,
                        options: {
                          ...localField.uischema?.options,
                          rows: value,
                        },
                      };
                      handleUpdate({ uischema: updatedUISchema });
                    }}
                    min={1}
                    max={10}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Field Info */}
      <Box sx={containerSx}>
        <Typography variant="subtitle2" sx={subtitleSx}>
          {isGroup ? 'Group Container' : isLayout ? 'Layout Container' : 'Field Information'}
        </Typography>

        {!isGroup && !isLayout && (
          <Box sx={infoRowSx}>
            {React.createElement(getFieldTypeIcon(localField.type), {
              size: 16,
              color: '#666',
            })}
            <Typography variant="body2" sx={{ color: 'grey.600' }}>
              Type:{' '}
              <Box component="span" sx={textTransCaps}>
                {localField.type}
              </Box>
            </Typography>
          </Box>
        )}

        {!isGroup && !isLayout && localField.schema.format && (
          <Typography variant="body2" sx={bodyTextSx}>
            Format:{' '}
            <Box component="span" sx={textTransCaps}>
              {localField.schema.format}
            </Box>
          </Typography>
        )}

        <Typography variant="body2" sx={italicTextSx}>
          {isGroup
            ? 'Groups provide visual separation and can contain any fields or layouts'
            : isLayout
              ? localField.type === 'vertical-layout'
                ? 'Stacks elements vertically'
                : 'Arranges elements horizontally'
              : `Key: ${localField.key}`}
        </Typography>
      </Box>
    </Box>
  );
};

export default FieldProperties;
