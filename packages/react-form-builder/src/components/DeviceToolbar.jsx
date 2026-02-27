import { IconRefresh, IconMaximize, IconMinimize } from '@tabler/icons-react';
import { Box, Select, MenuItem, TextField, IconButton, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const DeviceToolbar = ({
  selectedId,
  onChangeDevice,
  width,
  height,
  onChangeSize,
  onToggleOrientation,
  isFullscreen,
  setIsFullscreen,
  screenResolutions,
  responsiveState,
  toolbarVisibility = {},
}) => {
  const isResponsive = selectedId !== 'responsive';
  const { t } = useTranslation();
  const checkLength = (value) => {
    if (value !== '') {
      return Number(value) < 0 ? 1 : Number(value);
    }
  };
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
      {t('screen')}:{' '}
      <Select
        size="small"
        value={selectedId}
        onChange={(e) => onChangeDevice(e.target.value)}
        sx={{ minWidth: 160 }}
      >
        {screenResolutions
          .filter((item) => item.enabled)
          .map((d) => (
            <MenuItem key={d.id} value={d.id}>
              {d.label}
            </MenuItem>
          ))}
      </Select>
      <TextField
        type="number"
        size="small"
        disabled={isResponsive}
        value={width}
        inputProps={{ min: 1 }}
        onChange={(e) => {
          let width = checkLength(e.target.value);
          onChangeSize({ width, height });
        }}
        sx={{ width: 80 }}
      />
      <Box component="span">×</Box>
      <TextField
        type="number"
        size="small"
        disabled={isResponsive}
        value={height}
        inputProps={{ min: 1 }}
        onChange={(e) => {
          let height = checkLength(e.target.value);
          onChangeSize({ width, height });
        }}
        sx={{ width: 80 }}
      />
      {responsiveState.showRotateOption && (
        <Tooltip title={t('rotate')}>
          <IconButton onClick={onToggleOrientation} size="small">
            <IconRefresh size={24} />
          </IconButton>
        </Tooltip>
      )}
      {toolbarVisibility.showFullscreen !== false && (
        <Tooltip title={isFullscreen ? t('exitFullscreen') : t('fullscreen')}>
          <IconButton onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <IconMinimize /> : <IconMaximize />}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};
