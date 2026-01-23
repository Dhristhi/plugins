import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider, CssBaseline } from '@mui/material';

import defaultTheme from './theme';
import { initI18Instance } from './i18n';
import FormBuilder from './components/FormBuilder';
import { bootstrapDefaultFieldTypes } from './lib/registry/init';

export const App = ({
  onSave,
  onExport,
  schemas = [],
  theme: customTheme,
  defaultLanguage = 'en',
  selectedLanguage = 'en',
  translationResources = {},
}) => {
  bootstrapDefaultFieldTypes();

  const appliedTheme = customTheme || defaultTheme;
  const i18n = initI18Instance(translationResources, defaultLanguage);

  useEffect(() => {
    if (i18n && i18n.changeLanguage && selectedLanguage && i18n.language !== selectedLanguage) {
      i18n.changeLanguage(selectedLanguage);
    }
  }, [selectedLanguage, i18n]);

  return (
    <ThemeProvider theme={appliedTheme}>
      <CssBaseline />
      <I18nextProvider i18n={i18n}>
        <FormBuilder
          onSave={onSave}
          schemas={schemas}
          onExport={onExport}
          selectedLanguage={selectedLanguage}
        />
      </I18nextProvider>
    </ThemeProvider>
  );
};

export default App;
