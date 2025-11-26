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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" gutterBottom>
          Schema Editor
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Edit the JSON schemas directly and click Apply to see changes
        </Typography>
      </Box>

      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {error && (
          <Box sx={{ mb: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Box>
        )}

        <Box display="flex" gap={2} sx={{ flex: 1, mb: 2 }}>
          <Box flex={1} sx={{ display: 'flex', flexDirection: 'column' }}>
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
                flex: 1,
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

          <Box flex={1} sx={{ display: 'flex', flexDirection: 'column' }}>
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
                flex: 1,
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

        <Box display="flex" gap={2} alignItems="center">
          <Button variant="contained" onClick={handleApply}>
            Apply Changes
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SchemaEditor;
