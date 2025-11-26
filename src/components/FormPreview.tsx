import React from 'react';
import { JsonForms } from '@jsonforms/react';
import {
  materialRenderers,
  materialCells,
} from '@jsonforms/material-renderers';
import { FormState } from '../types';
import { Typography, Box } from '@mui/material';

interface FormPreviewProps {
  formState: FormState;
  onDataChange: (data: any) => void;
}

const FormPreview: React.FC<FormPreviewProps> = ({
  formState,
  onDataChange,
}) => {
  return (
    <Box>
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" gutterBottom>
          Form Preview
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Test and interact with your form
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {formState.schema.properties &&
        Object.keys(formState.schema.properties).length > 0 ? (
          <JsonForms
            schema={formState.schema}
            uischema={formState.uischema}
            data={formState.data}
            renderers={materialRenderers}
            cells={materialCells}
            onChange={({ data }) => onDataChange(data)}
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
