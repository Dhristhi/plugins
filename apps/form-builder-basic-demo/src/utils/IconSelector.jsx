import React, { useMemo, memo } from 'react';
import * as TablerIcons from '@tabler/icons-react';

const IconSelector = ({ value, onChange }) => {
  // Get all Tabler icons - cached
  const allIcons = useMemo(() => {
    const icons = [];
    Object.keys(TablerIcons).forEach((key) => {
      if (key.startsWith('Icon') && key !== 'IconProps') {
        const iconName = key.replace('Icon', '');
        icons.push({
          name: iconName,
          component: TablerIcons[key],
        });
      }
    });
    return icons.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const selectedIconObj = useMemo(
    () => allIcons.find((icon) => icon.name === value) || null,
    [allIcons, value]
  );

  return (
    <Autocomplete
      value={selectedIconObj}
      onChange={(event, newValue) => {
        onChange(newValue ? newValue.name : ''); // Returns just the name part (e.g., "Stars")
      }}
      options={allIcons}
      getOptionLabel={(option) => option.name}
      filterOptions={(options, { inputValue }) => {
        if (!inputValue) return options.slice(0, 50); // Show only first 50 initially
        const query = inputValue.toLowerCase();
        return options.filter((option) => option.name.toLowerCase().includes(query)).slice(0, 100); // Limit filtered results to 100
      }}
      renderOption={(props, option) => (
        <IconOption key={option.name} props={props} option={option} />
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Group Icon"
          placeholder="Search icons..."
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                {selectedIconObj && (
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                    {React.createElement(selectedIconObj.component, {
                      size: 18,
                    })}
                  </Box>
                )}
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
      ListboxProps={{
        style: { maxHeight: '300px' },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
        },
      }}
    />
  );
};

export default memo(IconSelector);
