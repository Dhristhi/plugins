import { useMemo } from "react";
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { and, isControl, optionIs, rankWith } from "@jsonforms/core";
import { Unwrapped } from "@jsonforms/material-renderers";

const { MaterialEnumControl } = Unwrapped;

const CustomSelectControl = (props) => {
  const { schema, uischema, path, data, handleChange, isLoading } = props;

  const isMulti = uischema?.options?.multi === true;

  /* SAFE ENUM EXTRACTION */
  const enumValues = useMemo(() => {
    if (schema?.type === "array" && Array.isArray(schema?.items?.enum)) {
      return schema.items.enum;
    }
    if (Array.isArray(schema?.enum)) {
      return schema.enum;
    }
    return [];
  }, [schema]);

  const options = useMemo(
    () => enumValues.map((v) => ({ label: v, value: v })),
    [enumValues]
  );

  const value = useMemo(() => {
    if (isMulti) {
      return Array.isArray(data) ? data : [];
    }
    return typeof data === "string" ? data : "";
  }, [data, isMulti]);

  const handleOnChange = (event) => {
    handleChange(path, event.target.value);
  };

  const label = schema?.title || "Select";

  return (
    <Box>
      {/* MULTI SELECT */}
      {isMulti ? (
        <FormControl fullWidth>
          <InputLabel>{label}</InputLabel>
          <Select
            multiple
            value={value}
            onChange={handleOnChange}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((val) => (
                  <Chip key={val} label={val} />
                ))}
              </Box>
            )}
          >
            {options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        /* SINGLE SELECT  */
        <MaterialEnumControl
          {...props}
          schema={{ ...schema }}
          options={options}
          data={value}
          disabled={isLoading}
          handleChange={handleChange}
        />
      )}
    </Box>
  );
};

export const customSelectTester = rankWith(
  Number.MAX_VALUE,
  and(isControl, optionIs("format", "dynamicselect"))
);

export default withJsonFormsControlProps(CustomSelectControl);
