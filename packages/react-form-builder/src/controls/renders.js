import { materialCells, materialRenderers } from '@jsonforms/material-renderers';

import CustomHorizontalLayoutRenderer, {
  customHorizontalLayoutTester,
} from './CustomHorizontalLayout';
import CustomDateControl, { customDateTester } from './CustomDateControl';
import CustomGroupLayoutRenderer, { customGroupLayoutTester } from './CustomGroupLayout';
import CustomVerticalLayoutRenderer, { customVerticalLayoutTester } from './CustomVerticalLayout';

// Internal registry of custom renderers with IDs for configuration
const customRendererEntries = [
  { id: 'dateControl', tester: customDateTester, renderer: CustomDateControl },
  { id: 'groupLayout', tester: customGroupLayoutTester, renderer: CustomGroupLayoutRenderer },
  {
    id: 'verticalLayout',
    tester: customVerticalLayoutTester,
    renderer: CustomVerticalLayoutRenderer,
  },
  {
    id: 'horizontalLayout',
    tester: customHorizontalLayoutTester,
    renderer: CustomHorizontalLayoutRenderer,
  },
];

let enabledRendererIds = new Set(customRendererEntries.map((r) => r.id));
let additionalRenderers = [];

export function configureControls(options = {}) {
  const { enable, disable, add } = options;
  if (Array.isArray(enable) && enable.length) {
    enabledRendererIds = new Set(enable);
  }
  if (Array.isArray(disable) && disable.length) {
    disable.forEach((id) => enabledRendererIds.delete(id));
  }
  if (Array.isArray(add) && add.length) {
    // Each added entry should be { tester, renderer, id? }
    additionalRenderers = add.slice();
  }
}

export function getCells() {
  return [...materialCells];
}

export function getRenderers() {
  const activeCustoms = customRendererEntries
    .filter((r) => enabledRendererIds.has(r.id))
    .map(({ tester, renderer }) => ({ tester, renderer }));
  return [...materialRenderers, ...activeCustoms, ...additionalRenderers];
}

export const config = {
  // trim: true,
  restrict: true,
  hideRequiredAsterisk: false,
  showUnfocusedDescription: true,
};
