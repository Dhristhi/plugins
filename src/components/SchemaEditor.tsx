import React, { useState, useEffect } from 'react';
import { FormState } from '../types';
import { Typography, TextField, Button, Box } from '@mui/material';

interface SchemaEditorProps {
  formState: FormState;
  onFormStateChange: (formState: FormState) => void;
}

const SchemaEditor: React.FC<SchemaEditorProps> = ({
  formState,
  onFormStateChange,
}) => {
  const [schemaText, setSchemaText] = useState('');
  const [uischemaText, setUischemaText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSchemaText(JSON.stringify(formState.schema, null, 2));
    setUischemaText(JSON.stringify(formState.uischema, null, 2));
  }, [formState]);

  const handleApply = () => {
    try {
      const newSchema = JSON.parse(schemaText);
      const newUischema = JSON.parse(uischemaText);

      onFormStateChange({
        ...formState,
        schema: newSchema,
        uischema: newUischema,
      });

      setError(null);
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  return (
    <div className="schema-editor">
      <Box p={2} sx={{ height: '100%' }}>
        <Typography variant="h6" gutterBottom color="primary">
          📝 Schema Editor
        </Typography>

        {error && <div className="error-message">{error}</div>}

        <Box display="flex" gap={2} sx={{ height: 'calc(100% - 100px)' }}>
          <Box flex={1}>
            <Typography variant="subtitle2" gutterBottom>
              JSON Schema
            </Typography>
            <TextField
              multiline
              fullWidth
              variant="outlined"
              value={schemaText}
              onChange={(e) => setSchemaText(e.target.value)}
              sx={{
                height: '100%',
                '& .MuiInputBase-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                },
              }}
              InputProps={{
                style: {
                  fontFamily: 'Monaco, Courier New, monospace',
                  fontSize: '11px',
                  lineHeight: '1.4',
                },
              }}
            />
          </Box>

          <Box flex={1}>
            <Typography variant="subtitle2" gutterBottom>
              UI Schema
            </Typography>
            <TextField
              multiline
              fullWidth
              variant="outlined"
              value={uischemaText}
              onChange={(e) => setUischemaText(e.target.value)}
              sx={{
                height: '100%',
                '& .MuiInputBase-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                },
              }}
              InputProps={{
                style: {
                  fontFamily: 'Monaco, Courier New, monospace',
                  fontSize: '11px',
                  lineHeight: '1.4',
                },
              }}
            />
          </Box>
        </Box>

        <Box mt={2} display="flex" gap={2}>
          <Button variant="contained" onClick={handleApply}>
            Apply Changes
          </Button>
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ alignSelf: 'center' }}
          >
            Edit the JSON schemas directly and click Apply to see changes
          </Typography>
        </Box>
      </Box>
    </div>
  );
};

export default SchemaEditor;
