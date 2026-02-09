import { createAjv } from '@jsonforms/core';
import { JsonForms } from '@jsonforms/react';
import { IconEye } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Typography, Button, Box } from '@mui/material';
import { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';

import CommonHeader from './CommonHeader';
import { DeviceToolbar, DEVICE_PRESETS } from './DeviceToolbar';
import { getRenderers, getCells, config } from '../controls/renders';

let MAX_WIDTH_BEFORE_SCALE = 1376;

const FormResponsivePreview = ({ isFullscreen, setIsFullscreen, children }) => {
  const [deviceId, setDeviceId] = useState('responsive');
  // const [orientation, setOrientation] = useState('portrait');
  const preset = useMemo(
    () => DEVICE_PRESETS.find((d) => d.id === deviceId) ?? DEVICE_PRESETS[0],
    [deviceId]
  );

  const [size, setSize] = useState({ width: preset.width, height: preset.height });

  // keep size in sync when device changes
  useEffect(() => {
    setSize({ width: preset.width, height: preset.height });
  }, [preset]);

  const toggleOrientation = () => {
    setSize((s) => ({ width: s.height, height: s.width }));
  };

  const deviceWidth = size.width;
  const deviceHeight = size.height;

  const viewportRef = useRef(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    if (!viewportRef.current) return;

    const { clientWidth, clientHeight } = viewportRef.current;
    MAX_WIDTH_BEFORE_SCALE = clientWidth;

    if (deviceWidth <= MAX_WIDTH_BEFORE_SCALE) {
      setScale(1);
      return;
    }
    const scaleToFit = Math.min(clientWidth / deviceWidth, clientHeight / deviceHeight);

    setScale(Math.min(1, scaleToFit));
  }, [deviceWidth, deviceHeight]);

  const outerSx = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    p: 2,
    height: 650,
  };

  const viewportSx = {
    width: '100%',
    height: '100%',
    display: 'flex',
    borderRadius: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'transparent',
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

  const deviceFrameSx = {
    width: deviceWidth,
    height: deviceHeight,
    maxWidth: '100%',
    maxHeight: '100%',
    border: '1px solid #999',
    borderRadius: 2,
    overflow: 'hidden',
    ...(deviceWidth <= 400 && mobileContainerSx),
    ...(deviceWidth <= 768 && deviceWidth > 400 && tabletContainerSX),
  };

  const innerSx = {
    width: '100%',
    height: '100%',
    padding: '20px',
    overflowY: 'auto',
    transform: `scale(${scale})`,
    transformOrigin: 'top',
  };

  return (
    <Box sx={outerSx}>
      <DeviceToolbar
        selectedId={deviceId}
        onChangeDevice={setDeviceId}
        width={deviceWidth}
        height={deviceHeight}
        onChangeSize={setSize}
        onToggleOrientation={toggleOrientation}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
      />
      <Box sx={viewportSx} ref={viewportRef}>
        <Box sx={deviceFrameSx}>
          <Box sx={innerSx}>{children}</Box>
        </Box>
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
  const ajv = useMemo(() => {
    const ajvInstance = createAjv({ useDefaults: false });
    if (!ajvInstance.getKeyword('formatMinimum')) {
      ajvInstance.addKeyword({
        keyword: 'formatMinimum',
        type: 'string',
        schemaType: 'string',
        validate: function validate(schema, data) {
          if (!data) return true;
          return new Date(data) >= new Date(schema);
        },
      });
    }
    if (!ajvInstance.getKeyword('formatMaximum')) {
      ajvInstance.addKeyword({
        keyword: 'formatMaximum',
        type: 'string',
        schemaType: 'string',
        validate: function validate(schema, data) {
          if (!data) return true;
          return new Date(data) <= new Date(schema);
        },
      });
    }
    return ajvInstance;
  }, []);

  const [key, setKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const validateBox = {
    px: 3,
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    display: 'flex',
    position: 'fixed',
    alignItems: 'center',
    borderTop: '1px solid',
    borderColor: 'grey.200',
    justifyContent: 'flex-end',
    backgroundColor: 'background.paper',
    zIndex: (theme) => theme.zIndex.drawer + 1,
  };

  const headerSx = {
    top: 0,
    position: 'sticky',
    overflow: 'hidden',
    height: isFullscreen ? 0 : 'auto',
    backgroundColor: 'background.paper',
    transition: 'height 0.3s ease-in-out',
    zIndex: (theme) => theme.zIndex.appBar - 1,
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
      case 'formatMinimum':
      case 'formatMaximum':
        // For datetime fields, show time range in error message
        if (error.schemaPath) {
          const fieldKey = error.instancePath.replace(/^\//, '');
          const fieldSchema = formState.schema?.properties?.[fieldKey];

          if (fieldSchema?.format === 'date-time' || fieldSchema?.format === 'datetime') {
            const minDate = fieldSchema.formatMinimum || fieldSchema.minimum;
            const maxDate = fieldSchema.formatMaximum || fieldSchema.maximum;

            if (minDate && maxDate) {
              const minTime = new Date(minDate).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });
              const maxTime = new Date(maxDate).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });
              return `Time must be between ${minTime} and ${maxTime}`;
            } else if (minDate) {
              const minTime = new Date(minDate).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });
              return `Time must be after ${minTime}`;
            } else if (maxDate) {
              const maxTime = new Date(maxDate).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });
              return `Time must be before ${maxTime}`;
            }
          }
        }
        return 'validation.minimum';
      default:
        return 'validation.generic';
    }
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

      // Deduplicate datetime errors - keep only one error per field for formatMinimum/formatMaximum
      const deduplicatedErrors = [];
      const datetimeErrorFields = new Set();

      filteredErrors.forEach((error) => {
        if (error.keyword === 'formatMinimum' || error.keyword === 'formatMaximum') {
          const fieldKey = error.instancePath;
          if (!datetimeErrorFields.has(fieldKey)) {
            datetimeErrorFields.add(fieldKey);
            deduplicatedErrors.push(error);
          }
        } else {
          deduplicatedErrors.push(error);
        }
      });

      allErrors = [...deduplicatedErrors];
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
    <Box>
      <Box sx={headerSx}>
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
      </Box>
      <Box sx={{ p: 2, paddingBottom: '80px' }}>
        {formState.schema.properties && Object.keys(formState.schema.properties).length > 0 ? (
          <div ref={formRef}>
            <FormResponsivePreview isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen}>
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
