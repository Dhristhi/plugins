import { useTranslation } from 'react-i18next';
import { IconEye, IconCode, IconDeviceFloppy } from '@tabler/icons-react';
import { Box, Typography, Button, ButtonGroup } from '@mui/material';

const headerContainerSx = {
  top: 0,
  zIndex: 1,
  borderBottom: 1,
  position: 'sticky',
  p: { xs: 2, sm: 3 },
  borderColor: 'grey.200',
  backgroundColor: 'background.paper',
};

const headerRowSx = {
  mb: 2,
  gap: 2,
  display: 'flex',
  alignItems: 'center',
};

const iconWrapperSx = {
  p: 1,
  display: 'flex',
  borderRadius: 2,
  alignItems: 'center',
  justifyContent: 'center',
  color: 'primary.contrastText',
  backgroundColor: 'primary.main',
};

const titleSx = {
  mb: 0.5,
  fontWeight: 600,
  color: 'text.primary',
};

const descriptionSx = {
  color: 'grey.600',
  fontSize: '0.875rem',
};

const actionContainerSx = {
  display: 'flex',
  gap: 1.5,
  flexWrap: 'wrap',
  alignItems: 'center',
};

const buttonGroupSx = {
  '& .MuiButton-root': {
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'none',
    px: 2,
    py: 0.75,
  },
};

const CommonHeader = ({
  title,
  description,
  icon: Icon,
  showFormPreview,
  setShowFormPreview,
  showSchemaEditor,
  setShowSchemaEditor,
  onApplyChanges,
  showApplyButton = false,
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={headerContainerSx}>
      {/* Header Info */}
      <Box sx={headerRowSx}>
        <Box sx={iconWrapperSx}>
          <Icon size={24} />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={titleSx}>
            {title}
          </Typography>
          <Typography variant="body2" sx={descriptionSx}>
            {description}
          </Typography>
        </Box>

        {/* Action Buttons */}

        <Box sx={actionContainerSx}>
          {showApplyButton && (
            <Button
              onClick={onApplyChanges}
              variant="contained"
              size="small"
              startIcon={<IconDeviceFloppy size={16} />}
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
                px: 2,
                py: 0.75,
              }}
            >
              {t('exportSchema')}
            </Button>
          )}

          <ButtonGroup variant="outlined" size="small" sx={buttonGroupSx}>
            <Button
              onClick={() => {
                const newShowPreview = !showFormPreview;
                setShowFormPreview(newShowPreview);
                if (newShowPreview) setShowSchemaEditor(false);
              }}
              variant={showFormPreview ? 'contained' : 'outlined'}
              startIcon={<IconEye size={16} />}
            >
              {t('preview')}
            </Button>

            <Button
              onClick={() => {
                const newShowSchema = !showSchemaEditor;
                setShowSchemaEditor(newShowSchema);
                if (newShowSchema) setShowFormPreview(false);
              }}
              variant={showSchemaEditor ? 'contained' : 'outlined'}
              startIcon={<IconCode size={16} />}
            >
              {t('schema')}
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
    </Box>
  );
};

export default CommonHeader;
