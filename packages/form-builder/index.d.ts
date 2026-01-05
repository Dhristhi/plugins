export interface FormBuilderProps {
  /** Callback when schema or UI schema changes */
  onSchemaChange?: (schema: Record<string, any>, uiSchema: Record<string, any>) => void;
  /** Export callback; if provided, overrides default download behavior */
  onExport?: (payload: { schema: Record<string, any>; uiSchema: Record<string, any> }) => void;
  /** Pass a custom Material UI theme */
  theme?: any;
  /** Provide schemas to populate the template picker and load by id */
  schemas?: Array<{
    id: string;
    name: string;
    description?: string;
    schema: Record<string, any>;
  }>;
}

export const FormBuilder: (props: FormBuilderProps) => any;
export default FormBuilder;
