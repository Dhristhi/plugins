import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { IconEye } from '@tabler/icons-react';
import CommonHeader from '../components/CommonHeader';

describe('CommonHeader', () => {
  it('renders title, description, and action buttons', () => {
    const setShowFormPreview = vi.fn();
    const setShowSchemaEditor = vi.fn();

    render(
      <CommonHeader
        title="Form Preview"
        description="Test your form and see how it will look to users"
        icon={IconEye}
        showFormPreview={false}
        setShowFormPreview={setShowFormPreview}
        showSchemaEditor={false}
        setShowSchemaEditor={setShowSchemaEditor}
        exportForm={() => {}}
      />
    );

    expect(screen.getByText('Form Preview')).toBeInTheDocument();
    expect(
      screen.getByText('Test your form and see how it will look to users')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /schema/i })).toBeInTheDocument();
  });
});
