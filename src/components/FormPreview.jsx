import React, { useRef, useCallback, useMemo } from "react";
import { JsonForms } from "@jsonforms/react";
import {
  materialRenderers,
  materialCells,
} from "@jsonforms/material-renderers";
import { Typography, Box } from "@mui/material";
import { IconEye } from "@tabler/icons-react";
import CommonHeader from "./CommonHeader";
import { customRenderers } from "../controls/renderers";

// Combine material renderers with custom renderers
const renderersWithCustom = [...materialRenderers, ...customRenderers];

const FormPreview = ({
  formState,
  onDataChange,
  showFormPreview,
  setShowFormPreview,
  showSchemaEditor,
  setShowSchemaEditor,
  exportForm,
}) => {
  const lastDataRef = useRef(formState.data);

  const handleChange = useCallback(
    ({ data }) => {
      const lastDataStr = JSON.stringify(lastDataRef.current);
      const newDataStr = JSON.stringify(data);

      if (lastDataStr !== newDataStr) {
        lastDataRef.current = data;
        if (onDataChange) {
          onDataChange(data);
        }
      }
    },
    [onDataChange]
  );

  const schema = useMemo(() => formState.schema, [formState.schema]);
  const uischema = useMemo(() => formState.uischema, [formState.uischema]);
  const data = useMemo(() => formState.data, [formState.data]);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
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
      </Box>

      <Box
        sx={{
          p: 2,
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          minHeight: 0,
        }}
      >
        {schema.properties && Object.keys(schema.properties).length > 0 ? (
          <JsonForms
            schema={schema}
            uischema={uischema}
            data={data}
            renderers={renderersWithCustom}
            cells={materialCells}
            onChange={handleChange}
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
