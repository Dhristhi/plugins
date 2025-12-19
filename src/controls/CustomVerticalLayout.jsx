import { Grid } from "@mui/material";
import { JsonFormsDispatch } from "@jsonforms/react";
import { rankWith, uiTypeIs } from "@jsonforms/core";
import { withJsonFormsLayoutProps } from "@jsonforms/react";

const CustomVerticalLayoutRenderer = (props) => {
  const { uischema, schema, path, renderers, cells } = props;
  const layout = uischema.elements;

  return (
    <Grid container spacing={1}>
      {layout?.map((element, index) => (
        <Grid item xs={12} key={`${path}-${index}`} sx={{ marginBottom: 1 }}>
          <JsonFormsDispatch
            path={path}
            cells={cells}
            schema={schema}
            uischema={element}
            renderers={renderers}
            enabled={!schema.readOnly}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export const customVerticalLayoutTester = rankWith(
  3,
  uiTypeIs("VerticalLayout")
);

const CustomVerticalLayout = withJsonFormsLayoutProps(
  CustomVerticalLayoutRenderer
);

export default CustomVerticalLayout;
