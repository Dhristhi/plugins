import CustomFileUploadControl, {
  customFileUploadTester,
} from "./CustomFileUploadControl";
import CustomVerticalLayout, {
  customVerticalLayoutTester,
} from "./CustomVerticalLayout";

// Export all custom renderers with their testers
export const customRenderers = [
  { tester: customFileUploadTester, renderer: CustomFileUploadControl },
  { tester: customVerticalLayoutTester, renderer: CustomVerticalLayout },
];

// Export individual components for direct use if needed
export { CustomFileUploadControl, CustomVerticalLayout };
