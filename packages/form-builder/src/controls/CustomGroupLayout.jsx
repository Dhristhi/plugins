import * as icons from "@tabler/icons-react";
import { JsonFormsDispatch } from "@jsonforms/react";
import { rankWith, uiTypeIs } from "@jsonforms/core";
import { withJsonFormsLayoutProps } from "@jsonforms/react";
import { Box, Grid, Stack, Typography } from "@mui/material";

import { Icon } from "../components/extended/Icon";

const CustomGroupLayoutRenderer = (props) => {
  const { label, uischema } = props;

  const margin = uischema?.elements[0]?.elements?.[0]?.options?.detail ? 0 : 2;
  const removeExtraMargin =
    uischema?.elements[0]?.elements?.[0]?.options?.removeExtraMargin;

  return (
    <Grid container>
      <Grid item xs={12}>
        <Box bgcolor="background.paper" borderRadius={1}>
          <Stack
            alignItems="flex-end"
            direction="row"
            mb={removeExtraMargin ? 0 : margin}
            padding={2}
          >
            {uischema.icon && <Icon icon={icons[uischema.icon]} />}
            <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 500 }}>
              {label}
            </Typography>
          </Stack>
          {uischema?.elements?.map((element, index) => (
            <Grid item xs={12} key={index} sx={{ mx: 6, mb: 0 }}>
              <JsonFormsDispatch
                {...props}
                uischema={element}
                type={"Group"}
                key={index}
              />
            </Grid>
          ))}
        </Box>
      </Grid>
    </Grid>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const customGroupLayoutTester = rankWith(4, uiTypeIs("GroupWithIcon"));

const CustomGroupLayout = withJsonFormsLayoutProps(CustomGroupLayoutRenderer);

export default CustomGroupLayout;
