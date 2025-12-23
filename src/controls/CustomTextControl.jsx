import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Unwrapped } from "@jsonforms/material-renderers";
import { CircularProgress, TextField } from "@mui/material";
import { and, isControl, optionIs, rankWith } from "@jsonforms/core";
import { useJsonForms, withJsonFormsControlProps } from "@jsonforms/react";

import { queryStringToObject, formatCurrencyAmount } from "../utils";

// Extract MaterialTextControl from Unwrapped
const { MaterialTextControl } = Unwrapped;

const CustomTextControl = (props) => {
  const params = useParams();
  const { core } = useJsonForms();

  const [isLoading, setIsLoading] = useState(false);
  const [displayValue, setDisplayValue] = useState("");

  const {
    schema,
    uischema,
    path,
    handleChange,
    data,
    label,
    required,
    errors,
    description,
  } = props;
  const { referencePath, query, relatedDefaults, computedFields, format } =
    uischema.options || {};

  // Get currency from form data for dynamic formatting (memoized to prevent unnecessary re-renders)
  const getCurrencyFromFormData = useCallback(() => {
    // For salary fields, currency is at employment_info.salary.currency
    if (
      path.includes("salary") &&
      core.data?.employment_info?.salary?.currency
    ) {
      return core.data.employment_info.salary.currency;
    }
    return "USD"; // Default fallback
  }, [path, core.data?.employment_info?.salary?.currency]);

  // Sync display value when data changes
  useEffect(() => {
    if (format === "currency") {
      if (typeof data === "number" && !isNaN(data)) {
        const currency = getCurrencyFromFormData();
        setDisplayValue(formatCurrencyAmount(data, currency));
      } else {
        setDisplayValue("");
      }
    }
  }, [
    data,
    format,
    core.data?.employment_info?.salary?.currency,
    getCurrencyFromFormData,
  ]);

  useEffect(() => {
    if (referencePath) {
      const fetchDefaults = async () => {
        const splitKey = referencePath?.split(".");
        const updatedQuery =
          query?.replace(/:(\w+)/g, (match, key) => match) || "";
        const params = queryStringToObject(updatedQuery);

        if (splitKey?.length === 2) {
          const res = await apiCall(splitKey[0], params);

          if (res?.length > 0) {
            handleChange(path, res[0][splitKey[1]]);

            if (relatedDefaults?.length > 0) {
              relatedDefaults.forEach(({ scope, referencePath }) => {
                handleChange(scope, res[0][referencePath]);
              });
            }
          }
        }
      };
      fetchDefaults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referencePath, query]);

  const apiCall = (entity, params) => {
    // setIsLoading(true);
    // return searchByParams(entity, params)
    //   .then((res) => {
    //     if (res.data?.data) {
    //       return res.data.data;
    //     }
    //     return enqueueToast({ type: "error", message: res });
    //   })
    //   .catch((err) => enqueueToast({ type: "error", message: err }))
    //   .finally(() => setIsLoading(false));
  };

  const toNumber = (value) => (value === "" ? undefined : Number(value));

  const handleCurrencyChange = (event) => {
    const inputValue = event.target.value;

    // Remove existing commas for processing
    const cleanValue = inputValue.replace(/,/g, "");

    // Allow only digits during typing
    const allowedCharsRegex = /^[0-9]*$/;
    if (!allowedCharsRegex.test(cleanValue)) {
      return; // Block invalid characters
    }

    // Format the number with commas for display
    let formattedValue = "";
    let numericValue;

    if (cleanValue !== "") {
      numericValue = Number(cleanValue);
      if (!isNaN(numericValue)) {
        const currency = getCurrencyFromFormData();
        formattedValue = formatCurrencyAmount(numericValue, currency);
      }
    } else {
      // Handle empty input - set to undefined for JsonForms
      numericValue = undefined;
    }

    // Update display value first
    setDisplayValue(formattedValue);

    // Update form data with numeric value - let JsonForms handle the data
    handleChange(path, numericValue);

    if (computedFields?.length > 0) {
      computedFields.forEach(({ scope, fn }) => {
        // Use core.data to get the most up-to-date form data
        const currentFormData = core?.data || {};
        const updatedFormData = { ...currentFormData, [path]: numericValue };
        const computedValue = fn(updatedFormData, params);
        handleChange(scope, computedValue);
      });
    }
  };

  const handleOnChange = (ev, selectedVal) => {
    let processedValue = selectedVal;

    // Handle number conversion for non-currency fields
    if (schema.type === "number" && selectedVal && format !== "currency") {
      processedValue = toNumber(selectedVal);
    }

    handleChange(path, processedValue);

    if (computedFields?.length > 0) {
      computedFields.forEach(({ scope, fn }) => {
        const currentFormData = core?.data || {};
        const updatedFormData = { ...currentFormData, [path]: processedValue };
        const computedValue = fn(updatedFormData, params);
        handleChange(scope, computedValue);
      });
    }
  };

  if (isLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}
      >
        <CircularProgress />
      </div>
    );
  }

  // For currency fields, render custom TextField (no real-time icon for simplicity)
  if (format === "currency") {
    return (
      <div>
        <TextField
          label={label}
          value={displayValue}
          onChange={handleCurrencyChange}
          disabled={isLoading}
          required={required}
          error={errors && errors.length > 0}
          helperText={
            errors && errors.length > 0 ? errors[0].message : description || ""
          }
          fullWidth
          variant="outlined"
        />
      </div>
    );
  }

  return (
    <div>
      <MaterialTextControl
        {...props}
        path={path}
        schema={schema}
        uischema={uischema}
        disabled={isLoading}
        handleChange={handleOnChange}
      />
    </div>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const customTextTester = rankWith(
  Number.MAX_VALUE,
  and(isControl, optionIs("format", "dynamicinput"))
);

// eslint-disable-next-line react-refresh/only-export-components
export const customCurrencyTester = rankWith(
  Number.MAX_VALUE + 1, // Higher priority than default text control
  and(isControl, optionIs("format", "currency"))
);

const CustomTextControlWrapper = withJsonFormsControlProps(CustomTextControl);

export default CustomTextControlWrapper;
