import { useState } from 'react';
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
  const ajv = createAjv({ useDefaults: true });

  const [hasValidated, setHasValidated] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const toggleValidateButton = () => {
    if (hasValidated) {
      setHasValidated(false);
    } else {
      setHasValidated(true);
    }
  };
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
        hasValidated={hasValidated}
        setHasValidated={setHasValidated}
      />

      <Box sx={{ p: 2 }}>
        {formState.schema.properties && Object.keys(formState.schema.properties).length > 0 ? (
          <JsonForms
            ajv={ajv}
            config={config}
            cells={getCells()}
            data={formState.data}
            renderers={getRenderers()}
            schema={formState.schema}
            uischema={formState.uischema}
            validationMode={hasValidated ? 'ValidateAndShow' : 'NoValidation'}
            additionalErrors={validationErrors}
            onChange={({ data }) => onDataChange(data)}
            // i18n={{
            //   locale: i18n.language,
            //   translate: (key, defaultMessage) => getTranslation(key, 'label', defaultMessage),
            // }}
          />
        ) : (
          <Typography variant="body2" color="textSecondary">
            No fields added yet. Start by adding fields from the palette.
          </Typography>
        )}
      </Box>
      {formState.schema.properties && Object.keys(formState.schema.properties).length > 0 && (
        <Box
          sx={{
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
          }}
        >
          <Button
            onClick={() => {
              toggleValidateButton();
            }}
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
