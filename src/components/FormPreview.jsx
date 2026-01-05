import { createAjv } from "@jsonforms/core";
import { JsonForms } from "@jsonforms/react";
import { IconEye } from "@tabler/icons-react";
import { Typography, Box } from "@mui/material";

import { useState } from "react";
import CommonHeader from "./CommonHeader";
import { renderers, cells, config } from "../controls/renders";

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

  return (
    <Box>
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
        {formState.schema.properties &&
        Object.keys(formState.schema.properties).length > 0 ? (
          <JsonForms
            ajv={ajv}
            data={formState.data}
            cells={cells}
            config={config}
            renderers={renderers}
            schema={formState.schema}
            uischema={formState.uischema}
            validationMode={hasValidated ? "ValidateAndShow" : "NoValidation"}
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
    </Box>
  );
};

export default FormPreview;
