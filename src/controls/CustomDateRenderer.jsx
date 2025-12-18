import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import { withJsonFormsControlProps } from "@jsonforms/react";
import {
  TextField,
  Box,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { IconCalendar } from "@tabler/icons-react";
import { formatDate, formatTime, isValidDateString } from "../utils/dateUtils";

const CustomDateRendererBase = ({
  data,
  handleChange,
  path,
  label,
  errors,
  schema,
  uischema,
  visible,
  enabled,
  required,
}) => {
  if (!visible) return null;

  const uiOptions = useMemo(
    () => uischema?.options?.["ui:options"] || {},
    [uischema]
  );
  const dateTimeFormat = uiOptions.dateTimeFormat || "DD-MM-YYYY";
  const showTime = uiOptions.showTime || false;
  const invalidPlaceholder = uiOptions.invalidPlaceholder || "N/A";
  const readonly = uischema?.options?.readonly || false;

  const [inputValue, setInputValue] = useState("");
  const hiddenDateInputRef = useRef(null);
  const lastDataRef = useRef(data);

  // Format the date whenever data changes from external source
  useEffect(() => {
    // Only update if data actually changed
    if (lastDataRef.current === data) {
      return;
    }

    lastDataRef.current = data;

    if (data && isValidDateString(data)) {
      try {
        const formatted = showTime
          ? formatTime(data, dateTimeFormat)
          : formatDate(data, dateTimeFormat);
        setInputValue(formatted);
      } catch (error) {
        console.error("Date formatting error:", error);
        setInputValue("");
      }
    } else {
      setInputValue("");
    }
  }, [data, dateTimeFormat, showTime]);

  const parseDateFromFormat = useCallback((value, format) => {
    if (!value) return null;

    value = value.trim();
    let day,
      month,
      year,
      hours = 0,
      minutes = 0,
      seconds = 0;

    try {
      // Parse time if present
      if (format.includes("HH:mm")) {
        const parts = value.split(" ");
        if (parts.length >= 2) {
          const timePart = parts[parts.length - 1];
          const timeComponents = timePart.split(":");
          hours = parseInt(timeComponents[0]) || 0;
          minutes = parseInt(timeComponents[1]) || 0;
          if (timeComponents[2]) {
            seconds = parseInt(timeComponents[2]) || 0;
          }
          value = parts.slice(0, -1).join(" ");
        }
      }

      // Parse date part based on format
      if (format.startsWith("DD-MM-YYYY") || format.startsWith("DD/MM/YYYY")) {
        const separator = format.includes("/") ? "/" : "-";
        const parts = value.split(separator);
        if (parts.length >= 3) {
          day = parseInt(parts[0]);
          month = parseInt(parts[1]);
          year = parseInt(parts[2]);
        }
      } else if (
        format.startsWith("MM-DD-YYYY") ||
        format.startsWith("MM/DD/YYYY")
      ) {
        const separator = format.includes("/") ? "/" : "-";
        const parts = value.split(separator);
        if (parts.length >= 3) {
          month = parseInt(parts[0]);
          day = parseInt(parts[1]);
          year = parseInt(parts[2]);
        }
      } else if (format.startsWith("YYYY-MM-DD")) {
        const parts = value.split("-");
        if (parts.length >= 3) {
          year = parseInt(parts[0]);
          month = parseInt(parts[1]);
          day = parseInt(parts[2]);
        }
      } else if (format.includes("MMM") || format.includes("MMMM")) {
        const monthNamesShort = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

        const parts = value.split(/[\s,]+/).filter(Boolean);

        if (format.startsWith("DD MMM YYYY")) {
          day = parseInt(parts[0]);
          month = monthNamesShort.indexOf(parts[1]) + 1;
          year = parseInt(parts[2]);
        } else if (format.startsWith("MMM DD")) {
          month = monthNamesShort.indexOf(parts[0]) + 1;
          day = parseInt(parts[1]);
          year = parseInt(parts[2]);
        } else if (format.startsWith("MMMM DD")) {
          month = monthNames.indexOf(parts[0]) + 1;
          day = parseInt(parts[1]);
          year = parseInt(parts[2]);
        }
      }

      // Validate
      if (
        isNaN(day) ||
        isNaN(month) ||
        isNaN(year) ||
        day < 1 ||
        day > 31 ||
        month < 1 ||
        month > 12 ||
        year < 1000
      ) {
        return null;
      }

      const date = new Date(year, month - 1, day, hours, minutes, seconds);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  }, []);

  const handleCalendarClick = useCallback(() => {
    if (enabled && !readonly) {
      hiddenDateInputRef.current?.showPicker?.();
    }
  }, [enabled, readonly]);

  const handleHiddenDateChange = useCallback(
    (event) => {
      const value = event.target.value;
      if (value) {
        let isoString;

        if (showTime) {
          // For datetime-local, value is already in "YYYY-MM-DDTHH:mm" format
          const date = new Date(value);
          isoString = date.toISOString();
        } else {
          // For date, add time to create proper date
          const date = new Date(value + "T00:00:00");
          isoString = date.toISOString();
        }

        if (lastDataRef.current !== isoString) {
          lastDataRef.current = isoString;
          handleChange(path, isoString);

          // Format and update the visible input immediately
          try {
            const formatted = showTime
              ? formatTime(isoString, dateTimeFormat)
              : formatDate(isoString, dateTimeFormat);
            setInputValue(formatted);
          } catch (error) {
            console.error("Date formatting error:", error);
          }
        }
      } else {
        lastDataRef.current = undefined;
        handleChange(path, undefined);
        setInputValue("");
      }
    },
    [handleChange, path, showTime, dateTimeFormat]
  );

  const hiddenInputValue = useMemo(() => {
    if (data && isValidDateString(data)) {
      try {
        const date = new Date(data);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        if (showTime) {
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        } else {
          return `${year}-${month}-${day}`;
        }
      } catch (error) {
        return "";
      }
    }
    return "";
  }, [data, showTime]);

  const displayValue = useMemo(() => {
    if (data && isValidDateString(data)) {
      try {
        return showTime
          ? formatTime(data, dateTimeFormat)
          : formatDate(data, dateTimeFormat);
      } catch (error) {
        return invalidPlaceholder;
      }
    }
    return invalidPlaceholder;
  }, [data, showTime, dateTimeFormat, invalidPlaceholder]);

  if (readonly) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mb: 1,
            fontSize: "12px",
            color: "text.secondary",
            fontWeight: 500,
          }}
        >
          {label}
          {required && " *"}
        </Typography>
        <Box
          sx={{
            p: "10px 14px",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            backgroundColor: "action.hover",
            minHeight: "40px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {displayValue}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2, position: "relative" }}>
      <input
        ref={hiddenDateInputRef}
        type={showTime ? "datetime-local" : "date"}
        value={hiddenInputValue}
        onChange={handleHiddenDateChange}
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          width: "100%",
          height: "100%",
          left: 0,
          top: 0,
          margin: 0,
          padding: 0,
          border: 0,
        }}
      />

      <TextField
        type="text"
        label={label}
        value={inputValue}
        placeholder={dateTimeFormat.toLowerCase()}
        fullWidth
        required={required}
        disabled={!enabled}
        error={!!errors}
        helperText={errors || `Format: ${dateTimeFormat}`}
        variant="outlined"
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleCalendarClick}
                disabled={!enabled}
                edge="end"
                size="small"
              >
                <IconCalendar size={20} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 1,
            cursor: "pointer",
            "&:hover": {
              backgroundColor: enabled ? "action.hover" : "transparent",
            },
          },
          "& .MuiInputBase-input": {
            cursor: "pointer",
          },
        }}
        onClick={handleCalendarClick}
      />
    </Box>
  );
};

CustomDateRendererBase.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Date),
  ]),
  handleChange: PropTypes.func.isRequired,
  path: PropTypes.string.isRequired,
  label: PropTypes.string,
  errors: PropTypes.string,
  schema: PropTypes.object.isRequired,
  uischema: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  enabled: PropTypes.bool,
  required: PropTypes.bool,
};

const CustomDateRenderer = withJsonFormsControlProps(CustomDateRendererBase);

export default CustomDateRenderer;
