import { useState, useCallback, useRef } from 'react';
import { IconUpload, IconFile } from '@tabler/icons-react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { and, isControl, optionIs, rankWith } from '@jsonforms/core';
import { Box, Typography, Alert, FormHelperText } from '@mui/material';

const CustomFileUploadControl = (props) => {
  const { data, handleChange, path, errors, uischema, schema, label } = props;

  const [localError, setLocalError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const isReadOnly = uischema?.options?.readonly || false;
  const maxFileSize = uischema?.options?.['ui:options']?.maxSize;
  const acceptedFileTypes = uischema?.options?.['ui:options']?.accept;

  // Helper function to check if the data URL represents an image
  const isImageDataUrl = (dataUrl) => {
    if (!dataUrl || typeof dataUrl !== 'string') return false;
    return dataUrl.startsWith('data:image/');
  };

  function getAllowedMimes(acceptedFileTypes) {
    if (!acceptedFileTypes?.trim()) {
      return [];
    }

    return acceptedFileTypes
      .split(',')
      .map((mime) => mime.trim())
      .filter(Boolean);
  }

  function validateFile(file, allowedMimes, maxFileSizeMB) {
    if ((allowedMimes.length && !allowedMimes.includes(file.type)) || !file.type) {
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
      if (!file) {
        return;
      }

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
        // eslint-disable-next-line no-unused-vars
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
    if (!isReadOnly) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    if (!isReadOnly) {
      const file = event.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    }
  };

  const jsonFormsError = typeof errors === 'string' ? errors : '';
  const hasError = Boolean(jsonFormsError) || Boolean(localError);

  const hasFile = typeof data === 'string' && data.startsWith('data:');
  const isImage = hasFile && isImageDataUrl(data);

  // In read-only mode with an image, show a cleaner preview layout
  if (isReadOnly && isImage) {
    return (
      <Box sx={{ mb: 2 }}>
        {label && (
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            {label}
          </Typography>
        )}
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 2,
            backgroundColor: 'background.paper',
            textAlign: 'center',
          }}
        >
          <Box
            component="img"
            src={data}
            alt="Image preview"
            sx={{
              maxWidth: '100%',
              maxHeight: '300px',
              width: 'auto',
              height: 'auto',
              borderRadius: 1,
              objectFit: 'contain',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </Box>
        {schema?.description && (
          <FormHelperText sx={{ mt: 1, mx: 0 }}>{schema.description}</FormHelperText>
        )}
      </Box>
    );
  }

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
          cursor: isReadOnly ? 'not-allowed' : 'pointer',
          opacity: isReadOnly ? 0.6 : 1,
          transition: 'all 0.2s ease-in-out',
          '&:hover': !isReadOnly && {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          },
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isReadOnly && inputRef.current?.click()}
      >
        <input
          type="file"
          ref={inputRef}
          accept={acceptedFileTypes}
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
          disabled={isUploading || isReadOnly}
        />

        {hasFile ? (
          <Box>
            {isImageDataUrl(data) ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  component="img"
                  src={data}
                  alt="Uploaded image preview"
                  sx={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    width: 'auto',
                    height: 'auto',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    objectFit: 'contain',
                    '&:hover': {
                      cursor: isReadOnly ? 'default' : 'pointer',
                    },
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <Typography variant="body2" sx={{ color: 'success.main' }}>
                  Image uploaded successfully!
                </Typography>
              </Box>
            ) : (
              <Box>
                <IconFile size={32} color="currentColor" />
                <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                  File uploaded successfully!
                </Typography>
              </Box>
            )}
            {!isReadOnly && (
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1 }}>
                Click to change file
              </Typography>
            )}
          </Box>
        ) : (
          <Box>
            <IconUpload size={32} color="currentColor" />
            <Typography variant="body2" sx={{ mt: 1, color: 'text.primary' }}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Drag and drop or click to select
            </Typography>
            {acceptedFileTypes && (
              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                Accepted Formats: {acceptedFileTypes}
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
