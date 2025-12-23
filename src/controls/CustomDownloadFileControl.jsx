import { IconEye } from "@tabler/icons-react";
import { rankWith, uiTypeIs } from "@jsonforms/core";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useJsonForms, withJsonFormsControlProps } from "@jsonforms/react";

import { Icon } from "../components/extended/Icon";

import { getNestedValue } from "../utils";
import { t } from "i18next";

const CustomDownloadFileControl = (props) => {
  let label = t("forms.custom_download_file_control.label_view_document");
  const { core } = useJsonForms();
  const { data, uischema } = props;
  const formData = core?.data || {};

  if (uischema.options?.elementLabelProp) {
    const arrProps = props.path.split(".");
    arrProps.splice(arrProps.length - 1, 1, uischema.options?.elementLabelProp);
    const value = getNestedValue(formData, arrProps.join("."));
    label = value ?? label;
  }

  const handleDownload = () => {
    // download(data).then((res) => {
    //   if (res.data?.url) {
    //     window.open(res.data?.url, "_blank");
    //   } else {
    //     console.warn(
    //       `${t(
    //         "forms.custom_download_file_control.err_msg_downloading_file"
    //       )}: ${JSON.stringify(res.data)}`
    //     );
    //   }
    // });
  };

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
export const customDownloadFileTester = rankWith(2, uiTypeIs("DownloadFile"));

const CustomDownloadFileControlWrapper = withJsonFormsControlProps(
  CustomDownloadFileControl
);

export default CustomDownloadFileControlWrapper;
