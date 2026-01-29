import { useTranslation } from 'react-i18next';
import { IconEye, IconCode } from '@tabler/icons-react';
import { Box, Typography, Button, ButtonGroup } from '@mui/material';

const headerContainerSx = {
  p: { xs: 2, sm: 3 },
  borderBottom: 1,
  borderColor: 'grey.200',
  backgroundColor: 'background.paper',
};

const headerRowSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  mb: 2,
};

const iconWrapperSx = {
  color: 'primary.contrastText',
  p: 1,
  borderRadius: 2,
  backgroundColor: 'primary.main',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const titleSx = {
  fontWeight: 600,
  color: 'text.primary',
  mb: 0.5,
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
