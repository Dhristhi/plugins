import { motion } from 'framer-motion';
import MuiAvatar from '@mui/material/Avatar';
import { styled, useTheme } from '@mui/material/styles';

import getColors from '../utils/getColors';

function getColorStyle({ theme, color, type }) {
  const colors = getColors(theme, color);
  const { dark, light, main, contrastText } = colors;

  switch (type) {
    case 'filled':
      return {
        color: contrastText,
        background: main,
      };
    case 'outlined':
      return {
        color: main,
        border: '1px solid',
        borderColor: main,
        background: 'transparent',
      };
    case 'combined':
      return {
        color: dark,
        border: '1px solid',
        borderColor: dark,
        background: light,
      };
    default:
      return {
        color: dark,
        background: light,
      };
  }
}

function getSizeStyle(size) {
  switch (size) {
    case 'badge':
      return {
        border: '2px solid',
        fontSize: '0.675rem',
        width: 20,
        height: 20,
      };
    case 'xs':
      return {
        fontSize: '0.75rem',
        width: 24,
        height: 24,
      };
    case 'sm':
      return {
        fontSize: '0.875rem',
        width: 32,
        height: 32,
      };
    case 'lg':
      return {
        fontSize: '1.2rem',
        width: 52,
        height: 52,
      };
    case 'xl':
      return {
        fontSize: '1.5rem',
        width: 64,
        height: 64,
      };
    case 'xxl':
      return {
        fontSize: '2rem',
        width: 100,
        height: 100,
      };
    case 'md':
    default:
      return {
        fontSize: '1rem',
        width: 40,
        height: 40,
      };
  }
}

const AvatarStyle = styled(MuiAvatar, {
  shouldForwardProp: (prop) => prop !== 'color' && prop !== 'type' && prop !== 'size',
})(({ theme, color, type, size }) => ({
  ...getSizeStyle(size),
  ...getColorStyle({ theme, color, type }),
  ...(size === 'badge' && {
    borderColor: theme.palette.background.default,
  }),
}));

export const Avatar = ({ children, color = 'primary', type, size = 'md', ...others }) => {
  const theme = useTheme();

  return (
    <AvatarStyle
      theme={theme}
      color={color}
      type={type}
      size={size}
      animate={{ scale: 1 }}
      initial={{ scale: 0 }}
      component={motion.div}
      transition={{
        delay: 0.4,
        damping: 20,
        type: 'spring',
        stiffness: 260,
      }}
      {...others}
    >
      {children}
    </AvatarStyle>
  );
};
