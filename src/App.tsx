import React, { useState, useCallback } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

import FormPreview from './components/FormPreview';
import FieldPalette from './components/FieldPalette';
import SchemaEditor from './components/SchemaEditor';
import LayoutManager from './components/LayoutManager';
import FieldProperties from './components/FieldProperties';
import SampleSchemaLoader from './components/SampleSchemaLoader';

import { FormField, FieldType, FormState, defaultFieldTypes } from './types';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

const App: React.FC = () => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [showSchemaEditor, setShowSchemaEditor] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [propertiesDrawerOpen, setPropertiesDrawerOpen] = useState(false);
  const [sampleSchemaLoaderOpen, setSampleSchemaLoaderOpen] = useState(false);

  // Use a counter to generate truly unique IDs that are StrictMode safe
  const fieldCounter = React.useRef(0);
  const pendingOperations = React.useRef(new Set<string>());

  // Generate form state from fields
  const buildSchemaFromFields = (fieldsArray: FormField[]): any => {
    const properties: any = {};

    fieldsArray.forEach((field) => {
      if (!field.isLayout) {
        properties[field.key] = {
          ...field.schema,
          title: field.label,
        };
      }
      // Recursively process children in layouts
      if (field.children) {
        const childSchema = buildSchemaFromFields(field.children);
        Object.assign(properties, childSchema.properties);
      }
    });

    return { properties };
  };

  const buildUISchemaFromFields = (fieldsArray: FormField[]): any[] => {
    return fieldsArray.map((field) => {
      if (field.isLayout) {
        return {
          ...field.uischema,
          label: field.label,
          elements: field.children
            ? buildUISchemaFromFields(field.children)
            : [],
        };
      } else {
        return {
          ...field.uischema,
          scope: `#/properties/${field.key}`,
          label: field.label,
        };
      }
    });
  };

  const getAllRequiredFields = (fieldsArray: FormField[]): string[] => {
    const required: string[] = [];
    fieldsArray.forEach((field) => {
      if (!field.isLayout && field.required) {
        required.push(field.key);
      }
      if (field.children) {
        required.push(...getAllRequiredFields(field.children));
      }
    });
    return required;
  };

  const schemaData = buildSchemaFromFields(fields);
  const formState: FormState = {
    schema: {
      type: 'object',
      properties: schemaData.properties,
      required: getAllRequiredFields(fields),
    },
    uischema: {
      type: 'VerticalLayout',
      elements: buildUISchemaFromFields(fields),
    },
    data: formData,
  };

  const addField = useCallback(
    (fieldType: FieldType, parentId?: string, index?: number) => {
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

      const fieldKey = fieldType.isLayout
        ? `layout_${uniqueId}`
        : `${fieldType.id}_${uniqueId}`;

      const newField: FormField = {
        id: `field_${uniqueId}`,
        type: fieldType.id,
        label: fieldType.isLayout
          ? fieldType.label
          : `${fieldType.label} Field`,
        key: fieldKey,
        required: false,
        schema: { ...fieldType.schema },
        uischema: { ...fieldType.uischema },
        isLayout: fieldType.isLayout,
        children: fieldType.isLayout ? [] : undefined,
        parentId: parentId,
      };
      setFields((prev) => {
        const newFields = [...prev];

        if (parentId) {
          // Add to specific parent layout
          const addToParent = (fieldsArray: FormField[]): boolean => {
            for (const field of fieldsArray) {
              if (field.id === parentId && field.isLayout) {
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
    },
    []
  );

  const addFieldToLayout = useCallback(
    (parentId: string, index?: number) => {
      const defaultFieldType =
        defaultFieldTypes.find((ft) => !ft.isLayout) || defaultFieldTypes[0];
      addField(defaultFieldType, parentId, index);
    },
    [addField]
  );

  const addLayoutToContainer = useCallback(
    (parentId: string, layoutType: FieldType, index?: number) => {
      addField(layoutType, parentId, index);
    },
    [addField]
  );

  const handleFieldSelect = useCallback(
    (fieldType: FieldType) => {
      addField(fieldType);
    },
    [addField]
  );

  const handleFieldUpdate = useCallback((updatedField: FormField) => {
    setFields((prev) =>
      prev.map((field) => (field.id === updatedField.id ? updatedField : field))
    );
    setSelectedField(updatedField);
  }, []);

  const handleImportSchema = useCallback((importedFields: FormField[]) => {
    setFields(importedFields);
    setSelectedField(null);
    setPropertiesDrawerOpen(false);

    // Reset form data to match new schema
    setFormData({});
  }, []);

  const exportForm = () => {
    const exportData = {
      schema: formState.schema,
      uischema: formState.uischema,
      fields: fields,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'form-config.json');
    linkElement.click();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#f5f5f5',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: '#2196f3',
            color: 'white',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '24px' }}>🔨 Form Builder</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowSchemaEditor(!showSchemaEditor)}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                background: showSchemaEditor ? '#ff9800' : 'white',
                color: showSchemaEditor ? 'white' : '#2196f3',
                border: '2px solid white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {showSchemaEditor ? '🔼 Hide' : '🔽 Show'} Schema Editor
            </button>
            <button
              onClick={() => setSampleSchemaLoaderOpen(true)}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                background: 'white',
                color: '#2196f3',
                border: '2px solid white',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              📋 Load Sample
            </button>
            <button
              onClick={exportForm}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                background: 'white',
                color: '#2196f3',
                border: '2px solid white',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              📥 Export
            </button>
          </div>
        </div>

        {/* Debug Status */}
        <div
          style={{
            background: showSchemaEditor ? '#4caf50' : '#f44336',
            color: 'white',
            padding: '8px 20px',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          🔍 Schema Editor: {showSchemaEditor ? 'VISIBLE' : 'HIDDEN'}
        </div>

        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {/* Left Sidebar - Field Palette Only */}
          <div
            style={{
              width: '280px',
              background: 'white',
              borderRight: '1px solid #e0e0e0',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
            }}
          >
            <FieldPalette onFieldSelect={handleFieldSelect} />
          </div>

          {/* Center Content - Form Preview and Schema Editor */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
              padding: '20px',
            }}
          >
            {/* Schema Editor */}
            {showSchemaEditor && (
              <div
                style={{
                  background: '#fff3e0',
                  border: '3px solid #ff9800',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  minHeight: '400px',
                }}
              >
                <div
                  style={{
                    background: '#ff9800',
                    color: 'white',
                    padding: '15px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    borderRadius: '5px 5px 0 0',
                  }}
                >
                  ✅ SCHEMA EDITOR IS NOW VISIBLE!
                </div>
                <SchemaEditor
                  formState={formState}
                  onFormStateChange={(newFormState) =>
                    setFormData(newFormState.data)
                  }
                />
              </div>
            )}

            {/* Form Preview */}
            <div
              style={{
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                flex: 1,
                minHeight: '400px',
              }}
            >
              <FormPreview formState={formState} onDataChange={setFormData} />
            </div>
          </div>

          {/* Right Sidebar - Form Structure */}
          <div
            style={{
              width: '320px',
              background: 'white',
              borderLeft: '1px solid #e0e0e0',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
            }}
          >
            <LayoutManager
              fields={fields}
              onFieldsChange={setFields}
              onFieldSelect={(field: FormField) => {
                setSelectedField(field);
                if (!field.isLayout) {
                  setPropertiesDrawerOpen(true);
                }
              }}
              selectedField={selectedField}
              onAddFieldToLayout={addFieldToLayout}
              onAddLayoutToContainer={addLayoutToContainer}
            />
          </div>
        </div>

        {/* Properties Panel (simplified) */}
        {propertiesDrawerOpen && selectedField && (
          <div
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              width: '350px',
              height: '100vh',
              background: 'white',
              boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
              zIndex: 1000,
              overflow: 'auto',
            }}
          >
            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3 style={{ margin: 0 }}>Field Properties</h3>
              <button
                onClick={() => setPropertiesDrawerOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <FieldProperties
                field={selectedField}
                onFieldUpdate={handleFieldUpdate}
              />
            </div>
          </div>
        )}

        {/* Sample Schema Loader Dialog */}
        <SampleSchemaLoader
          open={sampleSchemaLoaderOpen}
          onClose={() => setSampleSchemaLoaderOpen(false)}
          onImportSchema={handleImportSchema}
        />
      </div>
    </ThemeProvider>
  );
};

export default App;
