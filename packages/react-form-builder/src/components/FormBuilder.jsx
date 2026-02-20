import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Backdrop from '@mui/material/Backdrop';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import FormPreview from './FormPreview';
import FieldPalette from './FieldPalette';
import SchemaEditor from './SchemaEditor';
import FormStructure from './FormStructure';
import FieldProperties from './FieldProperties';

import { exportFormData } from '../lib/export/exportForm';
import { customCollisionDetection } from '../lib/dnd/collision';
import { initializeNestedFormData } from '../lib/data/initData';
import { buildUISchemaFromFields } from '../lib/schema/uiSchema';
import { buildSchemaFromFields } from '../lib/schema/buildSchema';
import { getFieldTypes, getFieldTypeById } from '../lib/registry/fieldRegistry';
import { convertSchemaToFields as convertSchemaToFieldsLib } from '../lib/schema/convert';
import {
  findFieldById,
  getAllFieldIds,
  updateFieldById,
  moveField,
  reorderFieldRelative,
} from '../lib/structure/treeOps';

const FormBuilder = ({
  onExport,
  schemas = [],
  currencyIcon = '$',
  screenResolutions = [],
} = {}) => {
  const { t } = useTranslation();
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [selectedField, setSelectedField] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showFormPreview, setShowFormPreview] = useState(false);
  const [showSchemaEditor, setShowSchemaEditor] = useState(false);
  const [propertiesDrawerOpen, setPropertiesDrawerOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, schemaId: null });
  const [loadedSchemaId, setLoadedSchemaId] = useState('');
  const [visibleFields, setVisibleFields] = useState({});
  const [toolbarVisibility, setToolbarVisibility] = useState({});
  const [screens, setScreens] = useState(screenResolutions);
  const [responsiveState, setResponsiveState] = useState({
    showResplayout: false,
    showRotateOption: false,
  });

  useEffect(() => {
    if (screenResolutions.length === 0) {
      screenResolutions = [
        { id: 'responsive', label: 'Responsive', width: 1376, height: 570 },
        { id: 'iphone-se', label: 'iPhone SE', width: 375, height: 667 },
        { id: 'iphone-xr', label: 'iPhone XR', width: 414, height: 896 },
        { id: 'iphone-12-pro', label: 'iPhone 12 Pro', width: 390, height: 844 },
        { id: 'iphone-14-pro-max', label: 'iPhone 14 Pro Max', width: 430, height: 932 },
        { id: 'pixel-7', label: 'Pixel 7', width: 412, height: 915 },
        { id: 'samsung-galaxy-s8-plus', label: 'Samsung Galaxy S8+', width: 360, height: 740 },
        { id: 'samsung-s20-ultra', label: 'Samsung Galaxy S20 Ultra', width: 412, height: 915 },
        { id: 'ipad-mini', label: 'iPad Mini', width: 768, height: 1024 },
        { id: 'ipad-air', label: 'iPad Air', width: 820, height: 1180 },
        { id: 'ipad-pro', label: 'iPad Pro', width: 1024, height: 1366 },
        { id: 'surface-pro-7', label: 'Surface Pro 7', width: 912, height: 1368 },
        { id: 'surface-duo', label: 'Surface Duo', width: 540, height: 720 },
        { id: 'galaxy-z-fold-5', label: 'Galaxy Z Fold 5', width: 344, height: 882 },
        { id: 'asus-zenbook-fold', label: 'Asus Zenbook Fold', width: 853, height: 1280 },
        { id: 'samsung-galaxy-a51-71', label: 'Samsung Galaxy A51/71', width: 412, height: 914 },
        { id: 'nest-hub', label: 'Nest Hub', width: 1024, height: 600 },
        { id: 'nest-hub-max', label: 'Nest Hub Max', width: 1280, height: 800 },
        { id: 'hd-720p', label: 'HD 720p', width: 1280, height: 720 },
        { id: 'full-hd-1080p', label: 'Full HD 1080p', width: 1920, height: 1080 },
      ];
      setScreens(screenResolutions.map((r) => ({ ...r, enabled: true, isNew: false })));
    } else {
      const newScreens = screenResolutions.filter((obj) => obj.id !== 'responsive');
      screenResolutions = [
        { id: 'responsive', label: 'Responsive', width: 1376, height: 570 },
        ...newScreens,
      ];
      setScreens(screenResolutions.map((r) => ({ ...r, enabled: true, isNew: false })));
    }
  }, [screenResolutions]);

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
    const result = buildSchemaFromFields(fields);
    return result;
  }, [fields]);

  const baseUiSchema = useMemo(() => {
    return {
      type: 'VerticalLayout',
      elements: buildUISchemaFromFields(fields),
    };
  }, [fields]);

  const formState = useMemo(() => {
    const schema = {
      type: 'object',
      properties: schemaData.properties,
      ...(schemaData.required && schemaData.required.length
        ? { required: schemaData.required }
        : {}),
    };

    return {
      schema,
      uischema: baseUiSchema,
      data: formData,
    };
  }, [schemaData, baseUiSchema, formData]);

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
      label: fieldType.isLayout ? fieldType.label : `${fieldType.label}`,
      key: fieldKey,
      fieldKey: fieldKey,
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
      if (fields.length > 0) {
        setConfirmDialog({ open: true, schemaId });
        return false;
      }
      loadSchema(schemaId);
      return true;
    },
    [fields]
  );

  const loadSchema = useCallback(
    (schemaId) => {
      const selectedSchema = schemas.find((s) => s.id === schemaId);
      if (selectedSchema?.schema) {
        const convertedFields = convertSchemaToFields(selectedSchema.schema);
        setFields(convertedFields);
        setFormData({});
        setSelectedField(null);
        setPropertiesDrawerOpen(false);
        setLoadedSchemaId(schemaId);
      }
      setConfirmDialog({ open: false, schemaId: null });
    },
    [schemas, convertSchemaToFields]
  );

  const handleConfirmLoadSchema = useCallback(() => {
    if (confirmDialog.schemaId) {
      loadSchema(confirmDialog.schemaId);
    }
  }, [confirmDialog.schemaId, loadSchema]);

  const handleCancelLoadSchema = useCallback(() => {
    setConfirmDialog({ open: false, schemaId: null });
  }, []);

  const handleResetToOriginal = useCallback(() => {
    if (loadedSchemaId) {
      loadSchema(loadedSchemaId);
    }
  }, [loadedSchemaId, loadSchema]);

  const handleClearAll = useCallback(() => {
    setFields([]);
    setFormData({});
    setSelectedField(null);
    setPropertiesDrawerOpen(false);
    setLoadedSchemaId('');
  }, []);

  const isGroup = selectedField?.uischema?.type === 'Group';

  const isLayout = selectedField?.isLayout && selectedField?.uischema?.type !== 'Group';

  const formTitle = isGroup
    ? t('groupProperties')
    : isLayout
      ? t('layoutProperties')
      : t('fieldProperties');

  const baseBox = {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: (theme) =>
      `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[200]} 100%)`,
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
    display: showFormPreview ? 'none' : 'flex',
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
    marginLeft: showFormPreview ? 0 : { xs: 0, md: 0 },
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
  const propertiesPanel = (theme) => ({
    position: 'fixed',
    right: 0,
    top: 0,
    width: { xs: '100vw', sm: '400px', md: '480px' },
    height: '100vh',
    bgcolor: 'background.paper',
    background:
      theme.palette.mode === 'dark'
        ? 'linear-gradient(180deg, #2d1b69 0%, #2d1b69 100%)'
        : '#ffffff',
    boxShadow: '-4px 0 25px -5px rgba(0, 0, 0, 0.1), -2px 0 10px -5px rgba(0, 0, 0, 0.04)',
    zIndex: 1000,
    overflow: 'auto',
    borderLeft: 1,
    borderColor: 'divider',
    opacity: 1,
  });

  const propertiesPanelBox = {
    p: 3,
    borderBottom: 1,
    borderColor: 'divider',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'action.hover',
  };

  const propertiesPanelButton = {
    minWidth: 'auto',
    p: 1,
    borderRadius: 1.5,
    color: 'grey.500',
    '&:hover': {
      backgroundColor: 'action.hover',
      color: 'text.primary',
    },
  };
  const propertiesPanelTypo = { margin: 0, fontWeight: 600, color: 'text.primary' };

  const propertiesPanelContent = {
    p: 2,
    bgcolor: 'background.paper',
    minHeight: '100%',
  };

  const propertiesPanelFooter = {
    p: '10px',
    bgcolor: 'background.paper',
    borderTop: 1,
    borderColor: 'divider',
    display: 'flex',
    gap: 2,
    position: 'sticky',
    bottom: 0,
    zIndex: 10,
    height: 64,
  };

  const saveButton = {
    py: 1.5,
    fontSize: '15px',
    transform: 'none',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0px)',
    },
  };

  const cancelButton = {
    py: 1.5,
    fontSize: '15px',
    borderWidth: 2,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0px)',
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
      data[key] = prop.type === 'boolean' ? false : prop.type === 'array' ? [] : '';
    });
    setFormData(data);
  };

  useEffect(() => {
    if (showFormPreview) {
      resetForm();
    }
  }, [showFormPreview]);

  const screenChanged = (data) => {
    console.log('data', data);
    data.rows.map((item) => {
      item.isNew = false;
    });
    setScreens(data.rows);
    setResponsiveState(data.layout);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      modifiers={[restrictToWindowEdges]}
      collisionDetection={customCollisionDetection}
    >
      <SortableContext items={getAllFieldIds(fields)} strategy={verticalListSortingStrategy}>
        <Box sx={baseBox}>
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
                loadedSchemaId={loadedSchemaId}
                visibleFields={visibleFields}
                onVisibleFieldsChange={setVisibleFields}
                screenResolutions={screens}
                onScreenChanged={screenChanged}
                responsiveState={responsiveState}
                toolbarVisibility={toolbarVisibility}
                onToolbarVisibilityChange={setToolbarVisibility}
              />
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
                  onExport={onExport}
                  toolbarVisibility={toolbarVisibility}
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
                      currencyIcon={currencyIcon}
                      screenResolutions={screens}
                      responsiveState={responsiveState}
                      toolbarVisibility={toolbarVisibility}
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
                      onReset={handleResetToOriginal}
                      hasOriginalSchema={!!loadedSchemaId}
                      onClearAll={handleClearAll}
                      propertiesDrawerOpen={propertiesDrawerOpen}
                      toolbarVisibility={toolbarVisibility}
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
        <Backdrop
          open={propertiesDrawerOpen}
          sx={{
            zIndex: 1, // below the panel
            backgroundColor: 'rgba(0,0,0,0.4)', // dim amount
          }}
        />
        {/* Properties Panel */}
        {propertiesDrawerOpen && selectedField && (
          <Box sx={(theme) => ({ zIndex: 2, ...propertiesPanel(theme) })}>
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
                fields={fields}
                setFields={setFields}
                onFieldUpdate={handleFieldUpdate}
                field={editingField || selectedField}
                visibleFields={visibleFields}
              />
            </Box>
            <Box sx={propertiesPanelFooter}>
              <Button
                fullWidth
                type="button"
                color="primary"
                sx={saveButton}
                variant="contained"
                onClick={handleSaveChanges}
                disabled={!hasUnsavedChanges}
              >
                {t('save')}
              </Button>
              <Button
                fullWidth
                type="button"
                color="primary"
                sx={cancelButton}
                variant="outlined"
                onClick={handleCancelChanges}
              >
                {t('cancel')}
              </Button>
            </Box>
          </Box>
        )}
      </SortableContext>
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelLoadSchema}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">{t('loadNewSchema')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {t('discardChanges')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLoadSchema} color="primary">
            {t('cancel')}
          </Button>
          <Button onClick={handleConfirmLoadSchema} variant="contained" autoFocus>
            {t('continue')}
          </Button>
        </DialogActions>
      </Dialog>
    </DndContext>
  );
};

export default FormBuilder;
