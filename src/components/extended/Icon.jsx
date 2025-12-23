import React from 'react';
import { useTheme } from '@mui/material';

export const Icon = (props) => {
  const theme = useTheme();
  const { icon: IconComponent, gradient = false, ...otherProps } = props;

  if (!IconComponent) {
    return null;
  }

  return (
    <React.Fragment>
      {gradient && (
        <svg width={0} height={0}>
          <linearGradient
            x1='0'
            y1='0'
            x2='1'
            y2='1'
            id='icon-gradient-stroke'
            gradientTransform='rotate(35)'
          >
            <stop offset='0%' stopColor={theme.palette.gradient.stop1} />
            <stop offset='35%' stopColor={theme.palette.gradient.stop2} />
            <stop offset='70%' stopColor={theme.palette.gradient.stop3} />
            <stop offset='90%' stopColor={theme.palette.gradient.stop4} />
          </linearGradient>
        </svg>
      )}
      <IconComponent
        {...otherProps}
        strokeWidth={otherProps.stroke}
        style={{
          ...(otherProps.style || {}),
          fill: 'none',
          color: undefined,
          stroke: gradient ? 'url(#icon-gradient-stroke)' : otherProps.color || 'currentColor',
        }}
      />
    </React.Fragment>
  );
};
