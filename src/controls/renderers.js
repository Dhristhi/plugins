import { rankWith, and, schemaMatches, uiTypeIs } from "@jsonforms/core";
import CustomGroupRenderer from "./CustomGroupRenderer";
import CustomSelectControl from "./CustomSelectControl";
import FileUploadControl from "./FileUploadControl";

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

// Tester for custom select control
export const customSelectTester = rankWith(5, uiTypeIs("Control"));

// Export all custom renderers with their testers
export const customRenderers = [
  { tester: fileUploadTester, renderer: FileUploadControl },
  { tester: customGroupTester, renderer: CustomGroupRenderer },
  { tester: customSelectTester, renderer: CustomSelectControl },
];

// Export individual components for direct use if needed
export { CustomGroupRenderer, FileUploadControl, CustomSelectControl };
