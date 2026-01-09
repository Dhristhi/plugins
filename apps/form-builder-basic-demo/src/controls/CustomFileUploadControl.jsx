import { useState, useCallback, useRef } from 'react';
import { Box, Typography, Alert, FormHelperText } from '@mui/material';
import { IconUpload, IconFile } from '@tabler/icons-react';
import { and, isControl, optionIs, rankWith } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { useTranslation } from 'react-i18next';

const CustomFileUploadControl = (props) => {
  const { t } = useTranslation();

  const { data, handleChange, path, errors, uischema, schema, label } = props;

  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Accept images by default; allow override via uischema.options.accept
  const acceptedFileTypes = uischema?.options?.["ui:options"]?.accept;
  const maxFileSize = uischema?.options?.["ui:options"]?.maxSize;

  function getAllowedMimes(acceptedFileTypes) {
    if (!acceptedFileTypes?.trim()) return []

    return acceptedFileTypes
      .split(',')
      .map((mime) => mime.trim())
      .filter(Boolean);
  }

  function validateFile(file, allowedMimes, maxFileSizeMB) {
    if (allowedMimes.length && !allowedMimes.includes(file.type) || !file.type) {
      return `Selected file "${file.name}" is not an allowed file type.`;
    }
    const MB = 1024 * 1024;
    if (file.size > maxFileSize * MB) {
      return `Selected file "${file.name}" exceeds the maximum size of ${maxFileSizeMB}MB.`;
    }

    return null;
  }

  const inputRef = useRef(null);

  const handleFileSelect = useCallback(
    async (file) => {
      if (!file) return;

      const allowedMimes = getAllowedMimes(acceptedFileTypes);
      const error = validateFile(file, allowedMimes, maxFileSize);

      if (error) {
        setLocalError(error);
        handleChange(path, null);
        return;
      }
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

  // JSON Forms provides `errors` as a string; use it directly
  const jsonFormsError = typeof errors === 'string' ? errors : '';
  const hasError = Boolean(jsonFormsError) || Boolean(localError);

  // Consider a data URL present if it starts with an image data prefix
  const hasFile = typeof data === 'string' && data.startsWith('data:');

  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
          {label}
        </Typography>
      )}
      <Box
        sx={{
          border: 2,
          borderRadius: 2,
          borderStyle: 'dashed',
          borderColor: hasError
            ? 'error.main'
            : hasFile
              ? 'success.main'
              : isDragOver
                ? 'primary.main'
                : 'grey.300',
          backgroundColor: isDragOver
            ? 'action.hover'
            : hasFile
              ? 'success.lighter'
              : 'background.paper',
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          },
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          disabled={isUploading}
        />

        {hasFile ? (
          <Box>
            <IconFile size={32} color="currentColor" />
            <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
              {t('common.file_uploaded_successfully')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t('common.click_to_change_file')}
            </Typography>
          </Box>
        ) : (
          <Box>
            <IconUpload size={32} color="currentColor" />
            <Typography variant="body2" sx={{ mt: 1, color: 'text.primary' }}>
              {isUploading ? t('common.uploading_logo') : t('common.upload_logo')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {/* Drag and drop or click to select */}
              {t('common.drag_and_drop')}
            </Typography>
            {acceptedFileTypes && (
              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                {t('common.accepted_formats')} {acceptedFileTypes}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {hasError && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {localError || jsonFormsError || 'Invalid file'}
        </Alert>
      )}
      {schema?.description && (
        <FormHelperText sx={{ mt: 1, mx: 0 }}>{schema.description}</FormHelperText>
      )}
    </Box>
  );
};

// Use when ui:widget is 'file'
export const customFileUploadTester = rankWith(10, and(isControl, optionIs('ui:widget', 'file')));

export default withJsonFormsControlProps(CustomFileUploadControl);
