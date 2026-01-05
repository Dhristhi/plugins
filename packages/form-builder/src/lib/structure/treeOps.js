export const findFieldById = (fieldsArray, id) => {
  for (const field of fieldsArray) {
    if (field.id === id) return field;
    if (field.children) {
      const found = findFieldById(field.children, id);
      if (found) return found;
    }
  }
  return null;
};

export const removeFieldById = (fieldsArray, id) => {
  for (let i = 0; i < fieldsArray.length; i++) {
    if (fieldsArray[i].id === id) {
      return fieldsArray.splice(i, 1)[0];
    }
    if (fieldsArray[i].children) {
      const removed = removeFieldById(fieldsArray[i].children, id);
      if (removed) return removed;
    }
  }
  return null;
};

export const insertFieldAfter = (fieldsArray, fieldToInsert, afterId, overData) => {
  if (overData?.parentId) {
    const parent = findFieldById(fieldsArray, overData.parentId);
    if (parent && (parent.isLayout || parent.type === 'array')) {
      if (!parent.children) parent.children = [];
      const insertIndex = overData.index !== undefined ? overData.index : parent.children.length;
      parent.children.splice(insertIndex, 0, fieldToInsert);
      fieldToInsert.parentId = parent.id;
      return true;
    }
  }

  for (let i = 0; i < fieldsArray.length; i++) {
    if (fieldsArray[i].id === afterId) {
      fieldsArray.splice(i + 1, 0, fieldToInsert);
      fieldToInsert.parentId = null;
      return true;
    }
    if (fieldsArray[i].children) {
      if (insertFieldAfter(fieldsArray[i].children, fieldToInsert, afterId, overData)) {
        return true;
      }
    }
  }
  return false;
};

export const getAllFieldIds = (fieldsArray) => {
  const ids = [];
  fieldsArray.forEach((field) => {
    ids.push(field.id);
    if (field.children) {
      ids.push(...getAllFieldIds(field.children));
    }
  });
  return ids;
};

export const updateFieldById = (fieldsArray, updatedField) => {
  return fieldsArray.map((field) => {
    if (field.id === updatedField.id) {
      return { ...updatedField };
    }
    if (field.children && field.children.length > 0) {
      const newChildren = updateFieldById(field.children, updatedField);
      const childrenChanged = newChildren !== field.children;
      return childrenChanged ? { ...field, children: newChildren } : field;
    }
    return field;
  });
};

export const moveField = (fieldsArray, fieldId, targetParentId, targetIndex) => {
  const fieldToMove = removeFieldById(fieldsArray, fieldId);
  if (!fieldToMove) return false;

  if (targetParentId) {
    const parent = findFieldById(fieldsArray, targetParentId);
    if (parent && (parent.isLayout || parent.type === 'array')) {
      if (!parent.children) parent.children = [];
      const insertIndex = Math.min(
        typeof targetIndex === 'number' ? targetIndex : parent.children.length,
        parent.children.length
      );
      parent.children.splice(insertIndex, 0, fieldToMove);
      fieldToMove.parentId = parent.id;
      return true;
    }
  } else {
    const insertIndex = Math.min(
      typeof targetIndex === 'number' ? targetIndex : fieldsArray.length,
      fieldsArray.length
    );
    fieldsArray.splice(insertIndex, 0, fieldToMove);
    fieldToMove.parentId = null;
    return true;
  }
  return false;
};

export const reorderFieldRelative = (fieldsArray, activeId, overId, overData) => {
  const activeField = findFieldById(fieldsArray, activeId);
  const overField = findFieldById(fieldsArray, overId);
  if (!activeField || !overField) return false;

  removeFieldById(fieldsArray, activeId);
  return insertFieldAfter(fieldsArray, activeField, overId, overData);
};
