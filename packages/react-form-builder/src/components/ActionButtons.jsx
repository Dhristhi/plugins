import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
} from '@mui/material';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconChevronDown,
  IconArrowUp,
  IconArrowDown,
} from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { defaultFieldTypes } from '../types';

const ActionButtons = ({
  field,
  level,
  parentId,
  onFieldSelect,
  onAddFieldToLayout,
  onAddLayoutToContainer,
  moveField,
  deleteField,
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isLayout = field.isLayout;
  const layoutTypes = defaultFieldTypes.filter((ft) => ft.isLayout && ft.id !== 'object');

  const handleMoreClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleAddClick = (event) => {
    event.stopPropagation();
    setAddMenuAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setAddMenuAnchor(null);
  };

  const handleAddField = () => {
    onAddFieldToLayout(field.id);
    handleClose();
  };

  const handleAddLayout = (layoutType) => {
    onAddLayoutToContainer(field.id, layoutType);
    handleClose();
  };
  const openDeleteConfirm = (e) => {
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setConfirmOpen(false);
  };

  const confirmDelete = () => {
    deleteField(field.id, parentId);
    setConfirmOpen(false);
    handleClose();
  };

  const styles = {
    mainBox: {
      display: 'flex',
      gap: 0.25,
      flexShrink: 0,
    },

    actionContainer: (level) => ({
      display: 'flex',
      gap: level > 1 ? 0.25 : 0.5,
      flexShrink: 0,
      alignItems: 'center',
    }),

    iconButtonBase: (level) => ({
      p: level > 1 ? 0.25 : 0.5,
    }),

    successButton: (level) => ({
      ...styles.iconButtonBase(level),
      color: 'success.main',
      '&:hover': {
        color: 'success.dark',
        backgroundColor: 'success.light',
      },
    }),

    primaryButton: (level) => ({
      ...styles.iconButtonBase(level),
      color: 'primary.main',
      '&:hover': {
        color: 'primary.dark',
        backgroundColor: 'primary.light',
      },
    }),

    greyButton: (level) => ({
      ...styles.iconButtonBase(level),
      color: 'grey.500',
      '&:hover': {
        color: 'grey.600',
        backgroundColor: 'grey.100',
      },
    }),

    errorButton: (level) => ({
      ...styles.iconButtonBase(level),
      color: 'error.main',
      '&:hover': {
        color: 'error.dark',
        backgroundColor: 'error.light',
      },
    }),

    minimalGreyButton: {
      p: 0.25,
      color: 'grey.500',
      '&:hover': {
        color: 'primary.main',
        backgroundColor: 'grey.100',
      },
    },
  };

  // For deep nesting (level > 2), show minimal buttons
  if (level > 2) {
    return (
      <Box sx={styles.mainBox}>
        <Tooltip title={t('moreOptions')}>
          <IconButton size="small" onClick={handleMoreClick} sx={styles.minimalGreyButton}>
            <IconDotsVertical size={16} />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          MenuListProps={{ dense: true }}
        >
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              onFieldSelect(field, true);
              handleClose();
            }}
          >
            <ListItemIcon>
              <IconEdit size={18} />
            </ListItemIcon>
            <ListItemText primary={t('edit')} />
          </MenuItem>

          {isLayout && (
            <MenuItem onClick={handleAddField}>
              <ListItemIcon>
                <IconPlus size={18} />
              </ListItemIcon>
              <ListItemText primary={t('addField')} />
            </MenuItem>
          )}

          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              moveField(field.id, 'up', parentId);
              handleClose();
            }}
          >
            <ListItemIcon>
              <IconArrowUp size={18} />
            </ListItemIcon>
            <ListItemText primary={t('moveUp')} />
          </MenuItem>

          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              moveField(field.id, 'down', parentId);
              handleClose();
            }}
          >
            <ListItemIcon>
              <IconArrowDown size={18} />
            </ListItemIcon>
            <ListItemText primary={t('moveDown')} />
          </MenuItem>

          <Divider />

          <MenuItem onClick={openDeleteConfirm} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <IconTrash size={18} color={(theme) => theme.palette.error.main} />
            </ListItemIcon>
            <ListItemText primary={t('delete')} />
          </MenuItem>
        </Menu>
        {/* Delete Confirmation Dialog */}
        <Dialog open={confirmOpen} onClose={closeDeleteConfirm} maxWidth="xs" fullWidth>
          <DialogTitle>{t('deleteConfirm')}</DialogTitle>
          <DialogActions>
            <Button onClick={closeDeleteConfirm}>{t('cancel')}</Button>
            <Button variant="contained" color="error" onClick={confirmDelete}>
              {t('delete')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  const iconContainerSx = {
    display: 'flex',
    alignItems: 'center',
  };

  // For shallower nesting, show more buttons
  return (
    <Box sx={styles.actionContainer(level)}>
      {isLayout && (
        <Tooltip title={t('addFieldOrLayout')}>
          <IconButton size="small" onClick={handleAddClick} sx={styles.successButton(level)}>
            <Box sx={iconContainerSx}>
              <IconPlus size={level > 1 ? 16 : 18} />
              <IconChevronDown size={level > 1 ? 12 : 14} />
            </Box>
          </IconButton>
        </Tooltip>
      )}

      <Tooltip title={t('edit')}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onFieldSelect(field, true);
          }}
          sx={styles.primaryButton(level)}
        >
          <IconEdit size={level > 1 ? 16 : 18} />
        </IconButton>
      </Tooltip>

      <Tooltip title={t('moreOptions')}>
        <IconButton size="small" onClick={handleMoreClick} sx={styles.greyButton(level)}>
          <IconDotsVertical size={level > 1 ? 16 : 18} />
        </IconButton>
      </Tooltip>

      <Tooltip title={t('delete')}>
        <IconButton size="small" onClick={openDeleteConfirm} sx={styles.errorButton(level)}>
          <IconTrash size={level > 1 ? 16 : 18} />
        </IconButton>
      </Tooltip>

      {/* Add Menu */}
      <Menu
        anchorEl={addMenuAnchor}
        open={Boolean(addMenuAnchor)}
        onClose={handleClose}
        MenuListProps={{
          dense: true,
        }}
      >
        <MenuItem onClick={handleAddField}>
          <ListItemIcon>
            <IconEdit size={18} color={(theme) => theme.palette.primary.main} />
          </ListItemIcon>
          <ListItemText primary={t('addField')} secondary={t('addFormInput')} />
        </MenuItem>

        <Divider />

        {layoutTypes.map((layoutType) => (
          <MenuItem key={layoutType.id} onClick={() => handleAddLayout(layoutType)}>
            <ListItemIcon>
              {React.createElement(layoutType.icon, {
                size: 18,
                color: (theme) => theme.palette.grey[500],
              })}
            </ListItemIcon>
            <ListItemText
              primary={layoutType.labelKey ? t(layoutType.labelKey) : layoutType.label}
              secondary={
                layoutType.id === 'group'
                  ? t('containerWithBorder')
                  : layoutType.id === 'vertical-layout'
                    ? t('stackVertically')
                    : t('arrangeHorizontally')
              }
            />
          </MenuItem>
        ))}
      </Menu>

      {/* More Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        MenuListProps={{
          dense: true,
        }}
      >
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            moveField(field.id, 'up', parentId);
            handleClose();
          }}
        >
          <ListItemIcon>
            <IconArrowUp size={18} />
          </ListItemIcon>
          <ListItemText primary={t('moveUp')} />
        </MenuItem>

        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            moveField(field.id, 'down', parentId);
            handleClose();
          }}
        >
          <ListItemIcon>
            <IconArrowDown size={18} />
          </ListItemIcon>
          <ListItemText primary={t('moveDown')} />
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={closeDeleteConfirm} maxWidth="xs" fullWidth>
        <DialogTitle>{t('deleteConfirm')}</DialogTitle>
        <DialogActions>
          <Button onClick={closeDeleteConfirm}>{t('cancel')}</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActionButtons;
