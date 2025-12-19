import CustomFileUploadControl, {
  customFileUploadTester,
} from "./CustomFileUploadControl";
import CustomVerticalLayout, {
  customVerticalLayoutTester,
} from "./CustomVerticalLayout";
import CustomGroupLayout, { customGroupTester } from "./CustomGroupLayout";
import CustomHorizontalLayout, {
  customHorizontalLayoutTester,
} from "./CustomHorizontalLayout";
import CustomDateRenderer ,{customDateTester} from "./CustomDateRenderer"
// Export all custom renderers with their testers
export const customRenderers = [
  { tester: customFileUploadTester, renderer: CustomFileUploadControl },
  { tester: customGroupTester, renderer: CustomGroupLayout },
  { tester: customVerticalLayoutTester, renderer: CustomVerticalLayout },
  { tester: customHorizontalLayoutTester, renderer: CustomHorizontalLayout },
  { tester: customDateTester,  renderer:CustomDateRenderer}
];

// Export individual components for direct use if needed
export {
  CustomFileUploadControl,
  CustomVerticalLayout,
  CustomGroupLayout,
  CustomHorizontalLayout,
  CustomDateRenderer
};
