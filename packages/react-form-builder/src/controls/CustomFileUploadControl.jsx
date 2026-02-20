import { useTranslation } from 'react-i18next';
import { useState, useCallback, useRef } from 'react';
import { IconUpload, IconFile, IconX, IconDownload } from '@tabler/icons-react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { and, isControl, optionIs, rankWith } from '@jsonforms/core';
import { Box, Typography, Alert, FormHelperText, Link } from '@mui/material';

const CustomFileUploadControl = (props) => {
  const { data, handleChange, path, errors, uischema, schema, label, visible, enabled, required } =
    props;

  const { t } = useTranslation();
  const [localError, setLocalError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const isReadOnly = uischema?.options?.readonly || false;
  const maxFileSize = uischema?.options?.['ui:options']?.maxSize;
  const acceptedFileTypes = uischema?.options?.['ui:options']?.accept;
  const enablePreview = uischema?.options?.['ui:options']?.enablePreview || false;
  // For multiple files we expect `data` to be an array of data URLs (or null/undefined)
  const filesData = Array.isArray(data) ? data : [];
  const hasFiles = Array.isArray(filesData) && filesData.length > 0;

  const isImageDataUrl = (dataUrl) => {
    if (!dataUrl || typeof dataUrl !== 'string') return false;
    return dataUrl.startsWith('data:image/');
  };

  function getAllowedMimes(accepted) {
    if (!accepted?.trim()) {
      return [];
    }
    return accepted
      .split(',')
      .map((mime) => mime.trim())
      .filter(Boolean);
  }

  function validateFile(file, allowedMimes, maxFileSizeMB) {
    if ((allowedMimes.length && !allowedMimes.includes(file.type)) || !file.type) {
      return t('fileTypeNotAllowed', { fileName: file.name });
    }
    if (maxFileSizeMB) {
      const MB = 1024 * 1024;
      if (file.size > maxFileSizeMB * MB) {
        return t('fileSizeExceeded', { fileName: file.name, maxSize: maxFileSizeMB });
      }
    }
    return null;
  }

  const inputRef = useRef(null);

  const readFilesAsDataUrls = (files) => {
    return new Promise((resolve, reject) => {
      const results = [];
      let remaining = files.length;

      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          results[index] = {
            name: file.name,
            dataUrl: event?.target?.result,
          };
          remaining -= 1;
          if (remaining === 0) {
            resolve(results);
          }
        };
        reader.onerror = () => {
          reject(new Error('Failed to read one of the files.'));
        };
        reader.readAsDataURL(file);
      });
    });
  };

  const handleFilesSelect = useCallback(
    async (fileList) => {
      if (!fileList || fileList.length === 0) {
        return;
      }

      const files = Array.from(fileList);
      const allowedMimes = getAllowedMimes(acceptedFileTypes);

      // validate all files first
      for (const file of files) {
        const error = validateFile(file, allowedMimes, maxFileSize);
        if (error) {
          setLocalError(error);
          // clear data on validation error
          handleChange(path, []);
          return;
        }
      }

      setLocalError(null);
      setIsUploading(true);

      try {
        const newItems = await readFilesAsDataUrls(files);
        const updated = [...filesData, ...newItems];
        handleChange(path, updated);
        setIsUploading(false);
      } catch {
        setIsUploading(false);
        setLocalError(t('fileProcessingError'));
      }
    },
    [handleChange, path, acceptedFileTypes, maxFileSize, filesData]
  );

  const handleFileInputChange = (event) => {
    handleFilesSelect(event.target.files);
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
      const fileList = event.dataTransfer.files;
      handleFilesSelect(fileList);
    }
  };

  const jsonFormsError = typeof errors === 'string' ? errors : '';
  const hasError = Boolean(jsonFormsError) || Boolean(localError);

  const readOnlyContainer = {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 2,
    p: 2,
    backgroundColor: 'background.paper',
    textAlign: 'center',
  };

  const readOnlyPreview = {
    maxWidth: '100%',
    maxHeight: '300px',
    width: 'auto',
    height: 'auto',
    borderRadius: 1,
    objectFit: 'contain',
  };

  const fileNameSx = {
    mt: 0.5,
    width: '180px',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    textAlign: 'center',
  };

  const downloadLinkSx = {
    mt: 0.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.5,
    cursor: 'pointer',
    color: 'primary.main',
    textDecoration: 'none',
    fontSize: '0.75rem',
    '&:hover': {
      textDecoration: 'underline',
      color: 'primary.dark',
    },
  };

  // read-only mode with multiple images/files
  if (isReadOnly && hasFiles) {
    return (
      <Box sx={{ mb: 2 }}>
        {label && (
          <Typography className="fileUploadLabel" variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            {label} {required && <span> *</span>}
          </Typography>
        )}
        <Box sx={readOnlyContainer}>
          {filesData.map((item, idx) => {
            const isImage = isImageDataUrl(item.dataUrl);
            return (
              <Box
                key={idx}
                sx={{ mb: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                {isImage ? (
                  <Box
                    component="img"
                    src={item.dataUrl}
                    alt={t('imagePreview', { index: idx + 1 })}
                    sx={readOnlyPreview}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                    }}
                  >
                    <IconFile size={24} />
                    <Typography variant="body2">
                      {item.name || t('file', { index: idx + 1 })}
                    </Typography>
                  </Box>
                )}
                {isImage && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {item.name || t('file', { index: idx + 1 })}
                  </Typography>
                )}
                <Link
                  component="button"
                  variant="caption"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(item, idx);
                  }}
                  sx={{
                    mt: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    cursor: 'pointer',
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontSize: '0.75rem',
                    '&:hover': {
                      textDecoration: 'underline',
                      color: 'primary.dark',
                    },
                  }}
                >
                  <IconDownload size={14} />
                  {t('download')}
                </Link>
              </Box>
            );
          })}
        </Box>
        {schema?.description && (
          <FormHelperText sx={{ mt: 1, mx: 0, marginLeft: '14px' }}>
            {schema.description}
          </FormHelperText>
        )}
      </Box>
    );
  }

  const fielUploadContainer = {
    border: 2,
    borderRadius: 2,
    borderStyle: 'dashed',
    borderColor: hasError
      ? 'error.main'
      : hasFiles
        ? 'success.main'
        : isDragOver
          ? 'primary.main'
          : 'grey.300',
    backgroundColor: isDragOver ? 'action.hover' : hasFiles ? 'success.lighter' : '',
    p: 3,
    textAlign: 'center',
    cursor: isReadOnly || !enabled ? 'not-allowed' : 'pointer',
    opacity: isReadOnly || !enabled ? 0.6 : 1,
    transition: 'all 0.2s ease-in-out',
    '&:hover': !isReadOnly &&
      enabled && {
        borderColor: 'primary.main',
        backgroundColor: 'action.hover',
      },
  };

  const uploadedFileContainer = {
    display: 'flex',
    flexDirection: 'row', // side by side
    alignItems: 'flex-start', // top‑align cards
    gap: 2, // or 2 if using theme.spacing
    flexWrap: 'wrap', // wrap to next line on small screens
    justifyContent: 'center',
  };

  const previewContainer = {
    width: 180,
    height: 180,
    borderRadius: '4px',
    border: '1px solid',
    borderColor: 'divider',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    objectFit: 'contain',
    '&:hover': {
      cursor: isReadOnly ? 'default' : 'pointer',
    },
  };

  const previewImage = {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  };

  const removeFile = (index) => {
    if (isReadOnly) return;
    const updated = filesData.filter((_, i) => i !== index);
    handleChange(path, updated);
  };

  const handleDownload = (item, index) => {
    if (!item.dataUrl) return;

    try {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = item.dataUrl;
      link.download = item.name || `file-${index + 1}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const removeFileIconSx = {
    position: 'absolute',
    top: -8,
    right: -9,
    cursor: 'pointer',
    color: 'error.main',
    zIndex: 1,
  };
  const filePreviewContainSx = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    mb: 2,
  };

  if (!visible) return null;
  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Typography className="fileUploadLabel" variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
          {label} {required && <span> *</span>}
        </Typography>
      )}
      <Box
        sx={fielUploadContainer}
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
          disabled={isUploading || isReadOnly || !enabled}
          multiple
        />

        {hasFiles ? (
          <Box>
            <Box sx={uploadedFileContainer}>
              {filesData.map((item, idx) => {
                const isImage = isImageDataUrl(item.dataUrl);
                return (
                  <Box key={idx} sx={filePreviewContainSx}>
                    <Box
                      sx={{
                        position: 'relative',
                      }}
                    >
                      {!isReadOnly && (
                        <Box
                          sx={removeFileIconSx}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(idx);
                          }}
                        >
                          {/* use any Tabler icon, e.g. IconX */}
                          <IconX size={18} />
                        </Box>
                      )}
                      {enablePreview && isImage ? (
                        <Box sx={previewContainer}>
                          <Box
                            component="img"
                            src={item.dataUrl}
                            alt={t('uploadedImagePreview', { index: idx + 1 })}
                            sx={previewImage}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </Box>
                      ) : (
                        <Box sx={previewContainer}>
                          <IconFile size={32} color="currentColor" />
                        </Box>
                      )}
                    </Box>
                    <Typography variant="caption" sx={fileNameSx}>
                      {item.name}
                    </Typography>
                    <Link
                      component="button"
                      variant="caption"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(item, idx);
                      }}
                      sx={downloadLinkSx}
                    >
                      <IconDownload size={14} />
                      {t('download')}
                    </Link>
                  </Box>
                );
              })}
            </Box>
            <Typography variant="body2" sx={{ color: 'success.main', mt: 1 }}>
              {t('fileUploadSuccess', 'File(s) uploaded successfully!')}
            </Typography>
            {!isReadOnly && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {t('clickToChangeFile', 'Click to change file')}
              </Typography>
            )}
          </Box>
        ) : (
          <Box>
            <IconUpload size={32} color="currentColor" />
            <Typography variant="body2" sx={{ mt: 1, color: 'text.primary' }}>
              {isUploading ? t('uploading', 'Uploading...') : t('upload', 'Upload')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t('dragAndDropOrClick', 'Drag and drop or click to select')}
            </Typography>
            {acceptedFileTypes && (
              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                {t('acceptedFormats')}: {acceptedFileTypes}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {hasError && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {localError || jsonFormsError || t('invalidFile')}
        </Alert>
      )}
      {schema?.description && (
        <FormHelperText sx={{ mt: 1, mx: 0, marginLeft: '14px' }}>
          {schema.description}
        </FormHelperText>
      )}
    </Box>
  );
};

// Use when ui:widget is 'file' or format is 'data-url'
export const customFileUploadTester = rankWith(
  Number.MAX_VALUE, // Highest priority to ensure it takes precedence over default text controls
  and(isControl, (uischema, schema) => {
    let fieldSchema = schema;
    if (uischema?.scope && schema?.properties) {
      const fieldName = uischema.scope.replace('#/properties/', '');
      fieldSchema = schema.properties[fieldName];
    }

    const hasFileWidget = optionIs('ui:widget', 'file')(uischema, schema);
    const hasDataUrlFormat = fieldSchema?.format === 'data-url';
    return hasFileWidget || hasDataUrlFormat;
  })
);

export default withJsonFormsControlProps(CustomFileUploadControl);
