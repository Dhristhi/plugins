import { useTheme } from '@emotion/react';
import * as icons from '@tabler/icons-react';
import { JsonFormsDispatch } from '@jsonforms/react';
import { rankWith, uiTypeIs } from '@jsonforms/core';
import { IconChevronDown } from '@tabler/icons-react';
import { withJsonFormsLayoutProps } from '@jsonforms/react';
import {
  Grid,
  Stack,
  Accordion,
  Typography,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import { Icon } from '../components/Icon';
import { Avatar } from '../components/Avatar';

const CustomAccordionGroupLayoutRenderer = (props) => {
  const theme = useTheme();

  const { uischema } = props;

  return (
    <Accordion sx={{ borderRadius: 0 }}>
      <AccordionSummary expandIcon={<IconChevronDown stroke={1.5} />}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ marginBottom: 1 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'grey.300',
              fontSize: '1.25rem',
              color: 'primary.contrastText',
              backgroundImage: `linear-gradient(95deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.primary.dark} 100%)`,
            }}
          >
            {uischema.icon && <Icon icon={icons[uischema.icon]} />}
          </Avatar>
          <Typography variant="h6" component="div" sx={{ mt: 2, fontWeight: 600 }}>
            {uischema.label}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        {uischema?.elements?.map((element, index) => (
          <Grid item xs={12} key={index} sx={{ marginTop: 4 }}>
            <JsonFormsDispatch {...props} uischema={element} key={index} />
          </Grid>
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const customAccordionGroupLayoutTester = rankWith(4, uiTypeIs('AccordionGroup'));

const CustomAccordionGroupLayout = withJsonFormsLayoutProps(CustomAccordionGroupLayoutRenderer);

export default CustomAccordionGroupLayout;
