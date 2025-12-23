import { materialCells, materialRenderers } from '@jsonforms/material-renderers';

import CustomTextControl, { customTextTester, customCurrencyTester } from './CustomTextControl';
import CustomInfoAlert, { customInfoAlertTester } from './CustomInfoAlert';
import CustomLabelControl, { customLabelTester, customImageTester } from './CustomLabelControl';
import customSelectControl, { customSelectTester } from './CustomSelectControl';
import CustomDownloadFileControl, { customDownloadFileTester } from './CustomDownloadFileControl';
import CustomFileUploadControl, { customFileUploadTester } from './CustomFileUploadControl';

import ArrayLayoutRenderer, { customArrayLayoutTester } from './CustomArrayLayout';
import CustomGroupLayoutRenderer, { customGroupLayoutTester } from './CustomGroupLayout';
import CustomVerticalLayoutRenderer, { customVerticalLayoutTester } from './CustomVerticalLayout';
import CustomHorizontalLayoutRenderer, {
  customHorizontalLayoutTester,
} from './CustomHorizontalLayout';
import CustomAccordionGroupLayoutRenderer, {
  customAccordionGroupLayoutTester,
} from './CustomAccordionGroupLayout';

export const cells = [...materialCells];

export const renderers = [
  ...materialRenderers,
  { tester: customCurrencyTester, renderer: CustomTextControl },
  { tester: customTextTester, renderer: CustomTextControl },
  { tester: customLabelTester, renderer: CustomLabelControl },
  { tester: customImageTester, renderer: CustomLabelControl },
  { tester: customInfoAlertTester, renderer: CustomInfoAlert },
  { tester: customSelectTester, renderer: customSelectControl },
  { tester: customDownloadFileTester, renderer: CustomDownloadFileControl },
  { tester: customFileUploadTester, renderer: CustomFileUploadControl },

  { tester: customArrayLayoutTester, renderer: ArrayLayoutRenderer },
  { tester: customGroupLayoutTester, renderer: CustomGroupLayoutRenderer },
  { tester: customVerticalLayoutTester, renderer: CustomVerticalLayoutRenderer },
  { tester: customHorizontalLayoutTester, renderer: CustomHorizontalLayoutRenderer },
  { tester: customAccordionGroupLayoutTester, renderer: CustomAccordionGroupLayoutRenderer },
];

export const config = {
  // trim: true,
  restrict: true,
  hideRequiredAsterisk: false,
  showUnfocusedDescription: true,
};
