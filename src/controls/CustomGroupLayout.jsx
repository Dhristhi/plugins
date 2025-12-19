import { Box, Grid, Stack, Typography } from "@mui/material";
import { JsonFormsDispatch, withJsonFormsLayoutProps } from "@jsonforms/react";
import { rankWith, uiTypeIs } from "@jsonforms/core";
import * as TablerIcons from "@tabler/icons-react";

const CustomGroupLayoutRenderer = (props) => {
  const { uischema, schema, path, renderers, cells, label } = props;
  const elements = uischema.elements;
  const iconName = uischema.icon;

  const IconComponent =
    iconName && TablerIcons[iconName] ? TablerIcons[iconName] : null;

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        backgroundColor: 'background.paper',
      }}
    >
      {(label || IconComponent) && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            mb: 2,
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {IconComponent && <IconComponent size={20} />}
          {label && (
            <Typography variant="subtitle1" fontWeight="medium">
              {label}
            </Typography>
          )}
        </Stack>
      )}
      <Grid container spacing={2}>
        {elements?.map((element, index) => (
          <Grid item xs={12} key={`${path}-${index}`}>
            <JsonFormsDispatch
              path={path}
              cells={cells}
              schema={schema}
              uischema={element}
              renderers={renderers}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export const customGroupTester = rankWith(4, uiTypeIs("Group"));

export default withJsonFormsLayoutProps(CustomGroupLayoutRenderer);
