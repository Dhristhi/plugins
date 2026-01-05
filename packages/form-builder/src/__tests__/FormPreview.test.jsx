import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import FormPreview from '../components/FormPreview';

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
