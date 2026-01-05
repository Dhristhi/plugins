export const exportFormData = (exportData, onExport) => {
  const { schema, uischema, fields } = exportData;

  if (typeof onExport === 'function') {
    onExport({ schema, uiSchema: uischema });
    return;
  }

  const dataStr = JSON.stringify({ schema, uischema, fields }, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', 'form-config.json');
  linkElement.click();
};
