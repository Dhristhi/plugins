import { createAjv } from '@jsonforms/core';
import { JsonForms } from '@jsonforms/react';
import { IconEye } from '@tabler/icons-react';
import { useState, useMemo, useRef } from 'react';
import { Typography, Button, Box, Tooltip, IconButton } from '@mui/material';

import CommonHeader from './CommonHeader';
import { getRenderers, getCells, config } from '../controls/renders';
import { IconDeviceDesktop, IconDeviceTablet, IconDeviceMobile } from '@tabler/icons-react';

const PREVIEW_MODES = {
  desktop: { width: 1200, label: 'Desktop', icon: <IconDeviceDesktop /> },
  tablet: { width: 768, label: 'Tablet', icon: <IconDeviceTablet /> },
  mobile: { width: 375, label: 'Mobile', icon: <IconDeviceMobile /> },
};

const FormResponsivePreview = ({ mode, children }) => {
  const { width } = PREVIEW_MODES[mode];
  const responsiveParentSx = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    p: 2,
    height: 650,
  };
  const mobileContainerSx = {
    '& .MuiGrid-container, & .MuiGrid2-container': {
      flexDirection: 'column',
    },
    '& .MuiGrid-item, & .MuiGrid2-root': {
      maxWidth: '100%',
      flexBasis: '100%',
    },
  };
  const tabletContainerSX = {
    '& .MuiGrid-container, & .MuiGrid2-container': {
      display: 'grid',
      gap: '16px',
    },
    '& .MuiGrid-item, & .MuiGrid2-root': {
      maxWidth: '100%',
      flexBasis: 'auto',
    },
  };
  const responsiveContainerSx = {
    width,
    height: 600,
    maxWidth: '100%',
    border: 2,
    borderColor: 'grey.300',
    borderRadius: 2,
    overflow: 'hidden',
    contain: 'layout style size',
    ...(width <= 400 && mobileContainerSx),
    ...(width === 768 && tabletContainerSX),
  };

  const responsiveChildSx = { width: '100%', height: '100%', p: 2, overflowY: 'auto' };

  return (
    <Box sx={responsiveParentSx}>
      <Box sx={responsiveContainerSx}>
        <Box sx={responsiveChildSx}>{children}</Box>
      </Box>
    </Box>
  );
};

const FormPreview = ({
  formState,
  onDataChange,
  showFormPreview,
  setShowFormPreview,
  showSchemaEditor,
  setShowSchemaEditor,
  exportForm,
}) => {
  const formRef = useRef();
  const userActions = useRef(false);
  const isProgrammaticUpdateRef = useRef(false);

  const ajv = useMemo(() => createAjv({ useDefaults: false, strictSchema: false }), []);

  const [key, setKey] = useState(0); // Force re-render
  const [hasValidated, setHasValidated] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
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

  const [mode, setMode] = useState('desktop');
  const toolBarSx = { display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' };
  const PreviewToolbar = ({ mode }) => {
    return (
      <Box sx={toolBarSx}>
        {Object.entries(PREVIEW_MODES).map(([key, cfg]) => (
          <Tooltip key={key} title={cfg.label}>
            <IconButton onClick={() => setMode(key)} color={mode === key ? 'primary' : 'default'}>
              {cfg.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Box>
    );
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

  const filterErrors = (errors, data) => {
    const filteredErrors = [];

    // Handle required field errors
    const requiredErrors = errors.filter((err) => err.keyword === 'required');
    requiredErrors.forEach((error) => {
      const fieldKey = error.params?.missingProperty;
      if (fieldKey) {
        const fieldValue = data[fieldKey];
        const hasContent = hasFieldContent(fieldValue);

        if (!hasContent) {
          // Create error with correct instancePath for the field
          filteredErrors.push({
            ...error,
          });
        }
      }
    });

    // Handle field-specific validation errors (format, pattern, etc.)
    const fieldErrors = errors.filter((err) => err.keyword !== 'required');
    fieldErrors.forEach((error) => {
      const fieldPath = error.instancePath || '';
      const fieldKey = fieldPath.replace(/^\//, '');

      if (fieldKey) {
        const fieldValue = data[fieldKey];
        const hasContent = hasFieldContent(fieldValue);

        // Only show validation errors if field has content
        if (hasContent) {
          filteredErrors.push(error);
        }
      }
    });

    return filteredErrors;
  };

  const validatePasswordConfirmation = (data, schema) => {
    const errors = [];

    Object.keys(schema.properties || {}).forEach((key) => {
      if (key.endsWith('_confirm')) {
        const passwordKey = key.replace('_confirm', '');
        const password = data[passwordKey];
        const confirmPassword = data[key];

        if (password && confirmPassword && password !== confirmPassword) {
          errors.push({
            instancePath: `/${key}`,
            schemaPath: `#/properties/${key}`,
            keyword: 'const',
            params: { allowedValue: password },
            message: 'Passwords do not match',
            data: confirmPassword,
          });
        }
      }
    });

    return errors;
  };

  const performValidation = (data = formState.data) => {
    // Create validation data where empty strings become undefined for required validation
    const validationData = { ...data };
    Object.keys(validationData).forEach((key) => {
      if (
        validationData[key] === '' ||
        validationData[key] === null ||
        (Array.isArray(validationData[key]) && validationData[key].length === 0) ||
        validationData[key] === false
      ) {
        delete validationData[key];
      }
    });

    const validate = ajv.compile(formState.schema);
    const isValid = validate(validationData);
    let allErrors = [];

    if (!isValid && validate.errors) {
      const transformedErrors = validate.errors.map((error) => ({
        instancePath: error.instancePath || error.dataPath || '',
        schemaPath: error.schemaPath,
        keyword: error.keyword,
        params: error.params,
        message: error.message,
        data: error.data,
      }));

      const filteredErrors = filterErrors(transformedErrors, data);
      allErrors = [...filteredErrors];
    }

    // Add password confirmation validation
    const passwordErrors = validatePasswordConfirmation(data, formState.schema);
    allErrors = [...allErrors, ...passwordErrors];

    setValidationErrors(allErrors);
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
            <PreviewToolbar mode={mode} />
            <FormResponsivePreview mode={mode}>
              <JsonForms
                key={key} // Force re-render when validation state changes
                ajv={ajv}
                config={{
                  ...config,
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
              />
            </FormResponsivePreview>
          </div>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No fields added yet. Start by adding fields from the palette.
          </Typography>
        )}
      </Box>
      {formState.schema.properties && Object.keys(formState.schema.properties).length > 0 && (
        <Box sx={validateBox}>
          <Button onClick={toggleValidateButton} variant="contained">
            Validate
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FormPreview;
