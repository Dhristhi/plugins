import { rankWith, and, schemaMatches, uiTypeIs } from "@jsonforms/core";
import CustomGroupRenderer from "./CustomGroupRenderer";
import FileUploadControl from "./FileUploadControl";
import CustomHorizontalLayout, {
  customHorizontalLayoutTester,
} from "./CustomHorizontalLayout";

// Tester for file upload control
export const fileUploadTester = rankWith(
  5,
  and(
    schemaMatches(
      (schema) => schema?.type === "string" && schema?.format === "data-url"
    )
  )
);

// Tester for custom group renderer
export const customGroupTester = rankWith(10, uiTypeIs("Group"));

// Export all custom renderers with their testers
export const customRenderers = [
  { tester: fileUploadTester, renderer: FileUploadControl },
  { tester: customGroupTester, renderer: CustomGroupRenderer },
  { tester: customHorizontalLayoutTester, renderer: CustomHorizontalLayout },
];

// Export individual components for direct use if needed
export { CustomGroupRenderer, FileUploadControl, CustomHorizontalLayout };
