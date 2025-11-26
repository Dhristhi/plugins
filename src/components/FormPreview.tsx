import React from 'react';
import { JsonForms } from '@jsonforms/react';
import {
  materialRenderers,
  materialCells,
} from '@jsonforms/material-renderers';
import { FormState } from '../types';
import { Typography, Paper } from '@mui/material';

interface FormPreviewProps {
  formState: FormState;
  onDataChange: (data: any) => void;
}

const FormPreview: React.FC<FormPreviewProps> = ({
  formState,
  onDataChange,
}) => {
  return (
    <div className="form-preview">
      <Typography variant="h6" gutterBottom>
        Form Preview
      </Typography>

      {formState.schema.properties &&
      Object.keys(formState.schema.properties).length > 0 ? (
        <Paper style={{ padding: '20px' }}>
          <JsonForms
            schema={formState.schema}
            uischema={formState.uischema}
            data={formState.data}
            renderers={materialRenderers}
            cells={materialCells}
            onChange={({ data }) => onDataChange(data)}
          />
        </Paper>
      ) : (
        <Paper style={{ padding: '40px', textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            Add fields to see the form preview
          </Typography>
        </Paper>
      )}
    </div>
  );
};

export default FormPreview;
