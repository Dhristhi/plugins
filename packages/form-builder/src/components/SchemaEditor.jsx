import { useState, useEffect } from 'react';
import { IconCode } from '@tabler/icons-react';
import { Typography, TextField, Button, Box } from '@mui/material';

import CommonHeader from './CommonHeader';

const SchemaEditor = ({
  formState,
  onFormStateChange,
  showFormPreview,
  setShowFormPreview,
  showSchemaEditor,
  setShowSchemaEditor,
  exportForm,
}) => {
  const [schemaText, setSchemaText] = useState('');
  const [uischemaText, setUischemaText] = useState('');
  const [error, setError] = useState(null);

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

  // Layout
  const rootContainerSx = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  const contentContainerSx = {
    p: 2,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  // Error box
  const errorBoxSx = {
    mb: 2,
    p: 2,
    bgcolor: 'error.light',
    borderRadius: 1,
  };

  // Editors layout
  const editorsRowSx = {
    flex: 1,
    mb: 2,
  };

  const editorColumnSx = {
    display: 'flex',
    flexDirection: 'column',
  };

  // Text editor
  const textEditorSx = {
    flex: 1,
    '& .MuiInputBase-root': {
      height: '100%',
      alignItems: 'flex-start',
    },
  };

  // Monospace editor font
  const editorInputStyle = {
    fontFamily: 'Monaco, Courier New, monospace',
    fontSize: '11px',
    lineHeight: '1.4',
  };

  return (
    <Box sx={rootContainerSx}>
      <CommonHeader
        title="Schema Editor"
        description="View and edit the JSON schema and UI schema"
        icon={IconCode}
        showFormPreview={showFormPreview}
        setShowFormPreview={setShowFormPreview}
        showSchemaEditor={showSchemaEditor}
        setShowSchemaEditor={setShowSchemaEditor}
        exportForm={exportForm}
      />

      <Box sx={contentContainerSx}>
        {error && (
          <Box sx={errorBoxSx}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Box>
        )}

        <Box display="flex" gap={2} sx={editorsRowSx}>
          <Box flex={1} sx={editorColumnSx}>
            <Typography variant="subtitle2" gutterBottom>
              JSON Schema
            </Typography>
            <TextField
              multiline
              fullWidth
              variant="outlined"
              value={schemaText}
              onChange={(e) => setSchemaText(e.target.value)}
              sx={textEditorSx}
              InputProps={{
                style: editorInputStyle,
              }}
            />
          </Box>

          <Box flex={1} sx={editorColumnSx}>
            <Typography variant="subtitle2" gutterBottom>
              UI Schema
            </Typography>
            <TextField
              multiline
              fullWidth
              variant="outlined"
              value={uischemaText}
              onChange={(e) => setUischemaText(e.target.value)}
              sx={textEditorSx}
              InputProps={{
                style: editorInputStyle,
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
