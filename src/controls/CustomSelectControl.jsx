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
import axiosInstance from "../services/axiosInstance";

import {
  queryStringToObject,
  getNestedValue,
  updateNestedValue,
} from "../utils";

const { MaterialEnumControl } = Unwrapped;

const CustomSelectControl = (props) => {
  const { core } = useJsonForms();

  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cascadingValue, setCascadingValue] = useState(undefined);

  const { schema, uischema, path, handleChange, data, config } = props;

  const { entity, key, value, query, cascadingKey, computedFields, multi } =
    uischema?.options || {};

  const translations = config?.translations;
  const formData = core?.data || {};

  let effectiveCascadingKey = cascadingKey;
  if (cascadingKey && path) {
    const pathParts = path.split(".");
    if (pathParts.length > 2) {
      const arrayIndexMatch = pathParts.findIndex((part) => /^\d+$/.test(part));
      if (arrayIndexMatch > 0) {
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

  const getEntityName = (entity) => {
    return ["user", "tenant_setting"].includes(entity)
      ? `core_${entity}`
      : entity;
  };

  const apiCall = async (entity, params) => {
    const url = `/entity/v1/lookup`;
    const queryParams = { lookupContext: entity, pageSize: 1000, ...params };

    try {
      const res = await axiosInstance.get(url, { params: queryParams });

      const data = res.data?.data || res.data || [];
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  };

  useEffect(() => {
    const currentEntity = uischema?.options?.entity;

    // If entity is provided, always use API call (ignore schema enum)
    if (currentEntity) {
      const fetchOptions = async () => {
        setIsLoading(true);

        // Only skip if cascading is required but value is missing
        if (cascadingKey && !selCascadingValue) {
          setIsLoading(false);
          setOptions([]);
          return;
        }

        const params = {};
        if (cascadingKey && selCascadingValue) {
          params.parentLookupKey = selCascadingValue;
        }

        try {
          const res = await apiCall(entity, params);

          if (res && res.length > 0) {
            // Filter by lookupContext to ensure we only get matching records
            const filtered = res.filter((r) => r.lookupContext === entity);

            const mappedOptions = filtered.map((r) => ({
              label:
                r.lookupDesc ||
                r.lookupValue ||
                r.value ||
                r.label ||
                r.name ||
                String(r.lookupKey || r.key || r.id),
              value: r.lookupKey || r.key || r.id || r.value,
              raw: r,
            }));

            setOptions(mappedOptions);
          } else {
            setOptions([]);
          }
        } catch (error) {
          console.error("Fetch error:", error);
          setOptions([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchOptions();
      return;
    }

    // Fallback to schema enum only if no entity

    const newOptions =
      schema.enum?.map((r) => ({ label: r, value: r, raw: r })) ||
      schema.items?.enum?.map((r) => ({ label: r, value: r, raw: r })) ||
      [];

    setOptions(newOptions);
  }, [entity, cascadingKey, selCascadingValue, schema]);

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
      handleChange(scope, scopeValue);
      updateNestedValue(formData, scope, scopeValue);
    });
  };

  const fieldLabel = useMemo(() => {
    const fieldName = path.replace("#/properties/", "");
    if (translations) {
      const currentLang = "en";
      const translation =
        translations[currentLang]?.[fieldName]?.label ||
        translations.en?.[fieldName]?.label;

      if (translation) {
        return translation;
      }
    }
    return schema.title || "Select";
  }, [path, translations, schema.title]);

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
              return (
                <Chip
                  key={val}
                  label={opt ? opt.label : val}
                  sx={{ textTransform: "capitalize" }}
                />
              );
            })}
          </Box>
        )}
      >
        {options.map((opt) => (
          <MenuItem
            key={opt.value}
            value={opt.value}
            sx={{ textTransform: "capitalize" }}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  ) : (
    <>
      <MaterialEnumControl
        {...props}
        path={path}
        schema={{ ...schema, title: fieldLabel }}
        options={options}
        uischema={uischema}
        disabled={isLoading}
        handleChange={handleOnChange}
      />
    </>
  );
};

export const customSelectTester = rankWith(
  Number.MAX_VALUE,
  and(isControl, optionIs("format", "dynamicselect"))
);

const CustomSelectControlWrapper =
  withJsonFormsControlProps(CustomSelectControl);

export default CustomSelectControlWrapper;
