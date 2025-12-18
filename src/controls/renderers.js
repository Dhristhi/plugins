import {
  rankWith,
  and,
  schemaMatches,
  uiTypeIs,
  scopeEndsWith,
} from "@jsonforms/core";
import CustomGroupRenderer from "./CustomGroupRenderer";
import FileUploadControl from "./FileUploadControl";
import CustomDateRenderer from "./CustomDateRenderer";

// Tester for file upload control
export const fileUploadTester = rankWith(
  5,
  and(
    schemaMatches(
      (schema) => schema?.type === "string" && schema?.format === "data-url"
    )
  )
);

export const dateTester = rankWith(
  5,
  and(
    schemaMatches(
      (schema) => schema?.type === "string" && schema?.format === "date"
    )
  )
);

// Tester for custom group renderer
export const customGroupTester = rankWith(10, uiTypeIs("Group"));

// Export all custom renderers with their testers
export const customRenderers = [
  { tester: fileUploadTester, renderer: FileUploadControl },
  { tester: customGroupTester, renderer: CustomGroupRenderer },
  { tester: dateTester, renderer: CustomDateRenderer },
];

// Export individual components for direct use if needed
export { CustomGroupRenderer, FileUploadControl, CustomDateRenderer };
