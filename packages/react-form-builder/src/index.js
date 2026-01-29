// Library entry: export the main builder component
import App from './App.jsx';
export { configureControls } from './controls/renders';
export { registerFieldTypes, getFieldTypes, getFieldTypeById } from './lib/registry/fieldRegistry';

export const FormBuilder = App;

export default FormBuilder;
