import { Alert } from "@mui/material";
import { styled } from "@mui/material/styles";
import { IconInfoCircle } from "@tabler/icons-react";
import { and, isControl, optionIs, rankWith } from "@jsonforms/core";
import { useJsonForms, withJsonFormsControlProps } from "@jsonforms/react";

import { Icon } from "../components/extended/Icon";

// Helper functions and styled components
const HTMLContent = ({ children }) => (
  <div dangerouslySetInnerHTML={{ __html: children }} />
);
const currency = (value) =>
  new Intl.NumberFormat("en-IN", { currency: "INR", style: "currency" }).format(
    value
  );

const StyledAlert = styled(Alert)(({ theme }) => ({
  fontSize: "0.75rem",
  borderRadius: "8px",
  backgroundColor: theme.palette.grey[100],
  "& .MuiAlert-icon": {
    paddingTop: 6,
    transform: "scaleX(-1)",
    color: theme.palette.primary.main,
  },
}));

const CustomInfoAlert = ({ data, uischema, visible }) => {
  const { core } = useJsonForms();

  if (!visible) {
    return;
  }
  const formData = core?.data || {};
  const { message } = uischema.options;
  const msg = message ? message.call({ ...formData, currency }) : "";

  if (!msg) {
    return data;
  }

  return (
    <StyledAlert
      severity="info"
      icon={<Icon icon={IconInfoCircle} />}
      sx={{ mt: -1.3 }}
    >
      <HTMLContent>{msg}</HTMLContent>
    </StyledAlert>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const customInfoAlertTester = rankWith(
  Number.MAX_VALUE,
  and(isControl, optionIs("format", "alert"))
);

const CustomInfoAlertWrapper = withJsonFormsControlProps(CustomInfoAlert);

export default CustomInfoAlertWrapper;
