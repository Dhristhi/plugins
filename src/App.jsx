import {
  DndContext,
  DragOverlay,
  closestCenter,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { IconHammer, IconX } from '@tabler/icons-react';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ThemeProvider, createTheme, CssBaseline, Box, Button, Typography } from '@mui/material';

import FormPreview from './components/FormPreview';
import FieldPalette from './components/FieldPalette';
import SchemaEditor from './components/SchemaEditor';
import FormStructure from './components/FormStructure';
import FieldProperties from './components/FieldProperties';

import { defaultFieldTypes } from './types';

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

const App = ({ onExport, onSchemaChange, schemas = [], theme: customTheme } = {}) => {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [selectedField, setSelectedField] = useState(null);
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

  // Generate form state from fields
  const buildSchemaFromFields = (fieldsArray, parentKey = null) => {
    const properties = {};
    const required = [];
    const nestedObjects = {};

    fieldsArray.forEach((field) => {
      if (!field.isLayout) {
        // Regular field
        const fieldKey = parentKey ? `${parentKey}.${field.key}` : field.key;
        properties[field.key] = {
          ...field.schema,
          title: field.label,
        };
        // Add to required array if marked as required
        if (field.required) {
          required.push(field.key);
        }
      } else if (field.type === 'object') {
        // Object field - creates nested structure
        const childSchema = field.children
          ? buildSchemaFromFields(field.children, field.key)
          : { properties: {}, required: [] };
        const objectSchema = {
          type: 'object',
          title: field.label,
          properties: childSchema.properties,
        };

        if (childSchema.required && childSchema.required.length > 0) {
          objectSchema.required = childSchema.required;
        }

        properties[field.key] = objectSchema;
        // Add to required array if marked as required
        if (field.required) {
          required.push(field.key);
        }
        // Merge any nested objects from children
        Object.assign(nestedObjects, childSchema.nestedObjects || {});
      } else if (field.type === 'array') {
        // Array field - Process children into items structure
        if (field.children && field.children.length > 0) {
          // Build schema for array items from children
          const childSchema = buildSchemaFromFields(field.children, null);

          // Build array schema with explicit property order
          properties[field.key] = {};
          properties[field.key].type = 'array';
          properties[field.key].title = field.label;
          properties[field.key].items = {
            type: 'object',
            properties: childSchema.properties,
          };

          if (childSchema.required && childSchema.required.length > 0) {
            properties[field.key].items.required = childSchema.required;
          }

          // Add optional properties after items
          if (field.schema.minItems) properties[field.key].minItems = field.schema.minItems;
          if (field.schema.maxItems) properties[field.key].maxItems = field.schema.maxItems;
          if (field.schema.uniqueItems)
            properties[field.key].uniqueItems = field.schema.uniqueItems;
          if (field.schema.tableView) properties[field.key].tableView = field.schema.tableView;
        } else {
          // Simple array without children
          properties[field.key] = {};
          properties[field.key].type = 'array';
          properties[field.key].title = field.label;
          // Copy other properties from field.schema except type
          Object.keys(field.schema).forEach((key) => {
            if (key !== 'type') {
              properties[field.key][key] = field.schema[key];
            }
          });
        }

        if (field.required) {
          required.push(field.key);
        }
      } else {
        // Layout fields (group, vertical-layout, horizontal-layout) - don't create schema nesting
        if (field.children) {
          const childSchema = buildSchemaFromFields(field.children, parentKey);
          Object.assign(properties, childSchema.properties);
          // Add required fields from layout children to current level
          if (childSchema.required) {
            required.push(...childSchema.required);
          }
          Object.assign(nestedObjects, childSchema.nestedObjects || {});
        }
      }
    });

    return { properties, required, nestedObjects };
  };

  const buildUISchemaForArrayItems = (fieldsArray) => {
    return fieldsArray
      .filter((field) => !field.uischema?.options?.hidden)
      .map((field) => {
        if (field.isLayout && field.type !== 'array') {
          return {
            ...field.uischema,
            label: field.label,
            elements: field.children ? buildUISchemaForArrayItems(field.children) : [],
          };
        } else if (field.type === 'array') {
          // Nested array inside array - wrap in Group to show title
          let nestedDetailElements = [];
          if (field.children && field.children.length > 0) {
            nestedDetailElements = buildUISchemaForArrayItems(field.children);
          }
          return {
            type: 'GroupWithIcon',
            label: field.label,
            elements: [
              {
                type: 'Control',
                scope: `#/properties/${field.key}`,
                options: {
                  ...field.uischema?.options,
                  showSortButtons: true,
                  ...(nestedDetailElements.length > 0 && {
                    detail: {
                      type: 'VerticalLayout',
                      elements: nestedDetailElements,
                    },
                  }),
                },
              },
            ],
          };
        } else {
          // Regular field inside array - scope is relative to item
          return {
            type: 'Control',
            scope: `#/properties/${field.key}`,
            label: field.label,
            options: field.uischema?.options,
          };
        }
      });
  };

  const buildUISchemaFromFields = (fieldsArray, parentKey = null) => {
    return fieldsArray
      .filter((field) => {
        // Filter out hidden fields - they shouldn't appear in the UI schema at all
        return !field.uischema?.options?.hidden;
      })
      .map((field) => {
        if (field.isLayout) {
          // All layout types (object, group, vertical, horizontal) - preserve structure
          const uischema = {};

          // Add icon first if it exists (for groups)
          if (field.icon) {
            uischema.icon = `Icon${field.icon}`; // Store as full icon name like IconStars
          }

          // Determine type - all groups use GroupWithIcon
          uischema.type =
            field.type === 'object' || field.type === 'group'
              ? 'GroupWithIcon'
              : field.uischema.type;
          uischema.label = field.label;

          // Process children with appropriate parentKey
          const newParentKey =
            field.type === 'object'
              ? parentKey
                ? `${parentKey}/properties/${field.key}`
                : field.key
              : parentKey;

          uischema.elements = field.children
            ? buildUISchemaFromFields(field.children, newParentKey)
            : [];

          // Add any other uischema properties
          if (field.uischema.options) {
            uischema.options = field.uischema.options;
          }

          return uischema;
        } else {
          // Check if it's an array field
          if (field.type === 'array') {
            const scope = parentKey
              ? `#/properties/${parentKey}/properties/${field.key}`
              : `#/properties/${field.key}`;

            let detailElements = [];
            if (field.children && field.children.length > 0) {
              detailElements = buildUISchemaForArrayItems(field.children);
            }

            // Wrap array control in GroupWithIcon to show title like objects
            return {
              type: 'GroupWithIcon',
              label: field.label,
              elements: [
                {
                  type: 'Control',
                  scope: scope,
                  options: {
                    ...field.uischema?.options,
                    showSortButtons: true,
                    ...(detailElements.length > 0 && {
                      detail: {
                        type: 'VerticalLayout',
                        elements: detailElements,
                      },
                    }),
                  },
                },
              ],
            };
          } else {
            // Regular field
            const scope = parentKey
              ? `#/properties/${parentKey}/properties/${field.key}`
              : `#/properties/${field.key}`;
            return {
              ...field.uischema,
              scope: scope,
              label: field.label,
            };
          }
        }
      });
  };

  // Handle form data changes with nested object support
  const handleFormDataChange = (newData) => {
    setFormData(newData);
  };

  const createDefaultArrayItem = (children) => {
    const item = {};
    children.forEach((child) => {
      if (!child.isLayout) {
        // Initialize field with default value
        if (child.schema.type === 'boolean') {
          item[child.key] = false;
        } else if (child.schema.type === 'number') {
          item[child.key] = 0;
        } else if (child.schema.type === 'array') {
          item[child.key] = [];
        } else {
          item[child.key] = '';
        }
      } else if (child.type === 'object') {
        // Initialize nested object
        item[child.key] = child.children ? createDefaultArrayItem(child.children) : {};
      } else if (child.type === 'array') {
        // Nested array
        item[child.key] = [];
      } else if (child.children) {
        // Layout fields - merge their children into current level
        const layoutData = createDefaultArrayItem(child.children);
        Object.assign(item, layoutData);
      }
    });
    return item;
  };

  // Initialize nested object data structure - FIXED VERSION
  const initializeNestedFormData = (fieldsArray, parentData = {}) => {
    const data = { ...parentData };

    fieldsArray.forEach((field) => {
      if (!field.isLayout) {
        // Initialize field with default value if not set
        if (!(field.key in data)) {
          if (field.schema.type === 'boolean') {
            data[field.key] = false;
          } else if (field.schema.type === 'number') {
            data[field.key] = 0;
          } else if (field.schema.type === 'array') {
            // Arrays should be initialized with sample data if children exist
            if (field.children && field.children.length > 0) {
              // Create one sample item to show the structure
              const sampleItem = createDefaultArrayItem(field.children);
              data[field.key] = [sampleItem];
            } else {
              data[field.key] = [];
            }
          } else {
            data[field.key] = '';
          }
        }
      } else if (field.type === 'object') {
        // Initialize nested object
        if (!(field.key in data)) {
          data[field.key] = {};
        }
        if (field.children) {
          data[field.key] = initializeNestedFormData(field.children, data[field.key]);
        }
      } else if (field.type === 'array') {
        // Initialize array with sample data to show structure
        if (!(field.key in data)) {
          if (field.children && field.children.length > 0) {
            // Create one sample item to show the fields
            const sampleItem = createDefaultArrayItem(field.children);
            data[field.key] = [sampleItem];
          } else {
            data[field.key] = [];
          }
        } else if (Array.isArray(data[field.key])) {
          // If array exists but is empty and has children, add a sample item
          if (data[field.key].length === 0 && field.children && field.children.length > 0) {
            const sampleItem = createDefaultArrayItem(field.children);
            data[field.key] = [sampleItem];
          }
        }
      } else if (field.children) {
        // Process children for layout fields
        Object.assign(data, initializeNestedFormData(field.children, data));
      }
    });

    return data;
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
    return buildSchemaFromFields(fields);
  }, [fields]);

  const baseUiSchema = useMemo(() => {
    return {
      type: 'VerticalLayout',
      elements: buildUISchemaFromFields(fields),
    };
  }, [fields]);

  // Stable form state object
  const formState = useMemo(() => {
    return {
      schema: {
        type: 'object',
        properties: schemaData.properties,
        ...(schemaData.required && schemaData.required.length ? { required: schemaData.required } : {}),
      },
      uischema: baseUiSchema,
      data: formData,
    };
  }, [schemaData, baseUiSchema, formData]);

  // Notify consumer when schema or uischema changes
  useEffect(() => {
    if (typeof onSchemaChange === 'function') {
      onSchemaChange(formState.schema, formState.uischema);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState.schema, formState.uischema]);

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
    if (!fieldType.isLayout) {
      setPropertiesDrawerOpen(true);
    }
  }, []);

  const addFieldToLayout = useCallback(
    (parentId, index) => {
      const defaultFieldType =
        defaultFieldTypes.find((ft) => !ft.isLayout && ft.id !== 'array') || defaultFieldTypes[0];
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

  // Recursively update a field by id inside the nested fields tree
  const updateFieldById = (fieldsArray, updatedField) => {
    return fieldsArray.map((field) => {
      if (field.id === updatedField.id) {
        // Replace with updated field (shallow copy to avoid accidental refs)
        return { ...updatedField };
      }
      if (field.children && field.children.length > 0) {
        const newChildren = updateFieldById(field.children, updatedField);
        // Only create a new parent object if children changed
        const childrenChanged = newChildren !== field.children;
        return childrenChanged ? { ...field, children: newChildren } : field;
      }
      return field;
    });
  };

  const handleFieldUpdate = useCallback((updatedField) => {
    setFields((prev) => updateFieldById(prev, updatedField));
    setSelectedField(updatedField);
  }, []);

  const exportForm = () => {
    const exportData = {
      schema: formState.schema,
      uischema: formState.uischema,
      fields: fields,
    };

    if (typeof onExport === 'function') {
      onExport({ schema: exportData.schema, uiSchema: exportData.uischema });
      return;
    }

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'form-config.json');
    linkElement.click();
  };

  // Drag and Drop handlers
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);

    // Determine what is being dragged
    if (active.data.current?.type === 'palette-item') {
      // Dragging from palette
      const fieldType = defaultFieldTypes.find((ft) => ft.id === active.id);
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
      const fieldType = defaultFieldTypes.find((ft) => ft.id === active.id);
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

      // Find and remove the field from its current position
      const fieldToMove = removeFieldById(newFields, fieldId);
      if (!fieldToMove) return prevFields;

      // Insert field at new position
      if (targetParentId) {
        // Moving into a layout
        const parent = findFieldById(newFields, targetParentId);
        if (parent && (parent.isLayout || parent.type === 'array')) {
          if (!parent.children) parent.children = [];
          const insertIndex = Math.min(targetIndex, parent.children.length);
          parent.children.splice(insertIndex, 0, fieldToMove);
          fieldToMove.parentId = parent.id;
        }
      } else {
        // Moving to root level
        const insertIndex = Math.min(targetIndex, newFields.length);
        newFields.splice(insertIndex, 0, fieldToMove);
        fieldToMove.parentId = null;
      }

      return newFields;
    });
  };

  // Helper function to find field by ID
  const findFieldById = (fieldsArray, id) => {
    for (const field of fieldsArray) {
      if (field.id === id) return field;
      if (field.children) {
        const found = findFieldById(field.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Handle reordering of fields in structure
  const handleReorderFields = (activeId, overId, overData) => {
    setFields((prevFields) => {
      const newFields = [...prevFields];

      // Find the active and over items
      const activeField = findFieldById(newFields, activeId);
      const overField = findFieldById(newFields, overId);

      if (!activeField || !overField) return prevFields;

      // Remove active field from its current position
      removeFieldById(newFields, activeId);

      // Insert active field at new position
      insertFieldAfter(newFields, activeField, overId, overData);

      return newFields;
    });
  };

  // Helper to remove field by ID from nested structure
  const removeFieldById = (fieldsArray, id) => {
    for (let i = 0; i < fieldsArray.length; i++) {
      if (fieldsArray[i].id === id) {
        return fieldsArray.splice(i, 1)[0];
      }
      if (fieldsArray[i].children) {
        const removed = removeFieldById(fieldsArray[i].children, id);
        if (removed) return removed;
      }
    }
    return null;
  };

  // Helper to insert field after another field
  const insertFieldAfter = (fieldsArray, fieldToInsert, afterId, overData) => {
    // If dropping into a layout, add to its children
    if (overData?.parentId) {
      const parent = findFieldById(fieldsArray, overData.parentId);
      if (parent && (parent.isLayout || parent.type === 'array')) {
        if (!parent.children) parent.children = [];
        const insertIndex = overData.index !== undefined ? overData.index : parent.children.length;
        parent.children.splice(insertIndex, 0, fieldToInsert);
        fieldToInsert.parentId = parent.id;
        return true;
      }
    }

    // Otherwise, insert at root level
    for (let i = 0; i < fieldsArray.length; i++) {
      if (fieldsArray[i].id === afterId) {
        fieldsArray.splice(i + 1, 0, fieldToInsert);
        fieldToInsert.parentId = null;
        return true;
      }
      if (fieldsArray[i].children) {
        if (insertFieldAfter(fieldsArray[i].children, fieldToInsert, afterId, overData)) {
          return true;
        }
      }
    }
    return false;
  };

  // Custom collision detection for better drop zone targeting
  const customCollisionDetection = (args) => {
    const { active, droppableContainers } = args;

    // For palette items, use closest center
    if (active.data.current?.type === 'palette-item') {
      return closestCenter(args);
    }

    // For structure items, prioritize drop zones
    const dropZones = Array.from(droppableContainers.values()).filter((container) =>
      container.id.includes('drop-')
    );

    if (dropZones.length > 0) {
      const dropZoneCollisions = rectIntersection({
        ...args,
        droppableContainers: new Map(dropZones.map((zone) => [zone.id, zone])),
      });

      if (dropZoneCollisions && dropZoneCollisions.length > 0) {
        return dropZoneCollisions;
      }
    }

    // Fallback to closest center for other items
    return closestCenter(args);
  };

  // Helper to collect all field IDs recursively for SortableContext
  const getAllFieldIds = (fieldsArray) => {
    const ids = [];
    fieldsArray.forEach((field) => {
      ids.push(field.id);
      if (field.children) {
        ids.push(...getAllFieldIds(field.children));
      }
    });
    return ids;
  };

  // Schema loading functionality
  // Map schema property to field type
  const mapSchemaPropertyToFieldType = useCallback((property) => {
    const { type, enum: enumValues, format } = property;

    if (enumValues && enumValues.length > 0) {
      if (enumValues.length <= 3) {
        return defaultFieldTypes.find((ft) => ft.id === 'radio') || defaultFieldTypes[0];
      } else {
        return defaultFieldTypes.find((ft) => ft.id === 'select') || defaultFieldTypes[0];
      }
    }

    switch (type) {
      case 'string':
        if (format === 'email') {
          return defaultFieldTypes.find((ft) => ft.id === 'email') || defaultFieldTypes[0];
        }
        if (format === 'date') {
          return defaultFieldTypes.find((ft) => ft.id === 'date') || defaultFieldTypes[0];
        }
        if (property.maxLength && property.maxLength > 100) {
          return defaultFieldTypes.find((ft) => ft.id === 'textarea') || defaultFieldTypes[0];
        }
        return defaultFieldTypes.find((ft) => ft.id === 'text') || defaultFieldTypes[0];
      case 'number':
      case 'integer':
        return defaultFieldTypes.find((ft) => ft.id === 'number') || defaultFieldTypes[0];
      case 'boolean':
        return defaultFieldTypes.find((ft) => ft.id === 'checkbox') || defaultFieldTypes[0];
      default:
        return defaultFieldTypes.find((ft) => ft.id === 'text') || defaultFieldTypes[0];
    }
  }, []);

  // Convert schema to fields format (recursive)
  const convertSchemaToFields = useCallback(
    (schema) => {
      if (!schema || !schema.properties) return [];

      const fields = [];

      Object.entries(schema.properties).forEach(([key, property]) => {
        fieldCounter.current += 1;
        const uniqueId = fieldCounter.current;

        const label =
          property.title || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');

        if (property.type === 'object' && property.properties) {
          const objectType =
            defaultFieldTypes.find((ft) => ft.id === 'object') || defaultFieldTypes[0];
          let children = convertSchemaToFields(property);

          fieldCounter.current += 1;
          const layoutId = fieldCounter.current;
          const verticalLayout = {
            id: `field_${layoutId}`,
            type: 'vertical-layout',
            label: 'Vertical Layout',
            key: `layout_${layoutId}`,
            isLayout: true,
            schema: {},
            uischema: { type: 'VerticalLayout' },
            children: children.map((c) => ({
              ...c,
              parentId: `field_${layoutId}`,
            })),
            parentId: `field_${uniqueId}`,
          };

          const newField = {
            id: `field_${uniqueId}`,
            type: objectType.id,
            label,
            key,
            required: schema.required?.includes(key) || false,
            isLayout: true,
            schema: { ...objectType.schema, ...property },
            uischema: { ...objectType.uischema, label },
            children: [verticalLayout],
            parentId: null,
            icon: '',
          };

          fields.push(newField);
          return;
        }

        if (property.type === 'array' && property.items && property.items.type === 'object') {
          const arrayType =
            defaultFieldTypes.find((ft) => ft.id === 'array') || defaultFieldTypes[0];
          let children = convertSchemaToFields(property.items);
          children = children.map((c) => ({
            ...c,
            parentId: `field_${uniqueId}`,
          }));

          const newField = {
            id: `field_${uniqueId}`,
            type: arrayType.id,
            label,
            key,
            required: schema.required?.includes(key) || false,
            isLayout: false,
            schema: {},
            uischema: { ...arrayType.uischema, scope: `#/properties/${key}` },
            children,
            parentId: null,
          };

          newField.schema.type = 'array';
          if (property.title) newField.schema.title = property.title;
          if (property.items) newField.schema.items = property.items;
          if (property.minItems) newField.schema.minItems = property.minItems;
          if (property.maxItems) newField.schema.maxItems = property.maxItems;
          if (property.uniqueItems) newField.schema.uniqueItems = property.uniqueItems;
          if (property.tableView) newField.schema.tableView = property.tableView;

          fields.push(newField);
          return;
        }

        if (property.type === 'array' && property.items && property.items.enum) {
          const fieldType = mapSchemaPropertyToFieldType(property);
          const newField = {
            id: `field_${uniqueId}`,
            type: fieldType.id,
            label,
            key,
            required: schema.required?.includes(key) || false,
            isLayout: false,
            schema: { ...property },
            uischema: {
              ...fieldType.uischema,
              scope: `#/properties/${key}`,
              options: {
                ...fieldType.uischema.options,
                multi: true,
                format: 'dynamicselect',
              },
            },
            parentId: null,
          };

          fields.push(newField);
          return;
        }

        const fieldType = mapSchemaPropertyToFieldType(property);
        const newField = {
          id: `field_${uniqueId}`,
          type: fieldType.id,
          label,
          key,
          required: schema.required?.includes(key) || false,
          isLayout: fieldType.isLayout || false,
          schema: { ...fieldType.schema, ...property },
          uischema: { ...fieldType.uischema, scope: `#/properties/${key}` },
          parentId: null,
        };

        if (property.enum) {
          newField.schema.enum = property.enum;
        }

        fields.push(newField);
      });

      return fields;
    },
    [mapSchemaPropertyToFieldType]
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
          <Box
            sx={{
              width: '100vw',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[200]} 100%)`,
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'primary.contrastText',
                p: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: 4,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconHammer size={28} />
                <Typography
                  variant="h5"
                  sx={{
                    margin: 0,
                    fontSize: { xs: '20px', sm: '28px' },
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Form Builder
                </Typography>
              </Box>
            </Box>

            {/* Main Content */}
            <Box
              sx={{
                display: 'flex',
                flex: 1,
                overflow: 'hidden',
                flexDirection: { xs: 'column', md: 'row' },
              }}
            >
              {/* Left Sidebar - Field Palette */}
              <Box
                sx={{
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
                }}
              >
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
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'auto',
                  minHeight: { xs: '60vh', md: 'auto' },
                }}
              >
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
                  />
                )}

                {/* Content Area - Either Form Structure or Form Preview */}
                {!showSchemaEditor && (
                  <div
                    style={{
                      flex: 1,
                      overflow: 'auto',
                    }}
                  >
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
                  </div>
                )}
              </Box>
            </Box>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeId && draggedItem ? (
                <Box
                  sx={{
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
                  }}
                >
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
            <Box
              sx={{
                position: 'fixed',
                right: 0,
                top: 0,
                width: { xs: '100vw', sm: '400px', md: '380px' },
                height: '100vh',
                background: 'white',
                boxShadow: '-4px 0 25px -5px rgb(0 0 0 / 0.1), -2px 0 10px -5px rgb(0 0 0 / 0.04)',
                zIndex: 1000,
                overflow: 'auto',
                borderLeft: 1,
                borderColor: 'grey.200',
              }}
            >
              <Box
                sx={{
                  p: 3,
                  borderBottom: 1,
                  borderColor: 'grey.200',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'grey.50',
                }}
              >
                <Typography variant="h6" sx={{ margin: 0, fontWeight: 600, color: 'grey.800' }}>
                  {formTitle}
                </Typography>
                <Button
                  onClick={() => setPropertiesDrawerOpen(false)}
                  size="small"
                  sx={{
                    minWidth: 'auto',
                    p: 1,
                    borderRadius: 1.5,
                    color: 'grey.500',
                    '&:hover': {
                      backgroundColor: 'grey.200',
                      color: 'grey.600',
                    },
                  }}
                >
                  <IconX size={20} />
                </Button>
              </Box>
              <Box sx={{ p: 3 }}>
                <FieldProperties field={selectedField} onFieldUpdate={handleFieldUpdate} />
              </Box>
            </Box>
          )}
        </SortableContext>
      </DndContext>
    </ThemeProvider>
  );
};

export default App;
