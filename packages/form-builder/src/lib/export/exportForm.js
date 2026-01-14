export const exportFormData = (exportData, onExport) => {
  const { schema, uischema, fields } = exportData;

  if (typeof onExport === 'function') {
    onExport({ schema, uiSchema: uischema, fields });
    return;
  }

  if (typeof document === 'undefined') {
    return;
  } // SSR guard
  const dataStr = JSON.stringify({ schema, uischema, fields }, null, 2);
  const link = document.createElement('a');
  link.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  link.download = 'form-config.json';
  link.click();
};
