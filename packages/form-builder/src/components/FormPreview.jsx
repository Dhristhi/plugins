import { useState, useMemo, useRef } from 'react';
import { createAjv } from '@jsonforms/core';
import { JsonForms } from '@jsonforms/react';
import { IconEye, IconChecks } from '@tabler/icons-react';
import { Typography, Button, Box } from '@mui/material';

import CommonHeader from './CommonHeader';
import { getRenderers, getCells, config } from '../controls/renders';

const FormPreview = ({
  formState,
  onDataChange,
  showFormPreview,
  setShowFormPreview,
  showSchemaEditor,
  setShowSchemaEditor,
  exportForm,
}) => {
  //const ajv = createAjv({ useDefaults: true });
  const ajv = useMemo(() => createAjv({ useDefaults: 'empty' }), []);
  const formRef = useRef();

  const [hasValidated, setHasValidated] = useState(false);
  const [key, setKey] = useState(0); // Force re-render
  const [validationErrors, setValidationErrors] = useState([]);
  const isProgrammaticUpdateRef = useRef(false);
  const userActions = useRef(false);
  const validateBox = {
    position: 'fixed',
    bottom: 0,
    left: { xs: 0, md: 320 },
    width: { xs: '100%', md: `calc(100% - 320px)` },
    height: 64,
    backgroundColor: 'background.paper',
    borderTop: '1px solid',
    borderColor: 'grey.200',
    zIndex: (theme) => theme.zIndex.drawer + 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    px: 3,
  };

  const hasFieldContent = (value) => {
    if (value === undefined || value === null || value === '') {
      return false;
    }
    // For arrays (multiselect), check if it has items
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    // For boolean (checkbox), false is considered no content for required validation
    if (typeof value === 'boolean') {
      return value === true;
    }
    return true;
  };

  const getValueByPath = (obj, path) => {
    if (!path) return obj;
    const keys = path.replace(/^\//, '').split('/');
    let value = obj;
    for (const key of keys) {
      if (value === undefined || value === null) return undefined;
      value = value[key];
    }
    return value;
  };

  const filterErrors = (errors, data, schema) => {
    const filteredErrors = [];

    errors.forEach((error) => {
      if (error.keyword === 'required') {
        // Handle required errors for both root and nested fields
        filteredErrors.push(error);
      } else {
        // Handle other validation errors - only show if field has content
        const fieldPath = error.instancePath || '';
        if (fieldPath) {
          const fieldValue = getValueByPath(data, fieldPath);
          const hasContent = hasFieldContent(fieldValue);
          if (hasContent) {
            filteredErrors.push(error);
          }
        } else {
          filteredErrors.push(error);
        }
      }
    });

    return filteredErrors;
  };

  const cleanDataForValidation = (data) => {
    if (Array.isArray(data)) {
      return data.map(item => cleanDataForValidation(item));
    }
    
    if (data && typeof data === 'object') {
      const cleaned = {};
      Object.keys(data).forEach(key => {
        const value = data[key];
        
        if (value === '' || value === null || value === undefined) {
          return; // Remove empty values
        }
        
        if (Array.isArray(value)) {
          cleaned[key] = cleanDataForValidation(value);
        } else if (typeof value === 'object') {
          cleaned[key] = cleanDataForValidation(value);
        } else {
          cleaned[key] = value;
        }
      });
      return cleaned;
    }
    
    return data;
  };

  const performValidation = (data = formState.data) => {
    const cleanedData = cleanDataForValidation(data);
    
    const validate = ajv.compile(formState.schema);
    const isValid = validate(cleanedData);

    if (!isValid && validate.errors) {
      const transformedErrors = validate.errors.map((error) => ({
        instancePath: error.instancePath || error.dataPath || '',
        schemaPath: error.schemaPath,
        keyword: error.keyword,
        params: error.params,
        message: error.message,
        data: error.data,
      }));

      const filteredErrors = filterErrors(transformedErrors, data, formState.schema);
      setValidationErrors(filteredErrors);
    } else {
      setValidationErrors([]);
    }
  };

  const toggleValidateButton = () => {
    if (hasValidated) {
      setHasValidated(false);
      setValidationErrors([]);
    } else {
      performValidation();
      setHasValidated(true);
      setKey((prev) => prev + 1);
    }
  };

  const buildDefaultsFromSchema = () => {
    if (!formState.schema?.properties) return {};
    const data = {};
    isProgrammaticUpdateRef.current = true;
    Object.entries(formState.schema.properties).forEach(([key, prop]) => {
      if (
        prop.default !== undefined &&
        (formState.data[key] === '' ||
          formState.data[key] === undefined ||
          formState.data[key] === null ||
          formState.data[key]?.length === 0 ||
          prop.type === 'boolean' ||
          prop.type === 'number' ||
          (prop.type === 'string' &&
            (prop.format === 'date' || prop.format === 'date-time' || prop.format === 'datetime')))
      ) {
        formState.data[key] = prop.default;
      }
    });
    return data;
  };

  const dataWithDefaults = useMemo(() => {
    if (!userActions.current) {
      if (formState.data) {
        return {
          ...buildDefaultsFromSchema(),
          ...formState.data,
        };
      }
      return {
        ...buildDefaultsFromSchema(),
      };
    }
  }, [formState.schema, formState.data]);

  return (
    <Box sx={{ paddingBottom: '64px' }}>
      <CommonHeader
        title="Form Preview"
        description="Test your form and see how it will look to users"
        icon={IconEye}
        showFormPreview={showFormPreview}
        setShowFormPreview={setShowFormPreview}
        showSchemaEditor={showSchemaEditor}
        setShowSchemaEditor={setShowSchemaEditor}
        exportForm={exportForm}
      />
      <Box sx={{ p: 2 }}>
        {formState.schema.properties && Object.keys(formState.schema.properties).length > 0 ? (
          <div ref={formRef}>
            <JsonForms
              key={key} // Force re-render when validation state changes
              ajv={ajv}
              config={{
                ...config,
                showUnfocusedDescription: hasValidated,
                trim: false,
                hideRequiredAsterisk: false,
              }}
              cells={getCells()}
              data={dataWithDefaults ?? formState.data}
              renderers={getRenderers()}
              schema={formState.schema}
              uischema={formState.uischema}
              validationMode="NoValidation"
              additionalErrors={hasValidated ? validationErrors : []}
              onChange={({ data }) => {
                if (isProgrammaticUpdateRef.current) {
                  isProgrammaticUpdateRef.current = false;
                  return;
                }

                userActions.current = true;
                if (data) {
                  onDataChange(data);
                }
                // Perform real-time validation if validation mode is active
                if (hasValidated) {
                  performValidation(data);
                }
              }}
              // i18n={{
              //   locale: i18n.language,
              //   translate: (key, defaultMessage) => getTranslation(key, 'label', defaultMessage),
              // }}
            />
          </div>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No fields added yet. Start by adding fields from the palette.
          </Typography>
        )}
      </Box>
      {formState.schema.properties && Object.keys(formState.schema.properties).length > 0 && (
        <Box sx={validateBox}>
          <Button
            onClick={toggleValidateButton}
            variant="contained"
            startIcon={<IconChecks size={16} />}
          >
            Validate
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FormPreview;
