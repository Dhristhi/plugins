import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { Unwrapped } from '@jsonforms/material-renderers';
import { CircularProgress, TextField, FormHelperText } from '@mui/material';
import { and, isControl, optionIs, rankWith } from '@jsonforms/core';
import { useJsonForms, withJsonFormsControlProps } from '@jsonforms/react';

import { queryStringToObject, formatCurrencyAmount } from '../utils';

// Extract MaterialTextControl from Unwrapped
const { MaterialTextControl } = Unwrapped;

const CustomTextControl = (props) => {
  const params = useParams();
  const { core, config } = useJsonForms();

  const [isLoading] = useState(false);
  const [displayValue, setDisplayValue] = useState('');

  const { schema, uischema, path, handleChange, data, label, required, errors, description } =
    props;
  const { referencePath, query, relatedDefaults, computedFields, format, currency } =
    uischema.options || {};
  const currencyIcon = config?.currencyIcon || '$';

  // Get currency from form data for dynamic formatting (memoized to prevent unnecessary re-renders)
  const getCurrencyFromFormData = useCallback(() => {
    // For salary fields, currency is at employment_info.salary.currency
    if (path.includes('salary') && core.data?.employment_info?.salary?.currency) {
      return core.data.employment_info.salary.currency;
    }
    return 'USD'; // Default fallback
  }, [path, core.data?.employment_info?.salary?.currency]);

  // Sync display value when data changes
  useEffect(() => {
    if (currency === true || format === 'currency') {
      if (typeof data === 'number' && !isNaN(data)) {
        const currencyCode = getCurrencyFromFormData();
        setDisplayValue(formatCurrencyAmount(data, currencyCode));
      } else {
        setDisplayValue('');
      }
    }
  }, [
    data,
    format,
    currency,
    core.data?.employment_info?.salary?.currency,
    getCurrencyFromFormData,
  ]);

  useEffect(() => {
    if (referencePath) {
      const fetchDefaults = async () => {
        const splitKey = referencePath?.split('.');
        const updatedQuery = query?.replace(/:(\w+)/g, (match) => match) || '';
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

  // eslint-disable-next-line no-unused-vars
  const apiCall = (entity, params) => {};

  const toNumber = (value) => (value === '' ? undefined : Number(value));

  const handleCurrencyChange = (event) => {
    const inputValue = event.target.value;
    const cleanValue = inputValue.replace(/,/g, '');
    const allowedCharsRegex = /^-?[0-9]*\.?[0-9]*$/;
    if (!allowedCharsRegex.test(cleanValue)) {
      return;
    }

    let numericValue = undefined;
    if (cleanValue !== '' && cleanValue !== '.') {
      const parsed = Number(cleanValue);
      if (!isNaN(parsed)) {
        numericValue = parsed;
      }
    }

    let formattedValue = cleanValue;

    if (cleanValue !== '' && cleanValue !== '.' && !isNaN(Number(cleanValue))) {
      const currency = getCurrencyFromFormData();
      const hasTrailingDot = cleanValue.endsWith('.');
      const n = Number(cleanValue);

      formattedValue = formatCurrencyAmount(n, currency);

      if (hasTrailingDot && !formattedValue.includes('.')) {
        formattedValue = formattedValue + '.';
      }
    }

    setDisplayValue(formattedValue);
    handleChange(path, numericValue);

    if (computedFields?.length > 0) {
      computedFields.forEach(({ scope, fn }) => {
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
    if (schema.type === 'number' && selectedVal && currency !== true && format !== 'currency') {
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
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
        <CircularProgress />
      </div>
    );
  }

  // For currency fields, render custom TextField with currency icon
  if (currency === true || format === 'currency') {
    return (
      <div>
        <TextField
          label={label}
          value={displayValue}
          onChange={handleCurrencyChange}
          disabled={isLoading}
          required={required}
          error={errors && errors.length > 0}
          //helperText={description || ''}
          fullWidth
          variant="outlined"
          InputProps={{
            startAdornment: (
              <span style={{ marginRight: '8px', color: '#666' }}>{currencyIcon}</span>
            ),
          }}
        />
        {description && (
          <FormHelperText className="MuiFormHelperText-sizeMedium" sx={{ marginLeft: '14px' }}>
            {description}
          </FormHelperText>
        )}
        {errors && errors.length > 0 && (
          <FormHelperText
            error
            className="MuiFormHelperText-sizeMedium"
            sx={{ mt: 0.5, mx: 0, marginLeft: '14px' }}
          >
            {errors}
          </FormHelperText>
        )}
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
  and(isControl, optionIs('format', 'dynamicinput'))
);

// eslint-disable-next-line react-refresh/only-export-components
export const customCurrencyTester = rankWith(
  Number.MAX_VALUE + 1,
  and(isControl, optionIs('currency', true))
);

const CustomTextControlWrapper = withJsonFormsControlProps(CustomTextControl);

export default CustomTextControlWrapper;
