import React, { useState, useCallback } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

import FormPreview from './components/FormPreview';
import FieldPalette from './components/FieldPalette';
import SchemaEditor from './components/SchemaEditor';
import FormStructure from './components/FormStructure';
import FieldProperties from './components/FieldProperties';
import SampleSchemaLoader from './components/SampleSchemaLoader';

import {
  FormField,
  FieldType,
  FormState,
  generateFieldKey,
  defaultFieldTypes,
} from './types';

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

  // Generate form state from fields
  const formState: FormState = {
    schema: {
      type: 'object',
      properties: fields.reduce((acc, field) => {
        acc[field.key] = {
          ...field.schema,
          title: field.label,
        };
        return acc;
      }, {} as any),
      required: fields.filter((f) => f.required).map((f) => f.key),
    },
    uischema: {
      type: 'VerticalLayout',
      elements: fields.map((field) => ({
        ...field.uischema,
        scope: `#/properties/${field.key}`,
        label: field.label,
      })),
    },
    data: formData,
  };

  const addField = useCallback((fieldType: FieldType, index?: number) => {
    const fieldKey = generateFieldKey(fieldType.id);
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: fieldType.id,
      label: `${fieldType.label} Field`,
      key: fieldKey,
      required: false,
      schema: { ...fieldType.schema },
      uischema: { ...fieldType.uischema },
    };

    setFields((prev) => {
      const newFields = [...prev];
      if (typeof index === 'number') {
        newFields.splice(index, 0, newField);
      } else {
        newFields.push(newField);
      }
      return newFields;
    });

    setSelectedField(newField);
    setPropertiesDrawerOpen(true);
  }, []);

  const addFieldAtIndex = useCallback(
    (index?: number) => {
      const defaultFieldType = defaultFieldTypes[0];
      addField(defaultFieldType, index);
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
            <FormStructure
              fields={fields}
              onFieldsChange={setFields}
              onFieldSelect={(field: FormField) => {
                setSelectedField(field);
                setPropertiesDrawerOpen(true);
              }}
              selectedField={selectedField}
              onAddFieldClick={addFieldAtIndex}
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
