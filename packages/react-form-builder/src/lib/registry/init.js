import { defaultFieldTypes } from '../../types';
import { initFieldRegistry } from './fieldRegistry';

export const bootstrapDefaultFieldTypes = () => initFieldRegistry(defaultFieldTypes);

export default bootstrapDefaultFieldTypes;
