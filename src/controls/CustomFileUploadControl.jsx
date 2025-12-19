import { useState, useCallback, useRef } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { IconUpload, IconFile } from '@tabler/icons-react';
import { rankWith, and, schemaMatches } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';

const CustomFileUploadControl = (props) => {
  const { data, handleChange, path, errors, uischema, label, visible, enabled } = props;

  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const acceptedFileTypes = uischema?.options?.accept || 'image/*';
  const inputRef = useRef(null);

  if (visible === false) return null;

  const handleFileSelect = useCallback(
    async (file) => {
      if (!file) return;

      setLocalError(null);
      setIsUploading(true);
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event?.target?.result;
          handleChange(path, dataUrl);
          setIsUploading(false);
        };
        reader.onerror = () => {
          setIsUploading(false);
          setLocalError('Failed to read the file.');
        };
        reader.readAsDataURL(file);
      } catch (e) {
        setIsUploading(false);
        setLocalError('Unexpected error while processing the file.');
      }
    },
    [handleChange, path]
  );

  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const jsonFormsError = typeof errors === 'string' ? errors : '';
  const hasError = Boolean(jsonFormsError) || Boolean(localError);
  const hasFile = typeof data === 'string' && data.startsWith('data:');

  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}
      
      <Box
        sx={{
          'border': 2,
          'borderRadius': 2,
          'borderStyle': 'dashed',
          'borderColor': hasError
            ? 'error.main'
            : hasFile
              ? 'success.main'
              : isDragOver
                ? 'primary.main'
                : 'grey.300',
          'backgroundColor': isDragOver
            ? 'action.hover'
            : hasFile
              ? 'success.lighter'
              : 'background.paper',
          'p': 3,
          'textAlign': 'center',
          'cursor': enabled ? 'pointer' : 'not-allowed',
          'transition': 'all 0.2s ease-in-out',
          '&:hover': enabled ? {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          } : {},
        }}
        onDragOver={enabled ? handleDragOver : undefined}
        onDragLeave={enabled ? handleDragLeave : undefined}
        onDrop={enabled ? handleDrop : undefined}
        onClick={enabled ? () => inputRef.current?.click() : undefined}
      >
        <input
          ref={inputRef}
          type='file'
          accept={acceptedFileTypes}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          disabled={!enabled || isUploading}
        />

        {hasFile ? (
          <Box>
            <IconFile size={32} color='currentColor' />
            <Typography variant='body2' sx={{ mt: 1, color: 'success.main' }}>
              File uploaded successfully
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              Click to change file
            </Typography>
          </Box>
        ) : (
          <Box>
            <IconUpload size={32} color='currentColor' />
            <Typography variant='body2' sx={{ mt: 1, color: 'text.primary' }}>
              {isUploading ? 'Uploading...' : 'Upload file'}
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              Drag and drop or click to select
            </Typography>
            {acceptedFileTypes && (
              <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary' }}>
                Accepted formats: {acceptedFileTypes}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {hasError && (
        <Alert severity='error' sx={{ mt: 1 }}>
          {localError || jsonFormsError || 'Invalid file'}
        </Alert>
      )}
    </Box>
  );
};

export const customFileUploadTester = rankWith(
  5,
  and(
    schemaMatches(
      (schema) => schema?.type === "string" && schema?.format === "data-url"
    )
  )
);

export default withJsonFormsControlProps(CustomFileUploadControl);
