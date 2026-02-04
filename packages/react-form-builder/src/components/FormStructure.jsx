import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import {
  IconGripVertical,
  IconBox,
  IconCube,
  IconLayoutRows,
  IconLayoutColumns,
  IconList,
  IconEdit,
  IconTarget,
  IconPlus,
  IconForms,
} from '@tabler/icons-react';
import { Fragment, useState } from 'react';
import * as TablerIcons from '@tabler/icons-react';
import { Box, Paper, Typography, Chip, useTheme, Button } from '@mui/material';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import ContextMenu from './ContextMenu';
import CommonHeader from './CommonHeader';
import ActionButtons from './ActionButtons';

// Sortable field component
const SortableFieldItem = ({
  field,
  level = 0,
  parentId,
  onFieldSelect,
  onAddFieldToLayout,
  onAddLayoutToContainer,
  moveField,
  deleteField,
  selectedField,
}) => {
  const { t } = useTranslation();
  const [contextMenu, setContextMenu] = useState(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    data: {
      type: 'structure-item',
      field: field,
      parentId: parentId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSelected = selectedField?.id === field.id;
  const isLayout = field.isLayout;
  const isGroup = field.type === 'group';
  const isArray = field.type === 'array';

  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const getFieldIcon = (theme) => {
    const iconProps = { size: 18, color: theme.palette.grey[600] };
    if (isGroup || field.type === 'object') {
      if (field.icon && TablerIcons[`Icon${field.icon}`]) {
        const CustomIcon = TablerIcons[`Icon${field.icon}`];
        return <CustomIcon {...iconProps} />;
      }
      return field.type === 'object' ? <IconCube {...iconProps} /> : <IconBox {...iconProps} />;
    }
    if (field.type === 'vertical-layout') return <IconLayoutRows {...iconProps} />;
    if (field.type === 'horizontal-layout') return <IconLayoutColumns {...iconProps} />;
    if (field.type === 'array') return <IconList {...iconProps} />;
    return <IconEdit {...iconProps} />;
  };

  // Paper
  const fieldPaperSx = (theme, { isSelected, isGroup, isArray, level }) => ({
    p: 2.5,
    mb: 1.5,
    ml: level * 2,
    cursor: 'pointer',
    border: isSelected
      ? `2px solid ${theme.palette.primary.main}`
      : isGroup
        ? `2px solid ${theme.palette.warning.main}`
        : isArray
          ? `2px solid ${theme.palette.info.main}`
          : `1px solid ${theme.palette.grey[200]}`,
    borderRadius: 2,
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    },
  });

  // Layout containers
  const rowBetweenSx = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minWidth: 0,
    gap: 1,
  };

  const rowStartSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  };

  // Drag handle
  const dragHandleSx = {
    cursor: 'grab',
    display: 'flex',
    alignItems: 'center',
    color: 'grey.400',
    '&:hover': { color: 'grey.500' },
    '&:active': { cursor: 'grabbing' },
  };

  // Icon container
  const fieldIconBoxSx = {
    minWidth: '20px',
    display: 'flex',
    alignItems: 'center',
  };

  // Field label
  const fieldLabelSx = (isLayout, isArray) => ({
    fontWeight: isLayout || isArray ? 'bold' : 'normal',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
    flex: 1,
  });

  // Layout / array chip
  const typeChipSx = (level) => ({
    fontSize: level > 2 ? '10px' : '12px',
    height: level > 2 ? 20 : 24,
    '& .MuiChip-label': {
      px: level > 2 ? 0.5 : 1,
    },
  });

  // Hidden chip
  const hiddenChipSx = {
    fontSize: '10px',
    height: 18,
    opacity: 0.7,
    '& .MuiChip-label': {
      px: 0.5,
    },
  };

  // Level chip
  const levelChipSx = {
    fontSize: '9px',
    height: 16,
    minWidth: 20,
    '& .MuiChip-label': {
      px: 0.5,
    },
  };

  // Children container
  const childrenContainerSx = {
    mt: 2,
    pl: 2,
    borderLeft: 2,
    borderColor: 'grey.300',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Paper
        elevation={isSelected ? 2 : 0}
        sx={(theme) => fieldPaperSx(theme, { isSelected, isGroup, isArray, level })}
        onClick={() => onFieldSelect(field)}
        onContextMenu={handleContextMenu}
      >
        <Box sx={rowBetweenSx}>
          <Box sx={rowStartSx}>
            <Box {...attributes} {...listeners} sx={dragHandleSx}>
              <IconGripVertical size={16} />
            </Box>
            <Box sx={fieldIconBoxSx}>{getFieldIcon(useTheme())}</Box>
            <Typography variant="subtitle2" sx={fieldLabelSx(isLayout, isArray)}>
              {field.uischema?.label || field.label}
            </Typography>
            {(isLayout || isArray) && (
              <Chip
                label={
                  isGroup || field.type === 'object'
                    ? t('group')
                    : field.type === 'array'
                      ? t('array')
                      : field.type === 'vertical-layout'
                        ? t('verticalLayout')
                        : field.type === 'horizontal-layout'
                          ? t('horizontalLayout')
                          : 'Layout'
                }
                size="small"
                color={
                  isGroup || field.type === 'object'
                    ? 'yellow'
                    : field.type === 'array'
                      ? 'info'
                      : 'primary'
                }
                variant="outlined"
                sx={typeChipSx(level)}
              />
            )}
            {field.required && (
              <Typography variant="caption" color="error">
                *
              </Typography>
            )}
            {field.uischema?.options?.hidden && (
              <Chip
                size="small"
                color="secondary"
                sx={hiddenChipSx}
                variant="outlined"
                label={t('hidden')}
              />
            )}
            {level > 0 && level <= 3 && (
              <Chip label={`L${level}`} size="small" variant="outlined" sx={levelChipSx} />
            )}
          </Box>

          <ActionButtons
            field={field}
            level={level}
            parentId={parentId}
            onFieldSelect={onFieldSelect}
            onAddFieldToLayout={onAddFieldToLayout}
            onAddLayoutToContainer={onAddLayoutToContainer}
            moveField={moveField}
            deleteField={deleteField}
          />
        </Box>

        {(isLayout || isArray) && field.children?.length > 0 && (
          <Box sx={childrenContainerSx}>
            <SortableContext
              items={field.children.map((child) => child.id)}
              strategy={verticalListSortingStrategy}
            >
              <DropZone parentId={field.id} index={0} accepts={['field', 'layout']} />
              {field.children.map((child, index) => (
                <Fragment key={child.id}>
                  <SortableFieldItem
                    field={child}
                    level={level + 1}
                    parentId={field.id}
                    onFieldSelect={onFieldSelect}
                    onAddFieldToLayout={onAddFieldToLayout}
                    onAddLayoutToContainer={onAddLayoutToContainer}
                    moveField={moveField}
                    deleteField={deleteField}
                    selectedField={selectedField}
                  />
                  <DropZone parentId={field.id} index={index + 1} accepts={['field', 'layout']} />
                </Fragment>
              ))}
            </SortableContext>
          </Box>
        )}

        {(isLayout || isArray) && (!field.children || field.children.length === 0) && (
          <DropZone
            parentId={field.id}
            index={0}
            accepts={['field', 'layout']}
            isEmpty
            onAddField={() => onAddFieldToLayout(field.id)}
          />
        )}
      </Paper>

      <ContextMenu
        contextMenu={contextMenu}
        onClose={handleCloseContextMenu}
        field={field}
        parentId={parentId}
        onFieldSelect={onFieldSelect}
        onAddFieldToLayout={onAddFieldToLayout}
        onAddLayoutToContainer={onAddLayoutToContainer}
        moveField={moveField}
        deleteField={deleteField}
      />
    </div>
  );
};

// Drop zone component
const DropZone = ({ parentId, index, accepts, isEmpty = false, onAddField }) => {
  const { t } = useTranslation();
  const { isOver, setNodeRef } = useDroppable({
    id: `drop-${parentId || 'root'}-${index}`,
    data: {
      parentId: parentId,
      index: index,
      accepts: [...accepts, 'structure-item'], // Accept both palette items and existing structure items
    },
  });

  // Drop zone container
  const dropZoneBoxSx = (isOver) => ({
    mt: 2,
    p: 4,
    border: isOver ? 2 : '2px dashed',
    borderColor: isOver ? 'primary.main' : 'grey.300',
    borderRadius: 3,
    textAlign: 'center',
    color: isOver ? 'primary.main' : 'grey.500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minHeight: 100,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      borderColor: 'primary.main',
      transform: 'translateY(-1px)',
    },
  });

  // Icon + label row
  const dropZoneHeaderSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 1,
  };

  // Header text
  const dropZoneTitleSx = {
    fontWeight: 500,
  };

  if (isEmpty) {
    return (
      <Box ref={setNodeRef} sx={dropZoneBoxSx(isOver)} onClick={onAddField}>
        <Box sx={dropZoneHeaderSx}>
          {isOver ? <IconTarget size={20} /> : <IconPlus size={20} />}
          <Typography variant="body2" sx={dropZoneTitleSx}>
            {isOver ? t('dropHere') : t('noFieldsYet')}
          </Typography>
        </Box>

        <Typography variant="caption" color="textSecondary">
          {isOver ? t('releaseToAdd') : t('dragFields')}
        </Typography>
      </Box>
    );
  }

  // Drop indicator container
  const compactDropZoneSx = (isOver) => ({
    minHeight: isOver ? 50 : 24,
    borderRadius: 1,
    transition: 'all 0.2s ease',
    margin: '8px 0',
    opacity: isOver ? 1 : 0.7,
    border: (theme) =>
      isOver ? `2px solid ${theme.palette.primary.main}` : `2px dashed ${theme.palette.grey[300]}`,
    borderColor: isOver ? 'primary.main' : 'grey.300',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    '&:hover': {
      opacity: 1,
      minHeight: 36,
      borderColor: 'primary.main',
    },
  });

  // Drop indicator text
  const compactDropZoneTextSx = (isOver) => ({
    color: isOver ? 'white' : 'grey.500',
    fontWeight: 500,
    fontSize: '11px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
  });

  return (
    <Box ref={setNodeRef} sx={compactDropZoneSx(isOver)}>
      <Typography variant="caption" sx={compactDropZoneTextSx(isOver)}>
        {isOver ? (
          <>
            <IconTarget size={14} /> {t('dropHere').toUpperCase()}
          </>
        ) : (
          <>
            <IconPlus size={14} /> {t('dropItemsHere')}
          </>
        )}
      </Typography>
    </Box>
  );
};

const FormStructure = ({
  fields,
  onFieldsChange,
  onFieldSelect,
  selectedField,
  onAddFieldToLayout,
  onAddLayoutToContainer,
  showFormPreview,
  setShowFormPreview,
  showSchemaEditor,
  setShowSchemaEditor,
  exportForm,
  onReset,
  hasOriginalSchema,
  onClearAll,
  propertiesDrawerOpen,
}) => {
  const { t } = useTranslation();
  const moveField = (fieldId, direction, parentId) => {
    const newFields = [...fields];

    const moveInArray = (array, targetId) => {
      const index = array.findIndex((f) => f.id === targetId);
      if (index === -1) return false;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= array.length) return false;

      // Swap elements
      [array[index], array[newIndex]] = [array[newIndex], array[index]];
      return true;
    };

    if (parentId) {
      // Find parent and move within its children
      const findAndMoveInChildren = (fieldsArray) => {
        for (const field of fieldsArray) {
          if (field.id === parentId && field.children) {
            return moveInArray(field.children, fieldId);
          }
          if (field.children && findAndMoveInChildren(field.children)) {
            return true;
          }
        }
        return false;
      };
      findAndMoveInChildren(newFields);
    } else {
      // Move in root level
      moveInArray(newFields, fieldId);
    }

    onFieldsChange(newFields);
  };

  const deleteField = (fieldId, parentId) => {
    const newFields = [...fields];

    const deleteFromArray = (array, targetId) => {
      const index = array.findIndex((f) => f.id === targetId);
      if (index !== -1) {
        array.splice(index, 1);
        return true;
      }
      return false;
    };

    if (parentId) {
      // Delete from parent's children
      const findAndDeleteFromChildren = (fieldsArray) => {
        for (const field of fieldsArray) {
          if (field.id === parentId && field.children) {
            return deleteFromArray(field.children, fieldId);
          }
          if (field.children && findAndDeleteFromChildren(field.children)) {
            return true;
          }
        }
        return false;
      };
      findAndDeleteFromChildren(newFields);
    } else {
      // Delete from root level
      deleteFromArray(newFields, fieldId);
    }

    onFieldsChange(newFields);
  };

  const nestedBox = {
    p: { xs: 1, sm: 2 },
    paddingBottom: hasOriginalSchema || fields.length > 0 ? '100px' : '0',
  };

  const actionBox = {
    position: 'fixed',
    bottom: 0,
    left: { xs: 0, md: 320 },
    right: propertiesDrawerOpen ? { xs: 0, sm: 400, md: 480 } : 0,
    width: 'auto',
    height: 64,
    backgroundColor: 'background.paper',
    borderTop: '1px solid',
    borderColor: 'grey.200',
    zIndex: (theme) => theme.zIndex.drawer - 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    px: 3,
  };

  return (
    <Box>
      <CommonHeader
        title={t('formDesign')}
        description={t('dragFieldsDescription')}
        icon={IconForms}
        showFormPreview={showFormPreview}
        setShowFormPreview={setShowFormPreview}
        showSchemaEditor={showSchemaEditor}
        setShowSchemaEditor={setShowSchemaEditor}
        exportForm={exportForm}
      />

      <Box sx={nestedBox}>
        {fields.length === 0 ? (
          <DropZone
            parentId={null}
            index={0}
            accepts={['field', 'layout']}
            isEmpty={true}
            onAddField={() => {
              // Could add a default field here if needed
            }}
          />
        ) : (
          <SortableContext
            items={fields.map((field) => field.id)}
            strategy={verticalListSortingStrategy}
          >
            <DropZone parentId={null} index={0} accepts={['field', 'layout']} />
            {fields.map((field, index) => (
              <Fragment key={field.id}>
                <SortableFieldItem
                  field={field}
                  level={0}
                  parentId={null}
                  onFieldSelect={onFieldSelect}
                  onAddFieldToLayout={onAddFieldToLayout}
                  onAddLayoutToContainer={onAddLayoutToContainer}
                  moveField={moveField}
                  deleteField={deleteField}
                  selectedField={selectedField}
                />
                <DropZone parentId={null} index={index + 1} accepts={['field', 'layout']} />
              </Fragment>
            ))}
          </SortableContext>
        )}
      </Box>

      {(hasOriginalSchema || fields.length > 0) && (
        <Box sx={actionBox}>
          {hasOriginalSchema ? (
            <Button onClick={onReset} variant="contained">
              {t('reset')}
            </Button>
          ) : (
            <Button onClick={onClearAll} variant="contained" color="error">
              {t('clearAll')}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default FormStructure;
