import { useState, useEffect } from 'react';
import { IconCode } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Typography, TextField, Box } from '@mui/material';

import CommonHeader from './CommonHeader';

const SchemaEditor = ({
  formState,
  onFormStateChange,
  showFormPreview,
  setShowFormPreview,
  showSchemaEditor,
  setShowSchemaEditor,
  exportForm,
  onExport,
  toolbarVisibility = {},
}) => {
  const { t } = useTranslation();
  const [schemaText, setSchemaText] = useState('');
  const [uischemaText, setUischemaText] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    setSchemaText(JSON.stringify(formState.schema, null, 2));
    setUischemaText(JSON.stringify(formState.uischema, null, 2));
  }, [formState]);

  const handleExport = () => {
    try {
      const newSchema = JSON.parse(schemaText);
      const newUischema = JSON.parse(uischemaText);

      onFormStateChange({
        ...formState,
        schema: newSchema,
        uischema: newUischema,
      });

      if (onExport) {
        onExport(newSchema, newUischema);
      }

      setError(null);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError(t('invalidJson'));
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
        title={t('schemaEditor')}
        description={t('viewEditSchema')}
        icon={IconCode}
        showFormPreview={showFormPreview}
        setShowFormPreview={setShowFormPreview}
        showSchemaEditor={showSchemaEditor}
        setShowSchemaEditor={setShowSchemaEditor}
        exportForm={exportForm}
        onApplyChanges={handleExport}
        showApplyButton={true}
        toolbarVisibility={toolbarVisibility}
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
              {t('jsonSchema')}
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
              {t('uiSchema')}
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
      </Box>
    </Box>
  );
};

export default SchemaEditor;
