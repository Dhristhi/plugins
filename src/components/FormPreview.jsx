import React, { useRef } from "react";
import { JsonForms, withJsonFormsControlProps } from "@jsonforms/react";
import {
  materialRenderers,
  materialCells,
} from "@jsonforms/material-renderers";
import { rankWith, and, schemaMatches } from "@jsonforms/core";
import { Typography, Box, Button } from "@mui/material";
import { IconEye, IconUpload } from "@tabler/icons-react";
import CommonHeader from "./CommonHeader";

const FileUploadControlBase = ({
  data,
  path,
  handleChange,
  label,
  visible,
  enabled,
  errors,
  required,
}) => {
  const inputRef = useRef(null);

  if (visible === false) return null;

  const onFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      handleChange(path, e.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
        {required ? " *" : ""}
      </Typography>

      <input
        type="file"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={onFileChange}
        disabled={!enabled}
      />

      <Button
        variant="outlined"
        fullWidth
        startIcon={<IconUpload size={18} />}
        onClick={() => inputRef.current?.click()}
        disabled={!enabled}
        sx={{
          justifyContent: "flex-start",
          borderStyle: "dashed",
          py: 1.5,
        }}
      >
        {data ? "Change file" : "Click to upload or drag file"}
      </Button>

      {data && (
        <Typography
          variant="caption"
          sx={{ mt: 0.5, display: "block" }}
          color="textSecondary"
        >
          File selected
        </Typography>
      )}

      {errors && (
        <Typography variant="caption" color="error">
          {errors}
        </Typography>
      )}
    </Box>
  );
};

// make it a JSON Forms control
const FileUploadControl = withJsonFormsControlProps(FileUploadControlBase);

// tester: use this when schema is string + data-url
const fileUploadTester = rankWith(
  5,
  and(
    schemaMatches(
      (schema) => schema?.type === "string" && schema?.format === "data-url"
    )
  )
);

// extend material renderers
const renderersWithFile = [
  ...materialRenderers,
  { tester: fileUploadTester, renderer: FileUploadControl },
];

const FormPreview = ({
  formState,
  onDataChange,
  showFormPreview,
  setShowFormPreview,
  showSchemaEditor,
  setShowSchemaEditor,
  exportForm,
}) => {
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
            schema={formState.schema}
            uischema={formState.uischema}
            data={formState.data}
            renderers={renderersWithFile}
            cells={materialCells}
            onChange={({ data }) => onDataChange(data)}
            validationMode="ValidateAndHide"
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
