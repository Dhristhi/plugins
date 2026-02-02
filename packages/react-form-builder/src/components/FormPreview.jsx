import { createAjv } from '@jsonforms/core';
import { JsonForms } from '@jsonforms/react';
import { IconEye } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useState, useMemo, useRef } from 'react';
import { Typography, Button, Box, Tooltip, IconButton } from '@mui/material';

import CommonHeader from './CommonHeader';
import { getRenderers, getCells, config } from '../controls/renders';
import { IconDeviceDesktop, IconDeviceTablet, IconDeviceMobile } from '@tabler/icons-react';

const getPreviewModes = (t) => ({
  desktop: { width: 1200, label: t('desktop'), icon: <IconDeviceDesktop /> },
  tablet: { width: 768, label: t('tablet'), icon: <IconDeviceTablet /> },
  mobile: { width: 375, label: t('mobile'), icon: <IconDeviceMobile /> },
});

const FormResponsivePreview = ({ mode, children, previewModes }) => {
  const { width } = previewModes[mode];
  const responsiveParentSx = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    p: 2,
    height: 650,
  };
  const mobileContainerSx = {
    '& .MuiGrid-item, & .MuiGrid2-root': {
      maxWidth: '100%',
      flexBasis: '100%',
    },
    '& .MuiTable-root td[style*="text-align: center"]': {
      width: 'auto !important',
      height: 'auto !important',
    },
    '& .MuiTable-root .MuiIconButton-root.MuiIconButton-sizeLarge': {
      padding: '4px',
      fontSize: '1.2rem',
    },

    '& .MuiTable-root .MuiSvgIcon-root': {
      fontSize: '1.2rem',
    },
    '& .MuiTable-root td[style*="text-align: center"] .MuiGrid-root': {
      display: 'flex',
      flexDirection: 'row',
      columnGap: '8px',
      flexWrap: 'nowrap',
    },
    '& .MuiStack-root .MuiGrid-container': {
      alignItems: 'flex-start',
    },
  };
  const tabletContainerSX = {
    '& .MuiGrid-item, & .MuiGrid2-root': {
      maxWidth: '100%',
      flexBasis: '100%',
    },
    '& .MuiTable-root .MuiIconButton-root.MuiIconButton-sizeLarge': {
      padding: '4px',
      fontSize: '1.2rem',
    },

    '& .MuiTable-root .MuiSvgIcon-root': {
      fontSize: '1.2rem',
    },
    '& .MuiTable-root td[style*="text-align: center"] .MuiGrid-root': {
      display: 'flex',
      flexDirection: 'row',
      columnGap: '8px',
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

  const { t, i18n } = useTranslation();

  const ajv = useMemo(() => createAjv({ useDefaults: false }), []);

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

  const translationFn = useMemo(
    () => (key, defaultMessage) => {
      if (!key) {
        return defaultMessage;
      }
      const result = t(key, defaultMessage ?? '');
      if (result === '' && defaultMessage === undefined) {
        return undefined;
      }
      return result;
    },
    [t]
  );

  const mapAjvErrorToKey = (error) => {
    switch (error.keyword) {
      case 'required':
        return 'validation.required';
      case 'format':
        // e.g. date, email, etc. – you can further branch on error.params.format
        return `validation.format.${error.params?.format || 'generic'}`;
      case 'pattern':
        return 'validation.pattern';
      case 'minLength':
        return 'validation.minLength';
      case 'maxLength':
        return 'validation.maxLength';
      case 'minimum':
        return 'validation.minimum';
      case 'maximum':
        return 'validation.maximum';
      default:
        return 'validation.generic';
    }
  };

  const previewModes = useMemo(() => getPreviewModes(t), [t]);
  const [mode, setMode] = useState('desktop');
  const toolBarSx = { display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' };
  const PreviewToolbar = ({ mode }) => {
    return (
      <Box sx={toolBarSx}>
        {Object.entries(previewModes).map(([key, cfg]) => (
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
            keyword: 'passwordMismatch',
            params: { passwordKey, confirmKey: key },
            message: 'validation.passwordMismatch',
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
        message: mapAjvErrorToKey(error),
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
        title={t('formPreview')}
        description={t('testYourForm')}
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
            <FormResponsivePreview mode={mode} previewModes={previewModes}>
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
                i18n={{
                  locale: i18n.resolvedLanguage || i18n.language,
                  translate: translationFn,
                }}
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
            {t('noFieldsAdded')}
          </Typography>
        )}
      </Box>
      {formState.schema.properties && Object.keys(formState.schema.properties).length > 0 && (
        <Box sx={validateBox}>
          <Button onClick={toggleValidateButton} variant="contained">
            {t('validate')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FormPreview;
