import { Grid } from '@mui/material';
import { JsonFormsDispatch } from '@jsonforms/react';
import { rankWith, uiTypeIs } from '@jsonforms/core';
import { withJsonFormsLayoutProps } from '@jsonforms/react';

const CustomHorizontalLayoutRenderer = (props) => {
  const { cells, config, path, renderers, schema, uischema } = props;
  const layout = uischema.elements;
  // Check for restrictMaxCell in uischema options first, then fall back to config
  const restrictMaxCell = uischema.options?.restrictMaxCell ?? config?.restrictMaxCell;

  return (
    <Grid container columnSpacing={2} sx={{ px: 2 }}>
      {layout?.map((element, index) => {
        return (
          <Grid
            item
            xs={12}
            sm={12}
            sx={{ marginBottom: 2 }}
            key={`${path}-${index}`}
            md={restrictMaxCell ? 6 : 4}
            lg={restrictMaxCell ? 6 : 4}
          >
            <JsonFormsDispatch
              path={path}
              cells={cells}
              schema={schema}
              uischema={element}
              renderers={renderers}
              enabled={!schema.readOnly}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const customHorizontalLayoutTester = rankWith(1000, uiTypeIs('HorizontalLayout'));

const CustomHorizontalLayout = withJsonFormsLayoutProps(CustomHorizontalLayoutRenderer);

export default CustomHorizontalLayout;
