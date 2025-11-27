import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { defaultFieldTypes } from '../types';

const FormStructure = ({
  fields,
  onFieldsChange,
  onFieldSelect,
  selectedField,
  onAddFieldToLayout,
  onAddLayoutToContainer,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLayoutId, setSelectedLayoutId] = useState(null);

  const layoutTypes = defaultFieldTypes.filter((ft) => ft.isLayout);
  const fieldTypes = defaultFieldTypes.filter((ft) => !ft.isLayout);

  const handleAddMenuClick = (event, layoutId) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedLayoutId(layoutId);
  };

  const handleAddMenuClose = () => {
    setAnchorEl(null);
    setSelectedLayoutId(null);
  };

  const handleAddField = () => {
    if (selectedLayoutId) {
      onAddFieldToLayout(selectedLayoutId);
    }
    handleAddMenuClose();
  };

  const handleAddLayout = (layoutType) => {
    if (selectedLayoutId) {
      onAddLayoutToContainer(selectedLayoutId, layoutType);
    }
    handleAddMenuClose();
  };

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

  const renderField = (field, level = 0, parentId) => {
    const isSelected = selectedField?.id === field.id;
    const isLayout = field.isLayout;
    const isGroup = field.type === 'group';

    // Choose appropriate icon
    const getFieldIcon = () => {
      if (isGroup) return '📦';
      if (field.type === 'vertical-layout') return '📑';
      if (field.type === 'horizontal-layout') return '📊';
      return '📝';
    };

    const getBackgroundColor = () => {
      if (isGroup) return '#fff8e1'; // Light orange for groups
      if (isLayout) return '#f8f9fa'; // Light gray for layouts
      return 'white';
    };

    return (
      <Paper
        key={field.id}
        elevation={isSelected ? 3 : 1}
        sx={{
          p: 2,
          mb: 1,
          ml: level * 2,
          cursor: 'pointer',
          border: isSelected
            ? '2px solid #2196f3'
            : isGroup
            ? '2px solid #ff9800'
            : '1px solid #e0e0e0',
          backgroundColor: getBackgroundColor(),
          '&:hover': {
            backgroundColor: isGroup
              ? '#fff3e0'
              : isLayout
              ? '#e9ecef'
              : '#f5f5f5',
          },
        }}
        onClick={() => onFieldSelect(field)}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <Typography variant="body2" sx={{ minWidth: '20px' }}>
              {getFieldIcon()}
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: isLayout ? 'bold' : 'normal' }}
            >
              {field.label}
            </Typography>
            {isLayout && (
              <Chip
                label={isGroup ? 'Group' : field.uischema.type}
                size="small"
                color={isGroup ? 'warning' : 'primary'}
                variant="outlined"
              />
            )}
            {field.required && (
              <Typography variant="caption" color="error">
                *
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {isLayout && (
              <Tooltip title="Add field or layout">
                <IconButton
                  size="small"
                  onClick={(e) => handleAddMenuClick(e, field.id)}
                >
                  <AddIcon fontSize="small" />
                  <ExpandMoreIcon fontSize="small" sx={{ ml: -0.5 }} />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Edit field">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onFieldSelect(field);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Move up">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  moveField(field.id, 'up', parentId);
                }}
              >
                <ArrowUpIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Move down">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  moveField(field.id, 'down', parentId);
                }}
              >
                <ArrowDownIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteField(field.id, parentId);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Render children for layouts */}
        {isLayout && field.children && field.children.length > 0 && (
          <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid #e0e0e0' }}>
            {field.children.map((child) =>
              renderField(child, level + 1, field.id)
            )}
          </Box>
        )}

        {/* Show empty state for layouts without children */}
        {isLayout && (!field.children || field.children.length === 0) && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              border: '2px dashed #ccc',
              borderRadius: 1,
              textAlign: 'center',
              color: '#666',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onAddFieldToLayout(field.id);
            }}
          >
            <Typography variant="body2">Click + or drop fields here</Typography>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Box>
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" gutterBottom>
          Form Structure
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Drag fields and layouts to organize your form
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {fields.length === 0 ? (
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              border: '2px dashed #ccc',
              backgroundColor: '#f9f9f9',
            }}
          >
            <Typography variant="body2" color="textSecondary">
              No fields added yet. Start by adding fields from the palette.
            </Typography>
          </Paper>
        ) : (
          fields.map((field) => renderField(field))
        )}
      </Box>

      {/* Add Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleAddMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={handleAddField}>
          <ListItemIcon>
            <Typography>📝</Typography>
          </ListItemIcon>
          <ListItemText
            primary="Add Field"
            secondary="Add a form input field"
          />
        </MenuItem>

        <Divider />

        <MenuItem disabled>
          <ListItemText primary="Add Layout" secondary="Choose a layout type" />
        </MenuItem>

        {layoutTypes.map((layoutType) => (
          <MenuItem
            key={layoutType.id}
            onClick={() => handleAddLayout(layoutType)}
          >
            <ListItemIcon>
              <Typography>{layoutType.icon}</Typography>
            </ListItemIcon>
            <ListItemText
              primary={layoutType.label}
              secondary={
                layoutType.id === 'group'
                  ? 'Visual container with border'
                  : layoutType.id === 'vertical-layout'
                  ? 'Stack elements vertically'
                  : 'Arrange elements horizontally'
              }
            />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default FormStructure;
