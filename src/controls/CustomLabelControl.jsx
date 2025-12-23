import { JSONTree } from "react-json-tree";
import { withJsonFormsControlProps } from "@jsonforms/react";
import {
  Chip,
  Grid,
  Box,
  Typography,
  styled,
  alpha,
  useTheme,
} from "@mui/material";
import { and, isControl, optionIs, rankWith } from "@jsonforms/core";

import { formatDate, isValidDateString, formatCurrencyAmount } from "../utils";

const StyledChip = styled(Chip)(({ theme, status }) => {
  const statusColors = {
    verified: theme.palette.success.main,
    pending: theme.palette.warning.main,
    warning: theme.palette.warning.main,
    expiring: theme.palette.error.main,
    expired: theme.palette.error.dark,
    "expiring-soon": theme.palette.warning.main,
  };
  if (status) {
    const color =
      statusColors[status.toLowerCase()] ?? theme.palette.primary.light;
    return {
      padding: 0,
      color: color,
      borderRadius: 4,
      fontWeight: 500,
      border: `1px solid ${color}`,
      backgroundColor: alpha(color, 0.1),
    };
  }
  return {
    padding: 0,
    borderRadius: 4,
    fontWeight: 500,
    textTransform: "capitalize",
    color: theme.palette.primary.dark,
    backgroundColor: theme.palette.primary.light,
    border: `1px solid ${theme.palette.primary.main}`,
  };
});

const CustomLabelControl = (props) => {
  const theme = useTheme();
  const {
    label,
    data,
    uischema: {
      options: { capitalize, isChip, dateTimeFormat },
    },
  } = props;

  const renderData = () => {
    if (isChip) {
      const actions = Array.isArray(data) ? data : [data];
      return actions.map((action, j) => (
        <StyledChip
          status={
            action === "CREATE"
              ? "verified"
              : action === "UPDATE"
              ? "warning"
              : action === "DELETE"
              ? "expired"
              : "primary"
          }
          key={j}
          label={action}
        />
      ));
    }

    if (capitalize) {
      return <span style={{ textTransform: "capitalize" }}>{data}</span>;
    }

    if (isValidDateString(data)) {
      return `${formatDate(data, dateTimeFormat)}`;
    }

    // Handle currency formatting for display (uses dynamic formatting with USD as default)
    if (props.uischema?.options?.format === "currency") {
      if (typeof data === "number" && !isNaN(data)) {
        return formatCurrencyAmount(data, "USD"); // Default to USD since currency context not available
      }
    }

    // Handle image display for data URLs
    if (props.uischema?.options?.format === "image") {
      if (typeof data === "string" && data.startsWith("data:image")) {
        return (
          <Box sx={{ mt: 1, textAlign: "center" }}>
            <img
              src={data}
              alt="Account Logo"
              style={{
                maxWidth: "200px",
                maxHeight: "120px",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
                objectFit: "contain",
              }}
            />
          </Box>
        );
      }
      return (
        <Typography variant="body2" color="text.secondary">
          No image uploaded
        </Typography>
      );
    }

    if (Array.isArray(data) && data.length > 0) {
      return data.map((sk, j) => (
        <StyledChip key={j} label={sk} size="small" sx={{ m: 0.2 }} />
      ));
    }

    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      return (
        <Box sx={{ fontSize: "0.95em", mt: 1, background: "#fff" }}>
          <JSONTree
            data={data}
            hideRoot={true}
            shouldExpandNode={() => true}
            theme={{
              base00: "#fff",
              base01: "#f5f5f5",
              base02: "#eee",
              base03: "#444",
              base04: "#666",
              base05: "#222",
              base06: "#333",
              base07: "#000",
              base08: "#e53935",
              base09: "#ffb300",
              base0A: "#fbc02d",
              base0B: "#43a047",
              base0C: "#00bcd4",
              base0D: "#1e88e5",
              base0E: "#8e24aa",
              base0F: "#d84315",
            }}
          />
        </Box>
      );
    }

    if (typeof data === "boolean") {
      return data ? "Yes" : "No";
    }

    if (data !== undefined && data !== null && data !== "") {
      return data;
    }

    return "-";
  };

  return (
    <Grid item>
      <Box p={0}>
        <Typography
          variant="body2"
          gutterBottom
          sx={{ color: theme.palette.drawerLabel }}
        >
          {label}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
          {renderData()}
        </Typography>
      </Box>
    </Grid>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const customLabelTester = rankWith(
  Number.MAX_VALUE,
  and(isControl, optionIs("format", "label"))
);

// eslint-disable-next-line react-refresh/only-export-components
export const customImageTester = rankWith(
  Number.MAX_VALUE,
  and(isControl, optionIs("format", "image"))
);

const CustomLabelControlWrapper = withJsonFormsControlProps(CustomLabelControl);

export default CustomLabelControlWrapper;
