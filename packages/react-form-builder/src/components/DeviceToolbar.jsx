import { IconRefresh, IconMaximize, IconMinimize } from '@tabler/icons-react';
import { Box, Select, MenuItem, TextField, IconButton, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const DEVICE_PRESETS = [
  { id: 'responsive', label: 'Responsive', width: 1400, height: 800 },
  { id: 'iphone-se', label: 'iPhone SE', width: 375, height: 667 },
  { id: 'iphone-xr', label: 'iPhone XR', width: 414, height: 896 },
  { id: 'iphone-12-pro', label: 'iPhone 12 Pro', width: 390, height: 844 },
  { id: 'iphone-14-pro-max', label: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { id: 'pixel-7', label: 'Pixel 7', width: 412, height: 915 },
  { id: 'samsung-galaxy-s8-plus', label: 'Samsung Galaxy S8+', width: 360, height: 740 },
  { id: 'samsung-s20-ultra', label: 'Samsung Galaxy S20 Ultra', width: 412, height: 915 },
  { id: 'ipad-mini', label: 'iPad Mini', width: 768, height: 1024 },
  { id: 'ipad-air', label: 'iPad Air', width: 820, height: 1180 },
  { id: 'ipad-pro', label: 'iPad Pro', width: 1024, height: 1366 },
  { id: 'surface-pro-7', label: 'Surface Pro 7', width: 912, height: 1368 },
  { id: 'surface-duo', label: 'Surface Duo', width: 540, height: 720 },
  { id: 'galaxy-z-fold-5', label: 'Galaxy Z Fold 5', width: 344, height: 882 },
  { id: 'asus-zenbook-fold', label: 'Asus Zenbook Fold', width: 853, height: 1280 },
  { id: 'samsung-galaxy-a51-71', label: 'Samsung Galaxy A51/71', width: 412, height: 914 },
  { id: 'nest-hub', label: 'Nest Hub', width: 1024, height: 600 },
  { id: 'nest-hub-max', label: 'Nest Hub Max', width: 1280, height: 800 },
  { id: 'hd-720p', label: 'HD 720p', width: 1280, height: 720 },
  { id: 'full-hd-1080p', label: 'Full HD 1080p', width: 1920, height: 1080 },
];
export const DeviceToolbar = ({
  selectedId,
  onChangeDevice,
  width,
  height,
  onChangeSize,
  onToggleOrientation,
  isFullscreen,
  setIsFullscreen,
}) => {
  const isResponsive = selectedId !== 'responsive';
  const { t } = useTranslation();
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
      Screen:{' '}
      <Select
        size="small"
        value={selectedId}
        onChange={(e) => onChangeDevice(e.target.value)}
        sx={{ minWidth: 160 }}
      >
        {DEVICE_PRESETS.map((d) => (
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
        onChange={(e) => onChangeSize({ width: Number(e.target.value), height })}
        sx={{ width: 80 }}
      />
      <Box component="span">×</Box>
      <TextField
        type="number"
        size="small"
        disabled={isResponsive}
        value={height}
        onChange={(e) => onChangeSize({ width, height: Number(e.target.value) })}
        sx={{ width: 80 }}
      />
      <Tooltip title={t('rotate')}>
        <IconButton onClick={onToggleOrientation} size="small">
          <IconRefresh size={24} />
        </IconButton>
      </Tooltip>
      <Tooltip title={isFullscreen ? t('exitFullscreen') : t('fullscreen')}>
        <IconButton onClick={() => setIsFullscreen(!isFullscreen)}>
          {isFullscreen ? <IconMinimize /> : <IconMaximize />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};
