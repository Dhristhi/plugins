import { IconHammer, IconX } from '@tabler/icons-react';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ThemeProvider, createTheme, CssBaseline, Box, Button, Typography } from '@mui/material';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import FormPreview from './components/FormPreview';
import FieldPalette from './components/FieldPalette';
import SchemaEditor from './components/SchemaEditor';
import FormStructure from './components/FormStructure';
import FieldProperties from './components/FieldProperties';

import './lib/registry/init';
import { exportFormData } from './lib/export/exportForm';
import { customCollisionDetection } from './lib/dnd/collision';
import { initializeNestedFormData } from './lib/data/initData';
import { buildUISchemaFromFields } from './lib/schema/uiSchema';
import { buildSchemaFromFields } from './lib/schema/buildSchema';
import { getFieldTypes, getFieldTypeById } from './lib/registry/fieldRegistry';
import { convertSchemaToFields as convertSchemaToFieldsLib } from './lib/schema/convert';
import {
  findFieldById,
  getAllFieldIds,
  updateFieldById,
  moveField,
  reorderFieldRelative,
} from './lib/structure/treeOps';

const defaultTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 4,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});

const App = ({ onExport, onSave, schemas = [], theme: customTheme } = {}) => {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [selectedField, setSelectedField] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showFormPreview, setShowFormPreview] = useState(false);
  const [showSchemaEditor, setShowSchemaEditor] = useState(false);
  const [propertiesDrawerOpen, setPropertiesDrawerOpen] = useState(false);

  const appliedTheme = customTheme || defaultTheme;

  // Drag and Drop state
  const [activeId, setActiveId] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  // Use a counter to generate truly unique IDs that are StrictMode safe
  const fieldCounter = React.useRef(0);
  const pendingOperations = React.useRef(new Set());

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Handle form data changes with nested object support
  const handleFormDataChange = (newData) => {
    setFormData(newData);
  };

  // Update form data when fields change
  React.useEffect(() => {
    if (fields.length > 0) {
      const currentData = { ...formData };
      const initializedData = initializeNestedFormData(fields, currentData);

      // Only update if there are actual changes to prevent unnecessary rerenders
      if (JSON.stringify(currentData) !== JSON.stringify(initializedData)) {
        setFormData(initializedData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  // Compute plan label when plan or tier changes
  useEffect(() => {
    const plan = formData?.plan;
    const tier = formData?.tier;
    if (plan && tier) {
      const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
      const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
      const computed = `${planLabel} – ${tierLabel}`;

      if (formData?.computed_plan_label !== computed) {
        setFormData((prev) => ({
          ...prev,
          computed_plan_label: computed,
        }));
      }
    }
  }, [formData?.plan, formData?.tier]);

  const schemaData = useMemo(() => {
    // console.log('Fields passed to buildSchemaFromFields:', JSON.stringify(fields, null, 2));
    const result = buildSchemaFromFields(fields);
    // console.log('Generated Schema Data:', JSON.stringify(result, null, 2));
    return result;
  }, [fields]);

  const baseUiSchema = useMemo(() => {
    return {
      type: 'VerticalLayout',
      elements: buildUISchemaFromFields(fields),
    };
  }, [fields]);

  // Stable form state object
  const formState = useMemo(() => {
    const schema = {
      type: 'object',
      properties: schemaData.properties,
      ...(schemaData.required && schemaData.required.length
        ? { required: schemaData.required }
        : {}),
    };
    // console.log('Final Schema in formState:', JSON.stringify(schema, null, 2));
    return {
      schema,
      uischema: baseUiSchema,
      data: formData,
    };
  }, [schemaData, baseUiSchema, formData]);

  // // Notify consumer when schema or uischema changes
  // useEffect(() => {
  //   if (typeof onSave === 'function') {
  //     onSave(formState.schema, formState.uischema);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [formState.schema, formState.uischema]);

  const addField = useCallback((fieldType, parentId, index) => {
    // Create a unique operation ID to prevent duplicates
    const operationId = `${fieldType.id}-${parentId || 'root'}-${Date.now()}`;

    // Check if this operation is already pending
    if (pendingOperations.current.has(operationId)) {
      return; // Skip duplicate execution
    }

    // Mark operation as pending
    pendingOperations.current.add(operationId);

    // Clean up after a short delay
    setTimeout(() => {
      pendingOperations.current.delete(operationId);
    }, 100);

    // Use a unique counter to prevent StrictMode duplications
    fieldCounter.current += 1;
    const uniqueId = fieldCounter.current;

    const fieldKey = fieldType.isLayout ? `layout_${uniqueId}` : `${fieldType.id}_${uniqueId}`;

    const newField = {
      id: `field_${uniqueId}`,
      type: fieldType.id,
      label: fieldType.isLayout ? fieldType.label : `${fieldType.label} Field`,
      key: fieldKey,
      required: false,
      schema: { ...fieldType.schema },
      uischema: { ...fieldType.uischema },
      isLayout: fieldType.isLayout,
      children: fieldType.isLayout || fieldType.id === 'array' ? [] : undefined,
      parentId: parentId,
    };
    setFields((prev) => {
      const newFields = [...prev];

      if (parentId) {
        // Add to specific parent layout
        const addToParent = (fieldsArray) => {
          for (const field of fieldsArray) {
            if (field.id === parentId && (field.isLayout || field.type === 'array')) {
              if (!field.children) field.children = [];
              if (typeof index === 'number') {
                field.children.splice(index, 0, newField);
              } else {
                field.children.push(newField);
              }
              return true;
            }
            if (field.children && addToParent(field.children)) {
              return true;
            }
          }
          return false;
        };
        addToParent(newFields);
      } else {
        // Add to root level
        if (typeof index === 'number') {
          newFields.splice(index, 0, newField);
        } else {
          newFields.push(newField);
        }
      }

      return newFields;
    });

    setSelectedField(newField);
    setEditingField(newField);
    setHasUnsavedChanges(false);
    if (!fieldType.isLayout) {
      setPropertiesDrawerOpen(true);
    }
  }, []);

  const addFieldToLayout = useCallback(
    (parentId, index) => {
      const all = getFieldTypes();
      const defaultFieldType = all.find((ft) => !ft.isLayout && ft.id !== 'array') || all[0];
      addField(defaultFieldType, parentId, index);
    },
    [addField]
  );

  const addLayoutToContainer = useCallback(
    (parentId, layoutType, index) => {
      addField(layoutType, parentId, index);
    },
    [addField]
  );

  const handleFieldUpdate = useCallback((updatedField, options = {}) => {
    if (updatedField?.defaultvalueUpdate) {
      setHasUnsavedChanges(true);
      return;
    }
    setEditingField(updatedField);
    setHasUnsavedChanges(true);

    if (options.resetFormData && updatedField.key) {
      setFormData((prevData) => {
        const newData = { ...prevData };
        delete newData[updatedField.key];
        return newData;
      });
    }
  }, []);

  const handleSaveChanges = useCallback(() => {
    if (editingField) {
      setFields((prev) => updateFieldById(prev, editingField));
      setSelectedField(editingField);
      setHasUnsavedChanges(false);
      setPropertiesDrawerOpen(false);
    }
  }, [editingField]);

  const handleCancelChanges = useCallback(() => {
    setEditingField(selectedField);
    setHasUnsavedChanges(false);
    setPropertiesDrawerOpen(false);
  }, [selectedField]);

  const exportForm = () =>
    exportFormData({ schema: formState.schema, uischema: formState.uischema, fields }, onExport);

  // Drag and Drop handlers
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);

    // Determine what is being dragged
    if (active.data.current?.type === 'palette-item') {
      // Dragging from palette
      const fieldType = getFieldTypeById(active.id);
      setDraggedItem({
        type: 'palette-item',
        fieldType: fieldType,
      });
    } else {
      // Dragging existing field in structure
      const draggedField = findFieldById(fields, active.id);
      setDraggedItem({
        type: 'structure-item',
        field: draggedField,
      });
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    // Handle dropping palette items into structure
    if (active.data.current?.type === 'palette-item' && over.data.current?.accepts) {
      // Visual feedback logic can go here
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setDraggedItem(null);
      return;
    }

    // Handle different drag scenarios
    if (active.data.current?.type === 'palette-item') {
      // Dragging from palette to structure
      const fieldType = getFieldTypeById(active.id);
      if (
        fieldType &&
        over.data.current?.accepts?.includes(fieldType.isLayout ? 'layout' : 'field')
      ) {
        const dropTargetId = over.data.current.parentId;
        const dropIndex = over.data.current.index;
        addField(fieldType, dropTargetId, dropIndex);
      }
    } else if (active.data.current?.type === 'structure-item') {
      // Dragging existing structure item
      if (
        over.data.current?.accepts?.includes('structure-item') ||
        over.data.current?.parentId !== undefined ||
        over.id.startsWith('drop-')
      ) {
        // Dropping into a drop zone
        const dropTargetId = over.data.current.parentId;
        const dropIndex = over.data.current.index;
        moveExistingField(active.id, dropTargetId, dropIndex);
      } else if (active.id !== over.id && over.data.current?.type === 'structure-item') {
        // Reordering within structure (dragging onto another field)
        handleReorderFields(active.id, over.id, over.data.current);
      }
    }

    setActiveId(null);
    setDraggedItem(null);
  };

  // Move existing field to new position
  const moveExistingField = (fieldId, targetParentId, targetIndex) => {
    setFields((prevFields) => {
      const newFields = [...prevFields];
      moveField(newFields, fieldId, targetParentId, targetIndex);
      return newFields;
    });
  };

  // Handle reordering of fields in structure
  const handleReorderFields = (activeId, overId, overData) => {
    setFields((prevFields) => {
      const newFields = [...prevFields];
      reorderFieldRelative(newFields, activeId, overId, overData);
      return newFields;
    });
  };

  // Schema loading functionality
  const convertSchemaToFields = useCallback(
    (schema) =>
      convertSchemaToFieldsLib(schema, getFieldTypes(), () => {
        fieldCounter.current += 1;
        return fieldCounter.current;
      }),
    []
  );

  const handleLoadSchemaFromPalette = useCallback(
    (schemaId) => {
      const selectedSchema = schemas.find((s) => s.id === schemaId);
      if (selectedSchema && selectedSchema.schema) {
        const convertedFields = convertSchemaToFields(selectedSchema.schema);
        setFields(convertedFields);
        setFormData({});
        setSelectedField(null);
        setPropertiesDrawerOpen(false);
      }
    },
    [convertSchemaToFields]
  );

  const isGroup = selectedField?.uischema?.type === 'Group';

  const isLayout = selectedField?.isLayout && selectedField?.uischema?.type !== 'Group';

  const formTitle = isGroup
    ? 'Group Properties'
    : isLayout
      ? 'Layout Properties'
      : 'Field Properties';

  const baseBox = {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: (theme) =>
      `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[200]} 100%)`,
  };

  const headerBox = {
    background: (theme) =>
      `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: 'primary.contrastText',
    p: 2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: 4,
  };

  const headerBoxInner = { display: 'flex', alignItems: 'center', gap: 2 };

  const headerTypography = {
    margin: 0,
    fontSize: { xs: '20px', sm: '28px' },
    fontWeight: 600,
    letterSpacing: '-0.02em',
  };

  const mainBox = {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    flexDirection: { xs: 'column', md: 'row' },
  };

  const leftSidebar = {
    width: { xs: '100%', md: '320px' },
    minWidth: { md: '320px' },
    maxHeight: { xs: '40vh', md: 'none' },
    borderRight: { md: 1 },
    borderColor: { md: 'grey.200' },
    borderBottom: { xs: 1, md: 'none' },
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    boxShadow: { md: 1 },
  };

  const centerContent = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    minHeight: { xs: '60vh', md: 'auto' },
  };

  const dragOverlay = {
    backgroundColor: (theme) => theme.palette.primary.main,
    color: 'primary.contrastText',
    p: '8px 12px',
    borderRadius: 1,
    fontSize: '14px',
    fontWeight: 'bold',
    boxShadow: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  };
  const propertiesPanel = {
    position: 'fixed',
    right: 0,
    top: 0,
    width: { xs: '100vw', sm: '400px', md: '480px' },
    height: '100vh',
    background: 'white',
    boxShadow: '-4px 0 25px -5px rgb(0 0 0 / 0.1), -2px 0 10px -5px rgb(0 0 0 / 0.04)',
    zIndex: 1000,
    overflow: 'auto',
    borderLeft: 1,
    borderColor: 'grey.200',
  };

  const propertiesPanelBox = {
    p: 3,
    borderBottom: 1,
    borderColor: 'grey.200',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'grey.50',
  };

  const propertiesPanelButton = {
    minWidth: 'auto',
    p: 1,
    borderRadius: 1.5,
    color: 'grey.500',
    '&:hover': {
      backgroundColor: 'grey.200',
      color: 'grey.600',
    },
  };
  const propertiesPanelTypo = { margin: 0, fontWeight: 600, color: 'grey.800' };

  const propertiesPanelContent = { p: 2, pb: '100px' };

  const propertiesPanelFooter = {
    position: 'fixed',
    bottom: 0,
    right: 0,
    width: { xs: '100vw', sm: '400px', md: '480px' },
    p: 2.5,
    bgcolor: 'white',
    borderTop: 1,
    borderColor: 'grey.200',
    display: 'flex',
    gap: 2,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
    zIndex: 10,
  };

  const saveButton = { py: 1.5, textTransform: 'none', fontSize: '15px' };

  const cancelButton = {
    py: 1.5,
    textTransform: 'none',
    fontSize: '15px',
    borderColor: 'primary.main',
    color: 'primary.main',
    '&:hover': {
      borderColor: 'primary.dark',
      backgroundColor: 'primary.light',
    },
  };

  const showFlex = {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
    overflow: 'auto',
  };

  const resetForm = () => {
    let data = {};
    Object.entries(formState?.schema.properties).forEach(([key, prop]) => {
      data[key] =
        prop.type === 'boolean'
          ? false
          : prop.type === 'number'
            ? 0
            : prop.type === 'array'
              ? []
              : '';
    });
    setFormData(data);
  };

  useEffect(() => {
    if (showFormPreview) {
      resetForm();
    }
  }, [showFormPreview]);

  return (
    <ThemeProvider theme={appliedTheme}>
      <CssBaseline />
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <SortableContext items={getAllFieldIds(fields)} strategy={verticalListSortingStrategy}>
          <Box sx={baseBox}>
            {/* Header */}
            <Box sx={headerBox}>
              <Box sx={headerBoxInner}>
                <IconHammer size={28} />
                <Typography variant="h5" sx={headerTypography}>
                  Form Builder
                </Typography>
              </Box>
            </Box>

            {/* Main Content */}
            <Box sx={mainBox}>
              {/* Left Sidebar - Field Palette */}
              <Box sx={leftSidebar}>
                {' '}
                <FieldPalette
                  onLoadSchema={handleLoadSchemaFromPalette}
                  schemas={schemas.map((s) => ({
                    id: s.id,
                    name: s.name,
                    description: s.description,
                  }))}
                />{' '}
              </Box>

              {/* Center Content - Toggle between Form Structure and Form Preview */}
              <Box sx={centerContent}>
                {/* Schema Editor (when enabled) */}
                {showSchemaEditor && (
                  <SchemaEditor
                    formState={formState}
                    onFormStateChange={(newFormState) => setFormData(newFormState.data)}
                    showFormPreview={showFormPreview}
                    setShowFormPreview={setShowFormPreview}
                    showSchemaEditor={showSchemaEditor}
                    setShowSchemaEditor={setShowSchemaEditor}
                    exportForm={exportForm}
                    onSave={onSave}
                  />
                )}

                {/* Content Area - Either Form Structure or Form Preview */}
                {!showSchemaEditor && (
                  <Box sx={showFlex}>
                    {showFormPreview ? (
                      /* Form Preview Mode */
                      <FormPreview
                        formState={formState}
                        onDataChange={handleFormDataChange}
                        showFormPreview={showFormPreview}
                        setShowFormPreview={setShowFormPreview}
                        showSchemaEditor={showSchemaEditor}
                        setShowSchemaEditor={setShowSchemaEditor}
                        exportForm={exportForm}
                      />
                    ) : (
                      /* Form Structure Mode */
                      <FormStructure
                        fields={fields}
                        onFieldsChange={setFields}
                        onFieldSelect={(field, openDrawer = false) => {
                          setSelectedField(field);
                          setEditingField(field);
                          setHasUnsavedChanges(false);

                          if (openDrawer) {
                            setPropertiesDrawerOpen(true);
                          }
                        }}
                        selectedField={selectedField}
                        onAddFieldToLayout={addFieldToLayout}
                        onAddLayoutToContainer={addLayoutToContainer}
                        showFormPreview={showFormPreview}
                        setShowFormPreview={setShowFormPreview}
                        showSchemaEditor={showSchemaEditor}
                        setShowSchemaEditor={setShowSchemaEditor}
                        exportForm={exportForm}
                      />
                    )}
                  </Box>
                )}
              </Box>
            </Box>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeId && draggedItem ? (
                <Box sx={dragOverlay}>
                  <span>
                    {draggedItem.type === 'palette-item'
                      ? draggedItem.fieldType?.icon &&
                        React.createElement(draggedItem.fieldType.icon, {
                          size: 16,
                        })
                      : '📝'}
                  </span>
                  <span>
                    {draggedItem.type === 'palette-item'
                      ? draggedItem.fieldType?.label
                      : draggedItem.field?.label || 'Field'}
                  </span>
                </Box>
              ) : null}
            </DragOverlay>
          </Box>

          {/* Properties Panel */}
          {propertiesDrawerOpen && selectedField && (
            <Box sx={propertiesPanel}>
              <Box sx={propertiesPanelBox}>
                <Typography variant="h6" sx={propertiesPanelTypo}>
                  {formTitle}
                </Typography>
                <Button
                  onClick={() => {
                    setPropertiesDrawerOpen(false);
                    setHasUnsavedChanges(false);
                  }}
                  size="small"
                  sx={propertiesPanelButton}
                >
                  <IconX size={20} />
                </Button>
              </Box>
              <Box sx={propertiesPanelContent}>
                <FieldProperties
                  field={editingField || selectedField}
                  onFieldUpdate={handleFieldUpdate}
                  fields={fields}
                  setFields={setFields}
                />
              </Box>
              <Box sx={propertiesPanelFooter}>
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  onClick={handleSaveChanges}
                  disabled={!hasUnsavedChanges}
                  fullWidth
                  sx={saveButton}
                >
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleCancelChanges}
                  fullWidth
                  sx={cancelButton}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </SortableContext>
      </DndContext>
    </ThemeProvider>
  );
};

export default App;
