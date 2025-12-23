import { useCallback, useEffect, useState } from "react";
import { Unwrapped } from "@jsonforms/material-renderers";
import { TextField } from "@mui/material";
import { and, isControl, optionIs, rankWith } from "@jsonforms/core";
import { useJsonForms, withJsonFormsControlProps } from "@jsonforms/react";
import { formatCurrencyAmount } from "../utils/textUtils";

const { MaterialTextControl } = Unwrapped;

const CURRENCY_LOOKUP = [
  {
    lookupKey: "USD",
    lookupIcon: "$",
    lookupLocale: "en-US",
  },
  {
    lookupKey: "INR",
    lookupIcon: "₹",
    lookupLocale: "en-IN",
  },
  {
    lookupKey: "EUR",
    lookupIcon: "€",
    lookupLocale: "en-DE",
  },
  {
    lookupKey: "GBP",
    lookupIcon: "£",
    lookupLocale: "en-GB",
  },
  {
    lookupKey: "CAD",
    lookupIcon: "C$",
    lookupLocale: "en-CA",
  },
  {
    lookupKey: "AUD",
    lookupIcon: "A$",
    lookupLocale: "en-AU",
  },
  {
    lookupKey: "SGD",
    lookupIcon: "S$",
    lookupLocale: "en-SG",
  },
];

const CustomTextControl = (props) => {
  const { core } = useJsonForms();
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
  const { format } = uischema.options || {};

  const getCurrencyFromFormData = useCallback(() => {
    // Add more specific paths for your schema structure
    const possiblePaths = [
      core.data?.currency,
      core.data?.employmentinfo?.salary?.currency,
      core.data?.employmentinfo?.salary?.currencyicon, // Try icon field too
      // Add dynamic path extraction based on current path
      path.split(".").slice(0, -1).join(".") + ".currency",
      path.split(".").slice(0, -1).join(".") + ".currencyicon",
    ];

    for (const currencyValue of possiblePaths) {
      if (currencyValue && typeof currencyValue === "string")
        return currencyValue;
    }
    return "USD"; // fallback
  }, [core.data, path]);

  // Sync display value when data changes (for currency fields)
  useEffect(() => {
    if (format === "currency") {
      if (typeof data === "number" && !isNaN(data)) {
        const currency = getCurrencyFromFormData();
        setDisplayValue(formatCurrencyAmount(data, currency, CURRENCY_LOOKUP));
      } else {
        setDisplayValue("");
      }
    }
  }, [data, format, getCurrencyFromFormData]);

  // Convert string to number
  const toNumber = (value) => (value === "" ? undefined : Number(value));

  // Handle currency input changes
  const handleCurrencyChange = (event) => {
    const inputValue = event.target.value;
    const cleanValue = inputValue.replace(/,/g, "");

    // Allow only digits
    if (!/^[0-9]*$/.test(cleanValue)) {
      return;
    }

    let formattedValue = "";
    let numericValue;

    if (cleanValue !== "") {
      numericValue = Number(cleanValue);
      if (!isNaN(numericValue)) {
        const currency = getCurrencyFromFormData();
        formattedValue = formatCurrencyAmount(
          numericValue,
          currency,
          CURRENCY_LOOKUP
        );
      }
    } else {
      numericValue = undefined;
    }

    setDisplayValue(formattedValue);
    handleChange(path, numericValue);
  };

  // Handle standard input changes
  const handleOnChange = (ev, selectedVal) => {
    let processedValue = selectedVal;

    // Handle number conversion for non-currency number fields
    if (schema.type === "number" && selectedVal && format !== "currency") {
      processedValue = toNumber(selectedVal);
    }

    handleChange(path, processedValue);
  };

  // Render currency field with custom TextField
  if (format === "currency") {
    return (
      <TextField
        sx={{ mb: 2, mt: 1 }}
        label={label}
        value={displayValue}
        onChange={handleCurrencyChange}
        required={required}
        error={errors && errors.length > 0}
        helperText={
          errors && errors.length > 0 ? errors[0].message : description || ""
        }
        fullWidth
        variant="outlined"
      />
    );
  }

  // Render standard text control
  return (
    <Box sx={{ mb: 2 }}>
      <MaterialTextControl
        {...props}
        path={path}
        schema={schema}
        uischema={uischema}
        handleChange={handleOnChange}
      />
    </Box>
  );
};

// Testers for JsonForms
export const customTextTester = rankWith(
  Number.MAX_VALUE,
  and(isControl, optionIs("format", "dynamicinput"))
);

export const customCurrencyTester = rankWith(
  Number.MAX_VALUE + 1,
  and(isControl, optionIs("format", "currency"))
);

export default withJsonFormsControlProps(CustomTextControl);
