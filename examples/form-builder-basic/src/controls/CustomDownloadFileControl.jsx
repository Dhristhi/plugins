import { t } from 'i18next';
import { IconEye } from '@tabler/icons-react';
import { rankWith, uiTypeIs } from '@jsonforms/core';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useJsonForms, withJsonFormsControlProps } from '@jsonforms/react';

import { Icon } from '../components/Icon';
import { getNestedValue } from '../utils';

const CustomDownloadFileControl = (props) => {
  let label = t('forms.custom_download_file_control.label_view_document');

  const { uischema } = props;
  const { core } = useJsonForms();
  const formData = core?.data || {};

  if (uischema.options?.elementLabelProp) {
    const arrProps = props.path.split('.');
    arrProps.splice(arrProps.length - 1, 1, uischema.options?.elementLabelProp);
    const value = getNestedValue(formData, arrProps.join('.'));
    label = value ?? label;
  }

  const handleDownload = () => {};

  return (
    <Box display="flex" alignItems="center" sx={{ p: 0 }}>
      <Tooltip title={label}>
        <IconButton aria-label={label} onClick={handleDownload}>
          <Icon icon={IconEye} />
        </IconButton>
      </Tooltip>
      <Typography variant="body1">{label}</Typography>
    </Box>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const customDownloadFileTester = rankWith(2, uiTypeIs('DownloadFile'));

const CustomDownloadFileControlWrapper = withJsonFormsControlProps(CustomDownloadFileControl);

export default CustomDownloadFileControlWrapper;
