import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import FormPreview from '../components/FormPreview';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        formPreview: 'Form Preview',
        testYourForm: 'Test your form and see how it will look to users',
        noFieldsAdded: 'No fields added yet. Start by adding fields from the palette.',
        validate: 'Validate',
        desktop: 'Desktop',
        tablet: 'Tablet',
        mobile: 'Mobile',
      };
      return translations[key] || key;
    },
    i18n: { resolvedLanguage: 'en', language: 'en' },
  }),
}));

describe('FormPreview', () => {
  it('shows empty state message when no fields are present', () => {
    const setShowFormPreview = vi.fn();
    const setShowSchemaEditor = vi.fn();

    render(
      <FormPreview
        formState={{ data: {}, schema: { properties: {} }, uischema: {} }}
        onDataChange={vi.fn()}
        showFormPreview={true}
        setShowFormPreview={setShowFormPreview}
        showSchemaEditor={false}
        setShowSchemaEditor={setShowSchemaEditor}
        exportForm={() => {}}
      />
    );

    expect(screen.getByText('Form Preview')).toBeInTheDocument();
    expect(
      screen.getByText('No fields added yet. Start by adding fields from the palette.')
    ).toBeInTheDocument();
  });
});
