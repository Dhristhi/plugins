import { useEffect, useState, useMemo } from "react";
import { Unwrapped } from "@jsonforms/material-renderers";
import { and, isControl, optionIs, rankWith } from "@jsonforms/core";
import { useJsonForms, withJsonFormsControlProps } from "@jsonforms/react";
import {
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  queryStringToObject,
  getNestedValue,
  updateNestedValue,
} from "../utils";

// Extract MaterialEnumControl from Unwrapped
const { MaterialEnumControl } = Unwrapped;

const CustomSelectControl = (props) => {
  const { core } = useJsonForms();
  const { i18n } = useTranslation();

  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cascadingValue, setCascadingValue] = useState(undefined);

  const { schema, uischema, path, handleChange, data, config } = props;
  const { entity, key, value, query, cascadingKey, computedFields, multi } =
    uischema.options || {};

  // Get translations and language from JsonForms config
  const translations = config?.translations;
  const formData = core?.data || {};

  // Handle array paths: if path is like xxx.0.yyy, append xxx.0 to cascadingKey
  let effectiveCascadingKey = cascadingKey;
  if (cascadingKey && path) {
    const pathParts = path.split(".");
    // Check if path contains array index (numeric part) like xxx.0.yyy
    if (pathParts.length > 2) {
      const arrayIndexMatch = pathParts.findIndex((part) => /^\d+$/.test(part));
      if (arrayIndexMatch > 0) {
        // Build the array prefix (e.g., "xxx.0")
        const arrayPrefix = pathParts.slice(0, arrayIndexMatch + 1).join(".");
        effectiveCascadingKey = `${arrayPrefix}.${cascadingKey}`;
      }
    }
  }

  const selCascadingValue =
    effectiveCascadingKey &&
    formData &&
    getNestedValue(formData, effectiveCascadingKey);

  if (effectiveCascadingKey && cascadingValue !== selCascadingValue) {
    setCascadingValue(selCascadingValue);
  }

  useEffect(() => {
    const fetchOptions = async () => {
      if (effectiveCascadingKey && !selCascadingValue) {
        return;
      }

      if (entity && key) {
        const updatedQuery =
          query?.replace(/:(\w+)/g, (match, key) => match) || "";
        const params = {
          page: 1,
          pageSize: 10000,
          ...queryStringToObject(
            selCascadingValue
              ? updatedQuery.replace(":cascadingValue", selCascadingValue)
              : updatedQuery
          ),
        };
        const res = await apiCall(entity, params);
        if (res.length > 0) {
          // Apply configurable field filtering
          const newOptions = res.map((r) => ({
            label: r.value,
            value: r.key,
            raw: r,
          }));
          setOptions(newOptions);
        }
      } else {
        const newOptions =
          schema.enum?.map((r) => ({ label: r, value: r, raw: r })) ||
          schema.items?.enum?.map((r) => ({ label: r, value: r, raw: r })) ||
          [];
        setOptions(newOptions);
      }
    };
    fetchOptions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    entity,
    key,
    value,
    query,
    schema,
    effectiveCascadingKey,
    selCascadingValue,
  ]);

  const apiCall = (entity, params) => {};

  const handleOnChange = (event, selectedVal) => {
    handleChange(path, selectedVal);
    updateNestedValue(formData, path, selectedVal);

    const vals = multi
      ? options.filter((x) => selectedVal.includes(x.value))
      : options.find((x) => x.value === selectedVal);

    computedFields?.forEach(({ scope, fn }) => {
      const scopedForm =
        path.split(".").length > 1
          ? getNestedValue(formData, path.split(".").slice(0, -1).join("."))
          : formData;
      const scopeValue = fn(
        scopedForm,
        multi ? vals.map((v) => v.raw) : vals?.raw ?? {}
      );
      // TODO: Need to revisit implementation when used inside array
      const _scope = scope; // path.split('.').length > 1 ? [...path.split('.').slice(0, -1), scope].join('.') :

      handleChange(_scope, scopeValue);
      updateNestedValue(formData, _scope, scopeValue);
    });
  };

  // Get the label using the translation system with memoization for performance
  const fieldLabel = useMemo(() => {
    // Get the field name from the path
    const fieldName = path.replace("#/properties/", "");
    // Use translations passed from config (from ListView)
    if (translations) {
      const currentLang = i18n.language || "en";
      // Try current language first, then fallback to English
      const translation =
        translations[currentLang]?.[fieldName]?.label ||
        translations.en?.[fieldName]?.label;

      if (translation) {
        return translation;
      }
    }
    // Final fallback to schema title
    return schema.title || "Select";
  }, [path, translations, i18n.language, schema.title]);

  return multi ? (
    <FormControl fullWidth>
      <InputLabel>{fieldLabel}</InputLabel>
      <Select
        label={fieldLabel}
        multiple
        value={data || []}
        onChange={(e) => handleOnChange(e, e.target.value)}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((val) => {
              const opt = options.find((o) => o.value === val);
              return <Chip key={val} label={opt ? opt.label : val} />;
            })}
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
    <MaterialEnumControl
      {...props}
      path={path}
      schema={{ ...schema, title: fieldLabel }}
      options={options}
      uischema={uischema}
      disabled={isLoading}
      handleChange={handleOnChange}
    />
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const customSelectTester = rankWith(
  Number.MAX_VALUE,
  and(isControl, optionIs("format", "dynamicselect"))
);

const CustomSelectControlWrapper =
  withJsonFormsControlProps(CustomSelectControl);

export default CustomSelectControlWrapper;
